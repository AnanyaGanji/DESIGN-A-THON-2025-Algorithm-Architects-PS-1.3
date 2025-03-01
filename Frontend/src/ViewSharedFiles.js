import { Link } from "react-router-dom";

const UploadShare = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Upload & Share Files</h1>
            <p className="text-gray-600 mb-6">This page will allow users to upload files and share them.</p>
            <Link to="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                Back to Dashboard
            </Link>
        </div>
    );
};

export default UploadShare;