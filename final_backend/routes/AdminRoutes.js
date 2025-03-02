const express = require("express");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const { Storage } = require("@google-cloud/storage");
const File=require("../models/FileSchema");
const AdminDetails=require("../models/AdminSchema");
const AuditLog = require("../models/audit_logs");
const Blockchain = require("../blockchain_modules/blockchain");
require("dotenv").config();

const router = express.Router();
const blockchain = new Blockchain();

// Configure Multer for memory storage (no local file saving)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Cloud Storage
const storage = new Storage({ keyFilename: process.env.GOOGLE_CLOUD_KEYFILE });
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

// Static AES-256 Encryption Key (Use .env for security)
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex") || crypto.randomBytes(32);

// Function to Encrypt File Data
function encryptBuffer(buffer) {
    console.log(
        "🔹 First 20 Bytes Before Encryption:",
        buffer.slice(0, 20).toString("hex")
      ); // Debug
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
    cipher.setAutoPadding(true); // ✅ Ensure correct padding is used
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { encryptedData: encrypted, iv: iv.toString("hex") };
}

// Helper function to generate SHA-256 hash of a file buffer
function computeFileHash(buffer) {
    console.log(
      "🔹 First 20 Bytes Before Hashing:",
      buffer.slice(0, 20).toString("hex")
    ); // Debug
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

// 📌 1️⃣ **Upload & Secure File (Google Cloud + Blockchain)**
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  
      const { uploaderId} = req.body; // Owner ID should be provided in request
  
      if (!uploaderId)
        return res.status(400).json({ error: "Uploader ID is required." });
      
      console.log(`Received file: ${req.file.originalname}`);
      console.log(`Uploader ID: ${uploaderId}`);

      // 🔹 Encrypt file buffer
      // const { encryptedData, iv } = encryptBuffer(req.file.buffer);
  
      console.log(
        "🔹 First 20 Bytes of Original File Buffer:",
        req.file.buffer.slice(0, 20).toString("hex")
      );
  
      // 🔹 Compute SHA-256 hash for integrity check
      // const fileHash = computeFileHash(encryptedData);
      const fileHash = computeFileHash(req.file.buffer); // ✅ Hashing before encryption
      const { encryptedData, iv } = encryptBuffer(req.file.buffer);
  
    //   console.log(`🔹 Original File Buffer Length: ${req.file.buffer.length}`);
    //   console.log(
    //     `🔹 Encrypted File Buffer Length Before Upload: ${encryptedData.length}`
    //   );
    //   console.log(`🔹 Hash Computed Before Upload: ${fileHash}`);
  
      // 🔹 Store hash in blockchain (FIXED: Added `await`)
      const newBlock = await blockchain.addBlock(fileHash);
      console.log(`Blockchain block added: ${newBlock.currentHash}`);
  
      // 🔹 Define unique file name in GCS
      const fileName = `enc_${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);
  
      // 🔹 Upload encrypted file to Google Cloud Storage
      await file.save(encryptedData, { contentType: req.file.mimetype });
  
      console.log(`File uploaded to GCS: ${fileName}`);
  
      // 🔹 Store file hash in blockchain
      // blockchain.addBlock(fileHash);
  
      // 🔹 Create File Metadata in MongoDB
      const newFile = new File({
        originalName: req.file.originalname,
        storedName: fileName,
        encryptionIV: iv,
        uploaderId: uploaderId,
        uploadTimestamp: new Date(),
        mimeType: req.file.mimetype,
        storageUrl: `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET}/${fileName}`,
        // blockchainHash: newBlock.currentHash,
        blockchainHash: newBlock.fileHash,
      });
  
      await newFile.save();
      console.log("✅ File metadata saved in MongoDB:", newFile);
  
      // 🔹 Fetch previous log's hash (for blockchain-style audit logging)
      const lastLog = await AuditLog.findOne().sort({ timestamp: -1 });
      const prevHash = lastLog ? lastLog.currentHash : "GENESIS_HASH";
  
      // 🔹 Compute hash for the audit log entry
      const currentHash = computeFileHash(prevHash + fileHash);
  
      // 🔹 Create a new audit log entry
      const auditLogEntry = new AuditLog({
        userId: uploaderId,
        action: "upload",
        fileHash,
        prevHash,
        currentHash,
      });
  
      await auditLogEntry.save();
      console.log("✅ Audit log recorded:", auditLogEntry);
  
      res.status(200).json({
        message: "File uploaded securely!",
        fileId: newFile._id,
        downloadUrl: newFile.storageUrl,
        blockchainHash: newBlock.fileHash, // ✅ Store the actual file hash
        // blockchainHash: newBlock.currentHash, // Return stored blockchain hash for verification
      });
    } catch (error) {
      console.error("File upload error:", error);
      res
        .status(500)
        .json({ error: "Error uploading file.", details: error.message });
    }
});
function decryptBuffer(encryptedBuffer, iv) {
    try {
      console.log(`🔹 Decryption IV: ${iv}`); // Log IV
      const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        SECRET_KEY,
        Buffer.from(iv, "hex")
      );
      decipher.setAutoPadding(true); // ✅ Ensure correct padding is handled
      const decrypted = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final(),
      ]);
      console.log(
        `✅ Decryption Success! First 20 Bytes: ${decrypted
          .slice(0, 20)
          .toString("hex")}`
      );
      console.log(`🔹 Decrypted File Buffer Length: ${decrypted.length}`);
      return decrypted;
    } catch (error) {
      console.error("❌ Decryption Error:", error);
      return null;
    }
  }
  
  function verifyFileHash(originalBuffer, blockchainHash) {
    const computedHash = computeFileHash(originalBuffer);
    console.log(`🔹 Hash Computed from Original Buffer: ${computedHash}`);
    console.log(`🔹 Expected Blockchain Hash: ${blockchainHash}`);
    return computedHash === blockchainHash;
  }
  
router.post("/verify", async (req, res) => {
    try {
      const { fileId } = req.body;
      if (!fileId) return res.status(400).json({ error: "File ID is required." });
  
      // 🔹 Find file metadata in MongoDB
      const file = await File.findById(fileId);
      if (!file) return res.status(404).json({ error: "File not found." });
  
      console.log(`🔎 Found File in DB: ${file.originalName}`);
      console.log(`🔍 Expected Blockchain Hash: ${file.blockchainHash}`);
  
      // 🔹 Download the encrypted file from Google Cloud Storage
      const fileRef = bucket.file(file.storedName);
      const [encryptedFileBuffer] = await fileRef.download();
      console.log(
        `🔹 Encrypted File Buffer Length from GCS: ${encryptedFileBuffer.length}`
      );
  
      // 🔹 Decrypt the file
      const decryptedFileBuffer = decryptBuffer(
        encryptedFileBuffer,
        file.encryptionIV
      );
  
      // 🔹 Verify the file hash before checking blockchain
      const isHashValid = verifyFileHash(
        decryptedFileBuffer,
        file.blockchainHash
      );
  
      // 🔹 Verify file hash in blockchain
      const isValidOnBlockchain = await blockchain.verifyIntegrity(
        file.blockchainHash
      );
      console.log(`🔍 Blockchain verification result:`, isValidOnBlockchain);
  
      console.log(
        "🔹 First 20 Bytes of Encrypted Buffer:",
        encryptedFileBuffer.slice(0, 20).toString("hex")
      );
      console.log(
        "🔹 First 20 Bytes of Decrypted Buffer:",
        decryptedFileBuffer.slice(0, 20).toString("hex")
      );
  
      res.json({
        fileId: fileId,
        computedHash: computeFileHash(decryptedFileBuffer),
        expectedHash: file.blockchainHash,
        isValidFile: isHashValid,
        isValidBlockchain: isValidOnBlockchain,
      });
    } catch (error) {
      console.error("File verification error:", error);
      res
        .status(500)
        .json({ error: "Error verifying file.", details: error.message });
    }
});

//router to get all files related with uploaderId
router.get("/:uploaderId", async (req, res) => {
    try {
        const { uploaderId } = req.params;
        const files = await File.find({ uploaderId });

        res.status(200).json(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Error fetching files." });
    }
});

router.post("/share/:fileId", async (req, res) => {
    try {
      const { fileId}=req.params;
      const {sharedUserIds } = req.body;
  
      if (!fileId || !sharedUserIds) {
        return res
          .status(400)
          .json({ error: "fileId, ownerId, and sharedUserIds are required." });
      }
  
      // 🔹 Find the file
      const file = await File.findById(fileId);
      if (!file) return res.status(404).json({ error: "File not found." });
  
      // 🔹 Ensure requester is the owner
      if (!file.uploaderId) {
        return res.status(403).json({ error: "Only the uploader can share the file." });
      }
      // 🔹 Add users to `sharedWith` list if not already present
      const updatedFile = await File.findByIdAndUpdate(
        fileId,
        { $addToSet: { sharedWith: { $each: sharedUserIds } } }, // Prevents duplicate entries
        { new: true }
       );

        // 🔹 Find user IDs based on emails
        const sharedUsers = await AdminDetails.find({ email: { $in: sharedUserIds } }, '_id');

        const sharedUserId = sharedUsers.map(user => user._id);
        await AdminDetails.updateMany(
            { _id: { $in: sharedUserId } },
            { $addToSet: { files: fileId } } // Adds fileId to their `files` array
        );
     // 🔹 Update each user's `filesAccessed`
       await AdminDetails.updateMany(
        { email: { $in: sharedUserIds } }, // Find users by email
        { $addToSet: { filesAccessed: fileId } } // Add fileId to their `filesAccessed`
        
    );

    res.status(200).json({ message: "File shared successfully!", file: updatedFile });
    } catch (error) {
       console.error("File sharing error:", error);
       res
       .status(500)
       .json({ error: "Error sharing file.", details: error.message });
    }
});
// 📌 4️⃣ **Download a File (With Access Check)**
router.get("/download/:fileId/:userId", async (req, res) => {
    try {
      const { fileId, userId } = req.params;
  
      // 🔹 Find the file
      const file = await File.findById(fileId);
      if (!file) return res.status(404).json({ error: "File not found." });
  
      // 🔹 Check if user is authorized
      if (
        file.uploaderId.toString() !== userId &&
        !file.sharedWith.includes(userId)
      ) {
        return res.status(403).json({ error: "Access denied." });
      }
  
      // 🔹 Return download link
      res.status(200).json({ downloadUrl: file.storageUrl });
    } catch (error) {
      console.error("Download access error:", error);
      res
        .status(500)
        .json({ error: "Error retrieving file.", details: error.message });
    }
  });
  
// router.get("/download/:fileId/:userEmail", async (req, res) => {
//     try {
//         const { fileId, userEmail } = req.params;

//         // 🔹 Find the file
//         const file = await File.findById(fileId);
//         if (!file) return res.status(404).json({ error: "File not found." });

//         // 🔹 Find the user by email
//         const user = await User.findOne({ email: userEmail });
//         if (!user) return res.status(404).json({ error: "User not found." });

//         // 🔹 Check if user is authorized
//         if (
//             file.ownerEmail !== userEmail &&  // 🔹 Change from `ownerId` to `ownerEmail`
//             !file.sharedWith.includes(userEmail)
//         ) {
//             return res.status(403).json({ error: "Access denied." });
//         }

//         // 🔹 Return download link
//         res.status(200).json({ downloadUrl: file.storageUrl });
//     } catch (error) {
//         console.error("Download access error:", error);
//         res.status(500).json({ error: "Error retrieving file.", details: error.message });
//     }
// });
// GET all users
// router.get("/get-users", async (req, res) => {
//     try {
//         // const users = await AdminDetails.find({}, "email -_id"); // Fetch only 'email' field
//         // res.status(200).json(users);
//         const users = await AdminDetails.distinct("email");
//         console.log(users);
//         res.status(200).json(users.map(email => ({ email })));
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching users" });
//     }
// });

// GET all users
router.get("/get-users", async (req, res) => {
    try {
        const users = await AdminDetails.find({}, "_id email"); // Fetch only _id and email
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});
router.get("/get-files/:email", async (req, res) => {
    try {
        console.log("Fetching files for email:", req.params.email);

        const admin = await AdminDetails.findOne({ email: req.params.email }).select("files");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ files: admin.files });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;
