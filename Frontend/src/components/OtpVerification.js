// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/OtpVerification.css"; // Create this CSS file for styling

// const OtpVerification = ({ onVerify }) => {
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");

//   const handleOtpChange = (e) => {
//     setOtp(e.target.value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (otp.length !== 6) {
//       setError("OTP must be 6 digits.");
//       return;
//     }
//     setError("");
//     setMessage("OTP Verified Successfully!");
//     if (onVerify) onVerify();
//   };

//   const handleResend = () => {
//     setMessage("New OTP sent to your email.");
//     setError("");
//   };

//   return (
//     <div className="otp-background">
//       <div className="otp-container">
//         <h2 className="title">OTP Verification</h2>
//         {message && <p className="success-message">{message}</p>}
//         {error && <p className="error-message">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="input-field">
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={handleOtpChange}
//               required
//             />
//           </div>
//           <button type="submit" className="btn">Verify OTP</button>
//         </form>
//         <p>
//           Didn't receive OTP?{" "}
//           <span onClick={handleResend} className="toggle-link">Resend</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default OtpVerification;

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

  return (
    <div className="container text-center mt-5">
      <h2>OTP Verification</h2>
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
      {message && <p className="mt-3 text-danger">{message}</p>}
    </div>
  );
};

export default OtpVerification;
