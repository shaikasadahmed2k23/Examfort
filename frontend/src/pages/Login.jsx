import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [mode, setMode] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privateCode, setPrivateCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = mode === "admin"
        ? { email, password, private_code: privateCode }
        : { private_code: privateCode };

      const data = await login(payload);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "60px" }}>
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>ExamFort</h2>
        <p style={{ textAlign: "center", color: "#667085", marginBottom: "24px" }}>
          Bismillah — sign in to continue
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            className={mode === "student" ? "" : "secondary"}
            style={{ flex: 1 }}
            onClick={() => setMode("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={mode === "admin" ? "" : "secondary"}
            style={{ flex: 1 }}
            onClick={() => setMode("admin")}
          >
            Admin
          </button>
        </div>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "admin" && (
            <>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          <label>Private Code</label>
          <input
            type="text"
            value={privateCode}
            onChange={(e) => setPrivateCode(e.target.value)}
            placeholder="Code shared by your institution"
            required
          />

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {mode === "admin" && (
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
            New admin? <Link to="/register-admin">Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}