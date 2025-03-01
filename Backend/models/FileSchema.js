const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true, unique: true },
  encryptionIV: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Owner of the file
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who can access this file
  uploadTimestamp: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
  storageUrl: { type: String, required: true },
  blockchainHash: { type: String, required: true },
});

const FileModel = mongoose.model("FileModel", FileSchema);

module.exports = FileModel;
