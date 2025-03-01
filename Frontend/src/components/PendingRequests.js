import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";
import "../styles/PendingRequests.css";

const PendingRequests = () => {
  const [admins, setAdmins] = useState([]);

  // Fetch admin data
  useEffect(() => {
    const getAdminStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/getAllStatus`
        );
        const filteredAdmins =
          response.data.admin_info?.filter(
            (admin) => admin.admin_email !== "superadmin@example.com"
          ) || [];

        setAdmins(filteredAdmins || []);
      } catch (error) {
        console.log("Failed to fetch details: ", error);
      }
    };
    getAdminStatus();
  }, []);

  // Handle approval action
  const handleApproval = async (adminId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/updateAdminStatus/${adminId}`,
        { status: "Approved" }
      );
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) =>
          admin._id === adminId ? { ...admin, status: "Approved" } : admin
        )
      );
    } catch (error) {
      console.log("Failed to approve admin: ", error);
    }
  };

  // Handle rejection action
  const handleRejection = async (adminId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/updateAdminStatus/${adminId}`,
        { status: "Rejected" }
      );
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== adminId));
    } catch (error) {
      console.log("Failed to reject admin: ", error);
    }
  };

  return (
    <div className="mt-5">
      <h1 className="text-center mb-4">Pending Admin Requests</h1>
      <p className="text-center text-muted">Manage all pending admin requests below.</p>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col" className="text-center">Status</th>
              <th scope="col" className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td>{admin.admin_name}</td>
                <td>{admin.admin_email}</td>
                <td>{admin.role || "Admin"}</td>
                <td className="text-center">
                  <span className={`badge ${admin.status === "Approved" ? "bg-success" : "bg-warning"}`}>
                    {admin.status}
                  </span>
                </td>
                <td className="text-center">
                  {admin.status === "Pending" && (
                    <>
                      <button className="btn btn-success me-2" onClick={() => handleApproval(admin._id)}>
                        Approve
                      </button>
                      <button className="btn btn-danger" onClick={() => handleRejection(admin._id)}>
                        Reject
                      </button>
                    </>
                  )}
                  {admin.status === "Approved" && <span className="text-success">✔ Approved</span>}
                  {admin.status === "Rejected" && <span className="text-danger">❌ Rejected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRequests;
