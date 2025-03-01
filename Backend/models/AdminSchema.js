const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,  // Hashed password
    status: {type:String,enum:["Pending","Approved","Denied"],default:"Pending"},
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
    usersWithAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // Users granted access
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],  // Reference to File Schema
}, { timestamps: true });

const AdminModel = mongoose.model("AdminModel",AdminSchema);

module.exports = AdminModel;