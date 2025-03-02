const express = require("express");
const AdminRoutes = require("./routes/AdminRoutes"); // Import the upload route
const LoginRoute = require("./routes/authRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt=require("bcryptjs");
const AdminDetails=require("./models/AdminSchema");
dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve encrypted files if needed

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
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
app.use("/api/files", AdminRoutes);
app.use("/api",LoginRoute)
// Route to get all admins
app.get("/get-users", async (req, res) => {
  try {
      const admins = await AdminDetails.find({}, "email"); // Fetch only required fields
      const emails = admins.map(admin => admin.email);
      res.json({ emails }); // Return only emails
  } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.get("files/:email", async (req, res) => {
  try {
      const { email } = req.params;

      if (!email) {
          return res.status(400).json({ error: "Email is required." });
      }

      // 🔹 Find the admin by email
      const admin = await AdminDetails.findOne({ email }).populate("files");

      if (!admin) {
          return res.status(404).json({ error: "Admin not found." });
      }

      res.status(200).json({ files: admin.files });
  } catch (error) {
      console.error("Error fetching admin files:", error);
      res.status(500).json({ error: "Error fetching files.", details: error.message });
  }
});
