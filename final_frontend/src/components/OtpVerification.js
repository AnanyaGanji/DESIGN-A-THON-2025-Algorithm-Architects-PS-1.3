import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email"); // Retrieve email from localStorage
  const role = localStorage.getItem("role"); // Retrieve role from localStorage

  useEffect(() => {
    if (!email) {
      setMessage("No email found. Please log in again.");
      return;
    }

    sendOtp(); // Automatically send OTP when component mounts
  }, [email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const sendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/send-otp", { email }, { 
        headers: { "Content-Type": "application/json" } 
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to send OTP.");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/verify-otp", { email, otp }, { 
        headers: { "Content-Type": "application/json" } 
      });
      setMessage(response.data.message);
      // Redirect based on role
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "superadmin") {
        navigate("/super-admin-dashboard");
      } else {
        setMessage("Unauthorized role. Please contact support.");
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Invalid OTP or expired.");
    }
  };

  const handleResendOtp = () => {
    setCanResend(false);
    setCountdown(60);
    sendOtp();
  };
  {message && (
    <p className={message.includes("success") ? "success-message" : "error-message"}>
      {message}
    </p>
  )}
  return (
    <div className="container-otpverify text-center mt-5">
      <p>Enter the OTP sent to your email</p>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button className="btn btn-primary w-100 mb-2" onClick={verifyOtp}>
        Verify OTP
      </button>
      <button
        className="btn btn-secondary w-100"
        onClick={handleResendOtp}
        disabled={!canResend}
      >
        Resend OTP {canResend ? "" : `(${countdown}s)`}
      </button>
      {message && <p className={`mt-3 ${message.includes("successfully") ? "text-success" : "text-danger"}`}>{message}</p>}
    </div>
  );
};

export default OtpVerification;
