import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function PaperVault() {
  const [file, setFile] = useState(null);
  const [unlockTime, setUnlockTime] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");

  const [paperId, setPaperId] = useState("");
  const [unlockResult, setUnlockResult] = useState(null);
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logsError, setLogsError] = useState("");

  const handleUpload = async () => {
    if (!file || !unlockTime) {
      setError("Select a file and set an unlock time");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unlock_time", new Date(unlockTime).toISOString());
      const res = await client.post("/papervault/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUnlock = async () => {
    if (!paperId.trim()) {
      setUnlockError("Enter a paper ID");
      return;
    }
    setUnlocking(true);
    setUnlockError("");
    try {
      const res = await client.post(`/papervault/unlock/${paperId.trim()}`);
      setUnlockResult(res.data);
      fetchLogs(paperId.trim());
    } catch (err) {
      setUnlockError(err.response?.data?.detail || "Unlock failed");
    } finally {
      setUnlocking(false);
    }
  };

  const fetchLogs = async (id) => {
    try {
      const res = await client.get(`/papervault/access-logs/${id}`);
      setLogs(res.data);
    } catch (err) {
      setLogsError(err.response?.data?.detail || "Failed to load access logs");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>PaperVault</h2>

        <div className="card">
          <h3>1. Upload &amp; encrypt a paper</h3>
          <p style={{ fontSize: "13px", color: "#667085" }}>
            Accepts Word (.docx) or Excel (.xlsx) files. Content is encrypted at upload and the
            decryption key is only released once the unlock time is reached.
          </p>
          <label>Paper file</label>
          <input type="file" accept=".docx,.xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} />

          <label>Unlock date &amp; time</label>
          <input type="datetime-local" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />

          {error && <div className="error-text">{error}</div>}

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Encrypting & uploading..." : "Upload & lock"}
          </button>

          {uploadResult && (
            <p className="success-text" style={{ marginTop: "12px" }}>
              Paper locked. ID: <code>{uploadResult.paper_id}</code> — unlocks at{" "}
              {new Date(uploadResult.unlock_time).toLocaleString()}
            </p>
          )}
        </div>

        <div className="card">
          <h3>2. Attempt unlock</h3>
          <label>Paper ID</label>
          <input value={paperId} onChange={(e) => setPaperId(e.target.value)} placeholder="paste paper_id here" />

          {unlockError && <div className="error-text">{unlockError}</div>}

          <button onClick={handleUnlock} disabled={unlocking}>
            {unlocking ? "Checking..." : "Try unlock"}
          </button>

          {unlockResult && (
            <div className="card" style={{ marginTop: "16px", background: "#f0fdf4" }}>
              <strong>Unlocked at {new Date(unlockResult.unlocked_at).toLocaleString()}</strong>
              <pre style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>{unlockResult.content}</pre>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="card">
            <h3>Access log</h3>
            {logsError && <div className="error-text">{logsError}</div>}
            <table>
              <thead><tr><th>User</th><th>Action</th><th>Time</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>{l.user_id}</td>
                    <td>{l.action}</td>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}