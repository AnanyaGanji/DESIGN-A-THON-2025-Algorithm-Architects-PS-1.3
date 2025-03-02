const crypto = require("crypto");
const mongoose = require("mongoose");
const BlockModel = require("../models/BlockChainSchema.js");

class Block {
  constructor(index, previousHash, fileHash, timestamp, nonce = 0) {
    this.index = index;
    this.previousHash = previousHash;
    this.fileHash = fileHash.toLowerCase(); // 🔹 Normalize hash for consistency
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.currentHash = this.computeHash();
  }

  computeHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.fileHash +
          this.timestamp +
          this.nonce
      )
      .digest("hex");
  }

  mineBlock(difficulty) {
    while (!this.currentHash.startsWith("0".repeat(difficulty))) {
      this.nonce++;
      this.currentHash = this.computeHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2; // 🔹 Reduced difficulty for better performance
  }

  async createGenesisBlock() {
    const existingBlocks = await BlockModel.countDocuments();
    if (existingBlocks === 0) {
      const genesisBlock = new Block(0, "0", "GENESIS_BLOCK", Date.now());
      genesisBlock.mineBlock(this.difficulty);
      this.chain.push(genesisBlock);
      await this.saveBlock(genesisBlock);
    }
  }

  async addBlock(fileHash) {
    console.log(`📝 Storing file hash in blockchain: ${fileHash}`); // Debugging log
    const lastBlock = await BlockModel.findOne().sort({ index: -1 }); // 🔹 Get latest block from DB
    const newBlock = new Block(
      lastBlock ? lastBlock.index + 1 : 1,
      lastBlock ? lastBlock.currentHash : "0",
      fileHash,
      Date.now()
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);

    // 🔹 Store block in MongoDB
    await this.saveBlock(newBlock);
    console.log("✅ New Block Stored:", newBlock);
    return newBlock;
  }

  async saveBlock(block) {
    const blockData = new BlockModel({
      index: block.index,
      previousHash: block.previousHash,
      fileHash: block.fileHash,
      timestamp: block.timestamp,
      nonce: block.nonce,
      currentHash: block.currentHash,
    });
    await blockData.save();
  }

  async verifyIntegrity(fileHash) {
    fileHash = fileHash.toLowerCase(); // 🔹 Normalize hash before checking
    console.log(`🔍 Searching for fileHash in blockchain: ${fileHash}`); // Debugging log
    const block = await BlockModel.findOne({ fileHash });
    console.log("🔍 Blockchain Query Result:", block); // Debugging log
    // return !!block; // Returns true if file hash exists
    return block ? true : false;
  }

  async getAllBlocks() {
    return await BlockModel.find().sort({ index: 1 }); // 🔹 Retrieve full blockchain from DB
  }
}

module.exports = Blockchain;