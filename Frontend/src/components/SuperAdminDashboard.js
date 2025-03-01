import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const handleManageAdmins = () => navigate("/manage-admins");
  const handleManageUsers = () => navigate("/manage-users");
  const handleManageFiles = () => navigate("/file-access");
  const handleSystemLogs = () => navigate("/system-logs");
  const handleSecuritySettings = () => navigate("/security-settings");

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Super Admin Dashboard</h1>
      <div className="cards-container">
        <div className="card">
          <h2 className="card-title">Manage Admins</h2>
          <p className="card-description">Add, remove, or modify admin accounts.</p>
          <button className="card-button" onClick={handleManageAdmins}>Go to Manage Admins</button>
        </div>
        <div className="card">
          <h2 className="card-title">Manage Users</h2>
          <p className="card-description">View user activity and handle security issues.</p>
          <button className="card-button" onClick={handleManageUsers}>Go to Manage Users</button>
        </div>
        <div className="card">
          <h2 className="card-title">Manage File Access</h2>
          <p className="card-description">Control file-sharing permissions and access logs.</p>
          <button className="card-button" onClick={handleManageFiles}>Go to File Access</button>
        </div>
        <div className="card">
          <h2 className="card-title">System Logs</h2>
          <p className="card-description">Monitor activity logs for security & compliance.</p>
          <button className="card-button" onClick={handleSystemLogs}>Go to System Logs</button>
        </div>
        <div className="card">
          <h2 className="card-title">Security Settings</h2>
          <p className="card-description">Configure encryption, 2FA, and system security.</p>
          <button className="card-button" onClick={handleSecuritySettings}>Go to Security Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
