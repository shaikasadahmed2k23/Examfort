import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function LeakTrace() {
  const [quizId, setQuizId] = useState("");
  const [fpResult, setFpResult] = useState(null);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");

  const [suspectedText, setSuspectedText] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const handleFingerprint = async () => {
    if (!quizId.trim()) {
      setFpError("Enter a quiz ID first");
      return;
    }
    setFpLoading(true);
    setFpError("");
    try {
      const res = await client.post(`/leaktrace/fingerprint/${quizId.trim()}`);
      setFpResult(res.data);
    } catch (err) {
      setFpError(err.response?.data?.detail || "Fingerprinting failed");
    } finally {
      setFpLoading(false);
    }
  };

  const handleCheckLeak = async () => {
    if (!suspectedText.trim()) {
      setCheckError("Paste the suspected leaked text first");
      return;
    }
    setCheckLoading(true);
    setCheckError("");
    try {
      const res = await client.post("/leaktrace/check-leak", { suspected_text: suspectedText.trim() });
      setCheckResult(res.data);
    } catch (err) {
      setCheckError(err.response?.data?.detail || "Check failed");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>LeakTrace</h2>

        <div className="card">
          <h3>1. Fingerprint a quiz</h3>
          <p style={{ fontSize: "13px", color: "#667085" }}>
            Generates a unique per-student variant (shuffled options + hash) for every MCQ in the quiz,
            so any leaked copy can be traced back to its source.
          </p>
          <label>Quiz ID</label>
          <input value={quizId} onChange={(e) => setQuizId(e.target.value)} placeholder="paste quiz_id here" />
          {fpError && <div className="error-text">{fpError}</div>}
          <button onClick={handleFingerprint} disabled={fpLoading}>
            {fpLoading ? "Fingerprinting..." : "Generate fingerprints"}
          </button>

          {fpResult && (
            <p className="success-text" style={{ marginTop: "12px" }}>
              {fpResult.fingerprints_generated} fingerprinted variants generated for quiz {fpResult.quiz_id}.
            </p>
          )}
        </div>

        <div className="card">
          <h3>2. Check a suspected leak</h3>
          <p style={{ fontSize: "13px", color: "#667085" }}>
            Paste the question/options text found leaked online. We'll match it against stored fingerprints.
          </p>
          <label>Suspected leaked text</label>
          <textarea
            rows={4}
            value={suspectedText}
            onChange={(e) => setSuspectedText(e.target.value)}
            placeholder="Paste the leaked question or option text..."
          />
          {checkError && <div className="error-text">{checkError}</div>}
          <button onClick={handleCheckLeak} disabled={checkLoading}>
            {checkLoading ? "Checking..." : "Check for match"}
          </button>

          {checkResult && (
            <div style={{ marginTop: "16px" }}>
              {checkResult.matched ? (
                <div className="card" style={{ background: "#fff7ed", border: "1px solid #fdba74" }}>
                  <strong>Match found</strong>
                  <p>Student roll: <strong>{checkResult.matched_student_roll}</strong></p>
                  <p>Question ID: {checkResult.matched_question_id || "—"}</p>
                  <p>Confidence: {(checkResult.confidence * 100).toFixed(0)}%</p>
                </div>
              ) : (
                <p style={{ color: "#667085" }}>No matching fingerprint found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}