// import { Link } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/AdminDashboard.css";
// const AdminDashboard = () => {
//     return (
//             <div className="dashboard-container">
//                 <h1 className="dashboard-title">Secure File Sharing</h1>
//                 <p className="dashboard-subtitle">Upload, Share, and Manage Your Files Securely</p>
    
//                 <div className="dashboard-options">
//                     <Link to="/upload-share" className="dashboard-card upload">
//                     <div className="card-content">
//                         <h3>📤 Upload & Share Files</h3>
//                         <p>Upload and securely share files with others.</p>
//                     </div>
//                     </Link>
    
//                     <Link to="/view-shared-files" className="dashboard-card view">
//                     <div className="card-content">
//                         <h3>📂 View Shared Files</h3>
//                         <p>Access and download files shared with you.</p>
//                     </div>
//                     </Link>
//                 </div>
//             </div>
//         );
// };

// export default AdminDashboard;

import React from 'react';
import '../styles/AdminDashboard.css';
// import navigate from Navigate
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
  return (
    <div className="dashboard-container">
      {/* Admin Panel */}
      <div className="admin-panel">
        <h2>Admin Panel</h2>
        <ul className="admin-options">
          {/* <li>Upload Files</li> */}
          <button onClick={() => navigate("/upload")}>Upload Files</button>
          <button onClick={() => navigate("/share")}>Share Files</button>
          <button onClick={() => navigate("/download")}>View files Shared With You</button>
          <button onClick={() => navigate("/admin-dashboard")}>Manage Files</button>
          {/* <li>Share Files</li>
          <li>View Files Shared with You</li>
          <li>Manage Your Files</li> */}
        </ul>
      </div>
      
      {/* Files Table */}
      <div className="files-table">
        <h2>Recently Shared Files</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Shared By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Project_Doc.pdf</td>
                <td>Admin1</td>
                <td>March 1, 2025</td>
                <td><button>Download</button></td>
              </tr>
              <tr>
                <td>Report.xlsx</td>
                <td>Admin2</td>
                <td>March 2, 2025</td>
                <td><button>Download</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;