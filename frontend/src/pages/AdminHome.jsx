import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const modules = [
  { key: "seatsmart", title: "SeatSmart", desc: "Generate exam seating arrangements", path: "/admin/seatsmart" },
  { key: "mockboard", title: "MockBoard", desc: "AI-generated quizzes with leaderboard", path: "/admin/mockboard" },
  { key: "leaktrace", title: "LeakTrace", desc: "Fingerprint papers, trace leaks", path: "/admin/leaktrace" },
  { key: "papervault", title: "PaperVault", desc: "Encrypted, time-locked paper storage", path: "/admin/papervault" },
];

export default function AdminHome() {
  const [view, setView] = useState(null);
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="container">
        {!view && (
          <div className="card" style={{ textAlign: "center" }}>
            <h2>What would you like to do?</h2>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "20px" }}>
              <button style={{ padding: "16px 32px" }} onClick={() => setView("create")}>
                Create
              </button>
              <button className="secondary" style={{ padding: "16px 32px" }} onClick={() => setView("attend")}>
                Attend
              </button>
            </div>
          </div>
        )}

        {view === "create" && (
          <>
            <button className="secondary" style={{ marginBottom: "16px" }} onClick={() => setView(null)}>
              ← Back
            </button>
            <div className="module-grid">
              {modules.map((m) => (
                <div key={m.key} className="card module-card" onClick={() => navigate(m.path)}>
                  <h3>{m.title}</h3>
                  <p style={{ color: "#667085", fontSize: "13px" }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {view === "attend" && (
          <>
            <button className="secondary" style={{ marginBottom: "16px" }} onClick={() => setView(null)}>
              ← Back
            </button>
            <div className="card">
              <p>Select a module above to view existing seatings, quizzes, papers or fingerprint records.</p>
              <div className="module-grid" style={{ marginTop: "16px" }}>
                {modules.map((m) => (
                  <div key={m.key} className="card module-card" onClick={() => navigate(m.path)}>
                    <h3>{m.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}