const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now, immutable: true },
    userId: { type: String, required: true, immutable: true },
    action: { type: String, required: true, immutable: true },
    fileHash: { type: String, required: true, immutable: true },
    prevHash: { type: String, required: true, immutable: true }, // Hash linking logs
    currentHash: { type: String, required: true, immutable: true } // Ensures integrity
});

// Prevents modifications using Mongoose middleware
auditLogSchema.pre("updateOne", function (next) {
    return next(new Error("Audit logs cannot be modified"));
});
auditLogSchema.pre("deleteOne", function (next) {
    return next(new Error("Audit logs cannot be deleted"));
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;
