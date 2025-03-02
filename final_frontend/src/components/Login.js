import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const LoginAndRegister = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    profession: "law-professional",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleToggle = () => setIsSignUp(!isSignUp);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, password} = formData;
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/login`, { username, password });
      const { message, token, user, email } = response.data;
      console.log(response.data);
      setMessage(message);
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem( "email",email);
      localStorage.setItem("userId",user._id);
       // Check if values are stored correctly
    console.log("Stored username:", localStorage.getItem("username"));
    console.log("Stored token:", localStorage.getItem("token"));
    console.log("Stored role:", localStorage.getItem("role"));
    console.log("Stored email:", localStorage.getItem("email"));
    console.log("Stored userId:", localStorage.getItem("userId"));
      navigate("/otp-verification");
    } catch (error) {
      setError("Invalid login credentials");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      const response = await axios.post(`http://localhost:5000/api/register`, {
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        profession: formData.profession,
      });
      response.data.success ? setMessage(response.data.message) : setError(response.data.message);
    } catch (error) {
      setError("Registration failed");
    }
  };

  return (
    <div className={`container-login ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {!isSignUp ? (
            <form onSubmit={handleLoginSubmit} className="sign-in-form">
              <h2 className="title">Login</h2>
              {message && <p className="success-message">{message}</p>}
              {error && <p className="error-message">{error}</p>}
              <div className="input-field">
                <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required />
              </div>
              <div className="input-field">
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} required />
                <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </span>
              </div>
              <button type="submit" className="btn">Login</button>
              <p>
                Don't have an account? <span onClick={handleToggle} className="toggle-link">Register now</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="sign-up-form">
              <h2 className="title">Register</h2>
              {message && <p className="success-message">{message}</p>}
              {error && <p className="error-message">{error}</p>}
              <div className="input-field">
                <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required />
              </div>
              <div className="input-field">
                <input type="tel" placeholder="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="input-field">
                <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="input-field">
                <select name="profession" value={formData.profession} onChange={handleInputChange} required>
                  <option value="law-professional">Law Professional</option>
                  <option value="police">police</option>
                  <option value="forensic-department">Forensic Department</option>
                </select>
              </div>
              <button type="submit" className="btn">Register</button>
              <p>
                Already have an account? <span onClick={handleToggle} className="toggle-link">Login here</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginAndRegister;
