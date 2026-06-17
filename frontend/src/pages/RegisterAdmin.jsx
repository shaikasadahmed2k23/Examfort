import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privateCode, setPrivateCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerAdmin({ name, email, password, private_code: privateCode });
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "60px" }}>
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Register as Admin</h2>
        <p style={{ textAlign: "center", color: "#667085", marginBottom: "24px" }}>
          Choose a private code — share it with your students so they can log in
        </p>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <label>Private Code (students will use this)</label>
          <input value={privateCode} onChange={(e) => setPrivateCode(e.target.value)} required />

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}