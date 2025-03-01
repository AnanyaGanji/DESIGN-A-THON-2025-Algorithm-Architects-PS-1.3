const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminDetails= require("../models/AdminSchema"); // Import User model
const crypto = require("crypto");
const OTP =require("../models/otpModel")
//register
const register = async (req, res) => {
    try {
      const {
        username,
        email,
        profession
      } = req.body;
      console.log(req.body);
      console.log(
        "Name: " + username + " Email: " + email + " Profession: " + profession
      );
  
      if (!username || !email || !profession) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const newAdmin = new AdminDetails({
        username: username,
        email: email,
        profession: profession,
        usersWithAccess: [], // Initialize empty array for usersWithAccess
        files: [], // Initialize empty array for files
      });
      await newAdmin.save();
  
      res.status(201).json({
        message:
          "Your registration request has been submitted successfully. Response will be sent to your email soon.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error registering admin.", error: error.message });
    }
  };
  
const login = async (req, res) => {
    console.log("Login attempt:", req.body);
  
    const { username, password } = req.body;
    const email = username;
  
    try {
      // Debugging: Log the email
      console.log("Email in query:", email);
  
      // Step 1: Check if the user is an admin
      const adminUser = await AdminDetails.findOne({ email });
      console.log("Step 1 - User lookup result:", adminUser);
  
      if (adminUser) {
        // Step 2: Validate password for admin
        const isMatch = await bcrypt.compare(password, adminUser.password);
        console.log("Step 2 - Password match result:", isMatch);
  
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }
  
        // Step 3: Generate JWT and redirect
        const token = jwt.sign(
          { id: adminUser._id, role: adminUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("Step 3 - JWT generated:", token);
  
        const redirectTo =
          adminUser.role === "admin"
            ? "/otp-verification"
            : adminUser.role === "superadmin"
            ? "/otp-verification"
            : "/";
        console.log("Step 4 - Redirecting to:", redirectTo);
  
        return res.status(200).json({
          token,
          user: {
            id: adminUser._id,
            role: adminUser.role, // Send role along with the token
            // email: adminUser.email,
            // any other relevant information you want to send
          },
          email: adminUser.email,
          message: `Welcome, ${adminUser.role}!`,
          redirectTo,
        });
      }
  
      // Step 5: Check if user has access
      const parentAccount = await AdminDetails.findOne({
        "usersWithAccess": adminUser._id,
      });
      console.log("Step 5 - Parent account lookup result:", parentAccount);
  
      if (!parentAccount || !parentAccount.usersWithAccess.length) {
        return res.status(401).json({ message: "Invalid username or account" });
      }
  
      // Step 6: Match user with access
      const userWithAccess = parentAccount.usersWithAccess.find(
        (user) => user.toString() === adminUser._id.toString()
      );
      console.log("Step 6 - Found user with access:", userWithAccess);
  
      if (!userWithAccess) {
        return res.status(401).json({ message: "User access not found" });
      }
     
      // Step 7: Generate JWT for user with access
      const userToken = jwt.sign(
        { id: userWithAccess, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("Step 7 - JWT for user with access generated:", userToken);
  
      return res.status(200).json({
        token: userToken,
        message: `Welcome, user!`,
        user:{
          role:"user"
        },
        redirectTo: "/user-dashboard",
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
};
const updateAdminStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // "Approved" or "Rejected"
      console.log("id: ", id, "Status: ", status);
  
      // Validate status value
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
  
      const admin = await AdminDetails.findByIdAndUpdate(id, { status }, { new: true });
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
      }
  
      // If admin is approved, generate random password and send email
      if (status === "Approved") {
        const randomPassword = crypto.randomBytes(8).toString("hex"); // Generate random password
        const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password
  
        // Update the admin's password with the new hashed password
        admin.password = hashedPassword;
        await admin.save();
  
        // Prepare the email content
        const subject = "Your Account Has Been Approved!";
        const html = `<h3>Welcome, ${admin.name}!</h3>
                      <p>Your account has been approved. Here are your credentials:</p>
                      <p>Email: ${admin.email}</p>
                      <p>Password: ${randomPassword}</p>`;
  
        // Send email with credentials
        await sendEmail(admin.email, subject, null, html);
      }
  
      res.status(200).json({ message: `Admin status updated to ${status}.`, admin });
    } catch (error) {
      res.status(500).json({ message: "Error updating status.", error: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
      const { id } = req.params; // Get admin ID from URL
      const { password } = req.body; // Get new password from request body
  
      // Validate input
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long." });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update the admin's password in the database
      const updatedAdmin = await AdminDetails.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true } // Return the updated document
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found." });
      }
  
      res.status(200).json({
        message: "Password updated successfully.",
        admin: { id: updatedAdmin._id, name: updatedAdmin.name }, // Updated field name
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const nodemailer = require("nodemailer");

// Setup Nodemailer transporter (using Gmail for example)
const transporter = nodemailer.createTransport({
  service: "gmail", 
  host: 'smtp.gmail.com',
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
  logger: process.env.NODE_ENV !== "production", // Only log in development
  debug: process.env.NODE_ENV !== "production", 
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Transport Error:", error); 
  } else {
    console.log("✅ SMTP Transport Verified: Ready to send emails");
  }
});

// Send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: {
        name: "Secure File Sharing System",
        address: process.env.EMAIL_USER,
      },
      to,
      subject,
      text: text || "This is an auto-generated email from Joy with Learning.",
      html: html || `<p>This is an auto-generated email from <b>Joy with Learning</b>.</p>`,
    };

    console.log("📩 Preparing to send email..."); // Log before sending

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response); 
    console.log("📨 Message ID:", info.messageId); 
  } catch (error) {
    console.error("❌ Error sending email:", error); 
    console.error("🔍 Error Code:", error.code); 
    console.error("📬 Response from Server:", error.response); 
    console.error("🚨 Failed Command:", error.command); 
  }
};

const sendOtp = async (email) => {
  if (!email) throw new Error("Email is required!");

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in MongoDB (remove any existing OTP for the email)
  await OTP.deleteOne({ email });
  await OTP.create({ email, otp });

  // Email content
  const mailOptions = {
      from: {
        name: "Secure File Sharing System",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`
  };

  // Send email
  await transporter.sendMail(mailOptions);
  
  return { message: "OTP sent successfully!" };
};

const verifyOtp = async (email, otp) => {
  if (!email || !otp) throw new Error("Email and OTP are required!");

  // Find OTP in DB
  const validOtp = await OTP.findOne({ email, otp });

  if (!validOtp) throw new Error("Invalid or expired OTP!");

  // OTP verified, delete from DB
  await OTP.deleteOne({ _id: validOtp._id });

  return { message: "OTP verified successfully!" };
};

const getObjectID = async (req,res)=>
{
  const {admin_email} =req.params;
  console.log("Username is : ", admin_email);
  try{
    const objId = await AdminDetails.findOne({admin_email});
    console.log("inside the route :",objId);
    res.status(200).json({
      message: "object id found",
      admin: { id: objId._id},
    });
    return objId._id;
    }catch(error)
    {
      res.status(500).json({ message:"go ree ",error:error.message});
    }
};

const getAllStatus = async (req,res)=>
  {
    console.log("Finding all the status from adminSchema...");
    const admin_info = await AdminDetails.find();
    console.log(admin_info);
    res.status(200).json({
      admin_info});
  
  }
  
module.exports = {
    register,
    login,
    updateAdminStatus,
    updatePassword,
    getObjectID,
    getAllStatus,
    sendOtp,
    verifyOtp
  };