const express = require("express");
const AdminModel = require("../models/AdminSchema"); // Ensure correct path
const {register,login,updateAdminStatus,updatePassword,getAllStatus,getObjectID,sendOtp,verifyOtp}=require('../controllers/authController');
// const authenticateToken = require('../middlewares/authMiddleware');
// const authorizeRoles =require('../middlewares/roleMiddleware');
const router=express.Router();


router.post("/register",register);
router.post("/login",login);

// Route to handle updating status
router.patch("/updateAdminStatus/:id", updateAdminStatus);
// Update admin password
router.put("/updatePassword/:id",updatePassword);
router.get("/getAllStatus",getAllStatus);
router.get("/getObjectID/:admin_email",getObjectID);

router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const response = await sendOtp(email);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const response = await verifyOtp(email, otp);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports=router;