const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    encryptionIV: { type: String, required: true },
    uploaderId: { type: String, required: true },  // Owner of the file
    uploadTimestamp: { type: Date, default: Date.now },
    mimeType: { type: String, required: true },
    storageUrl: { type: String, required: true },
    sharedWith: { type: [String], default: [] } // Stores email IDs of users shared with
});

const FileModel = mongoose.model("FileModel",FileSchema);

module.exports=FileModel;