import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login"// Import the Login component
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import PendingRequests from "./components/PendingRequests";
import OtpVerification from "./components/OtpVerification";
import AdminDashboard from "./components/AdminDashboard";
import UploadShare from "./components/UploadShare";
import "./App.css"; // Import styles if needed

const App = () => {
  
  return(
  <Router>
     <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp-verification" element={<OtpVerification/>}/>
        <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard/>}/>
        <Route path="/manage-admins" element={<PendingRequests/>}/>
        <Route path="/upload-share" element={<UploadShare/>}/>
      </Routes>
    </Router>
  );
};

export default App;
