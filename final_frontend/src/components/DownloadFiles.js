import React from "react";
import FilesTable from "./ViewTable";

const UploaderFilesPage = () => {
    const uploaderId = localStorage.getItem("email"); // Replace with dynamic ID

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Files</h1>
            <FilesTable uploaderId={uploaderId} />
        </div>
    );
};

export default UploaderFilesPage;
