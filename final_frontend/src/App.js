import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Login from "./components/Login"// Import the Login component
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import PendingRequests from "./components/PendingRequests";
import OtpVerification from "./components/OtpVerification";
import AdminDashboard from "./components/AdminDashboard";
import Upload from "./components/Upload";
import ShareFiles from "./components/Share";
import UploaderFilesPage from "./components/DownloadFiles";
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
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/share" element={<ShareFiles/>}/>
        <Route path="/download" element={<UploaderFilesPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
