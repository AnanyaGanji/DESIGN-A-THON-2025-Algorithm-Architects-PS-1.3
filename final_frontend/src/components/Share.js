import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const ShareFiles = () => {
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");  // ✅ Success message state
    const modalRef = useRef(null);
    const uploaderId=localStorage.getItem("email");
    useEffect(() => {
        fetchFiles();
        fetchUsers();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files/${uploaderId}`);
            setFiles(response.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/get-users");
            setUsers(response.data.emails);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleShare = (file) => {
        setSelectedFile(file);
        setSelectedUsers([]);
        setMessage("");  // ✅ Clear previous message when opening modal
        // Ensure Bootstrap's Modal is properly initialized
        import("bootstrap/js/dist/modal").then(({ default: Modal }) => {
            const modalInstance = new Modal(modalRef.current);
            modalInstance.show();
        });
    };

    const handleUserSelect = (email) => {
        setSelectedUsers((prev) =>
            prev.includes(email) ? prev.filter((u) => u !== email) : [...prev, email]
        );
    };

    const submitShare = async () => {
        if (!selectedFile || selectedUsers.length === 0) return;
        setLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/files/share/${selectedFile._id}`, {
                fileId: selectedFile._id,      // Ensure file ID is sent
                ownerId: uploaderId,           // Send uploader's ID/email
                sharedUserIds: selectedUsers,  // Send list of selected users
            });

            alert("File shared successfully!");
            fetchFiles();

            import("bootstrap/js/dist/modal").then(({ default: Modal }) => {
                const modalInstance = Modal.getInstance(modalRef.current);
                modalInstance.hide();
            });
        } catch (error) {
            console.error("Error sharing file:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Your Uploaded Files</h2>

            {files.length === 0 ? (
                <p>No files uploaded yet.</p>
            ) : (
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>File Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file._id}>
                                <td>{file.originalName}</td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleShare(file)}
                                    >
                                        Share
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Bootstrap Modal */}
            <div className="modal fade" ref={modalRef} id="shareModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                Share {selectedFile?.originalName} with:
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                                {users.length > 0 ? (
                                    users.map((email, index) => (
                                    <div key={index} className="form-check">
                                        <input
                                        type="checkbox"
                                        className="form-check-input"
                                        value={email}
                                        checked={selectedUsers.includes(email)}
                                        onChange={() => handleUserSelect(email)}
                                    />
                                    <label className="form-check-label">{email}</label>
                            </div>
                            ))
                            ) : (
                           <p>No users found</p>
                            )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={submitShare} disabled={loading}>
                                {loading ? "Sharing..." : "Confirm Share"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareFiles;
