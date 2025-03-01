import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
            <div className="text-center mb-4">
                <h1 className="display-4 fw-bold text-primary">Secure File Sharing</h1>
                <p className="lead text-secondary">Upload, Share, and Manage Your Files Securely</p>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body text-center">
                            <h5 className="card-title">Upload & Share Files</h5>
                            <p className="card-text">Upload/Share files securely with specified users.</p>
                            <Link to="/upload-share" className="btn btn-primary btn-lg">
                                Upload & Share
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body text-center">
                            <h5 className="card-title">View Shared Files</h5>
                            <p className="card-text">Download the files that have been shared with you.</p>
                            <Link to="/view-shared-files" className="btn btn-success btn-lg">
                                View Files
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
