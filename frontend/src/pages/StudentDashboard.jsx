import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/student/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (paperId, filename) => {
    setDownloadError("");
    try {
      const res = await client.get(`/papervault/download/${paperId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError("Download failed — the paper may not be unlocked yet.");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container"><p>Loading your dashboard...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container"><div className="error-text">{error}</div></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>My Dashboard</h2>

        <div className="card">
          <h3>Quizzes</h3>
          {data.quizzes.length === 0 && <p style={{ color: "#667085" }}>No quizzes assigned yet.</p>}
          {data.quizzes.map((q) => (
            <div
              key={q.quiz_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{q.title}</strong>{" "}
                {q.attempted && <span style={{ color: "#0f6e56", fontSize: "12px" }}>(Attempted)</span>}
              </div>
              <button
                className={q.attempted ? "secondary" : ""}
                onClick={() => navigate(`/exam?quiz_id=${q.quiz_id}`)}
              >
                {q.attempted ? "View" : "Attempt"}
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Papers</h3>
          {downloadError && <div className="error-text">{downloadError}</div>}
          {data.papers.length === 0 && <p style={{ color: "#667085" }}>No papers assigned yet.</p>}
          {data.papers.map((p) => (
            <div
              key={p.paper_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{p.filename}</strong>
                <div style={{ fontSize: "12px", color: "#667085" }}>
                  {p.is_unlocked ? "Unlocked" : `Locked until ${new Date(p.unlock_time).toLocaleString()}`}
                </div>
              </div>
              <button disabled={!p.is_unlocked} onClick={() => handleDownload(p.paper_id, p.filename)}>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}