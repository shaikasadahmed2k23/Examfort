import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function MockBoardLeaderboard() {
  const { quizId } = useParams();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get(`/mockboard/leaderboard/${quizId}`)
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load leaderboard"));
  }, [quizId]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>Leaderboard</h2>
        {error && <div className="error-text">{error}</div>}
        <div className="card">
          <table>
            <thead>
              <tr><th>Rank</th><th>Student</th><th>Score</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id}>
                  <td>{r.rank}</td>
                  <td>{r.student_id}</td>
                  <td>{r.score} / {r.max_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p style={{ color: "#667085" }}>No attempts yet.</p>}
        </div>
      </div>
    </div>
  );
}