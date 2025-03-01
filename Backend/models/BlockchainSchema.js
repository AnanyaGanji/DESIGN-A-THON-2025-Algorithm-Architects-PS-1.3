const mongoose = require("mongoose");
const BlockSchema = new mongoose.Schema({
  index: Number,
  previousHash: String,
  fileHash: String,
  timestamp: Number,
  nonce: Number,
  currentHash: String,
});

const BlockModel = mongoose.model("Block", BlockSchema);
module.exports = BlockModel;
