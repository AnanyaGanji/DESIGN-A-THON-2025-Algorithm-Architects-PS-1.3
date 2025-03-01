const express = require("express");
const fileUploadRoutes = require("./routes/AdminRoute"); // Import the upload route
const LoginRoute = require("./routes/login_routes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt=require("bcryptjs");
dotenv.config(); // Load environment variables

const AdminModel = require("./models/AdminSchema");
const UserModel = require("./useless/UserSchema");
const FileMOdel = require("./models/FileSchema");
const AuditLog = require("./models/audit_logs"); 
const uploadRoutes = require("./useless/upload");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve encrypted files if needed
app.use("/api/files", uploadRoutes); // Use the file routes under /api/files


// Get the MongoDB URI from the .env file
const uri = process.env.MONGODB_URI;
const connectToDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Adjust as needed
      socketTimeoutMS: 45000, // Adjust as needed
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

//Start the server
(async () => {
  try {
    await connectToDB(); // Establish the MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
})();

// Routes
app.use("/api/files", fileUploadRoutes);
app.use("/api",LoginRoute);

// async function insertSampleData() {
//   try {
//     // Insert a User
//     const user = await UserModel.create({
//       name: "Detective John",
//       email: "john@example.com",
//       password: "hashedpassword123",
//       role: "user",
//     });

//     console.log("User Created:", user);

//     // Insert an Admin
//     const admin = await AdminModel.create({
//       name: "Chief Officer",
//       email: "admin@example.com",
//       password: "hashedadminpassword",
//       role: "admin",
//       usersWithAccess: [user._id], // Granting access to the created user
//     });

//     console.log("Admin Created:", admin);

//     // Insert a File
//     const file = await FileMOdel.create({
//       filename: "CaseReport123.pdf",
//       path: "/secure_storage/casereports/CaseReport123.pdf",
//       owner: admin._id, // Admin owns the file
//       accessList: [user._id], // Granting access to the user
//       integrityHash: "xyz123456hash",
//     });

//     console.log("File Created:", file);

//     // Update the Admin with File reference
//     await AdminModel.findByIdAndUpdate(admin._id, {
//       $push: { files: file._id },
//     });

//     console.log("File linked to Admin ✅");
//   } catch (error) {
//     console.error("Error inserting sample data:", error);
//   } finally {
//     mongoose.connection.close(); // Close the connection
//   }
// }

// insertSampleData();
