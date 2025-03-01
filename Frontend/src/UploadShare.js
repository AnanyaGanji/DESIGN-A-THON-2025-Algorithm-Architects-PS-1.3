import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";

const UploadShare = () => {
    const [file, setFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch users from backend
        axios.get("http://localhost:5000/api/users")
            .then(response => {
                setUsers(response.data);  // Store users in state
            })
            .catch(error => {
                console.error("Error fetching users:", error);
            });
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUserSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedUsers(selected);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || selectedUsers.length === 0) {
            setMessage("Please select a file and users to share.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("uploaderId", "YOUR_USER_ID_HERE"); // Replace with actual uploader's ID

        try {
            const uploadResponse = await axios.post("http://localhost:5000/api/files/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const fileId = uploadResponse.data.fileId;

            // Share the file with selected users
            for (const userId of selectedUsers) {
                await axios.post("http://localhost:5000/api/files/share", {
                    fileId,
                    ownerId: "YOUR_USER_ID_HERE", // Replace with actual uploader's ID
                    sharedUserId: userId
                });
            }

            setMessage("File uploaded and shared successfully!");
        } catch (error) {
            console.error("Error uploading/sharing file:", error);
            setMessage("Error uploading or sharing file.");
        }
    };

    return (
        <Container>
            <Button variant="secondary" onClick={() => navigate("/")}>← Back to Dashboard</Button>
            <h2 className="mt-3">Upload & Share File</h2>

            {message && <Alert variant="info">{message}</Alert>}

            <Form onSubmit={handleUpload}>
                <Form.Group className="mb-3">
                    <Form.Label>Select File</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Select Users to Share With</Form.Label>
                    <Form.Select multiple onChange={handleUserSelect}>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.email}  {/* Display email instead of username */}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary">Upload & Share</Button>
            </Form>
        </Container>
    );
};

export default UploadShare;
