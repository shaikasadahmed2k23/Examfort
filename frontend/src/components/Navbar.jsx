import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { name, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 24px",
      background: "#0f6e56",
      color: "white",
    }}>
      <strong>ExamFort</strong>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {name && <span>{name}</span>}
        <span style={{ fontSize: "12px", opacity: 0.8 }}>{role}</span>
        <button className="secondary" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}