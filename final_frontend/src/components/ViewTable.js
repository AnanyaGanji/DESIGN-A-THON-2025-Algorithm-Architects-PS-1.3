import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload } from "react-icons/fa";

const uploaderId=localStorage.getItem("email");
const handleDownload = async (fileId, userId) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/files/download/${fileId}/${userId}`);
        
        if (response.data.downloadUrl) {
            // Open the download URL
            window.open(response.data.downloadUrl, "_blank");
        } else {
            alert("Error: Unable to retrieve download link.");
        }
    } catch (error) {
        console.error("Download error:", error);
        alert("Access denied or file not found.");
    }
};

const FilesTable = ({ uploaderId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/files/get-files/${uploaderId}`);
                console.log(response.data);
                if (response.data && Array.isArray(response.data.files)) {
                    setFiles(response.data.files);
                    // console.log(files);
                } else {
                    setFiles([]); // ✅ Fallback in case response is malformed
                }
            } catch (error) {
                console.error("Error fetching files:", error);
                setFiles([]); // ✅ Set empty array on error to avoid `undefined`
            } finally {
                setLoading(false);
            }
        };

        if (uploaderId) {
            fetchFiles();
        }
    }, [uploaderId]);

    const handleDownload = (fileUrl) => {
        window.open(fileUrl);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Uploaded Files</h2>

            {loading ? (
                <p className="text-center text-gray-500">Loading files...</p>
            ) : files.length === 0 ? (
                <p className="text-center text-gray-500">No files found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="py-3 px-4 text-left">File Name</th>
                                <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
    {files.length > 0 ? (
        files.map((file, index) => (
            <tr key={file._id || index} className="border-b hover:bg-gray-100 transition">
                <td className="py-3 px-4 text-gray-700">
                    {file.originalName || `File ${index + 1}`}
                </td>
                <td className="py-3 px-4 text-center">
                    <button 
                        onClick={() => handleDownload(file._id, uploaderId)}
                        className="bg-blue-500 text-black px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    >
                        <FaDownload /> Download
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="2" className="text-center py-3 text-gray-500">
                No files available
            </td>
        </tr>
    )}
</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FilesTable;
