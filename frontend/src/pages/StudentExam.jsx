import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function StudentExam() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quiz_id");

  const [quiz, setQuiz] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!quizId) {
      setError("No quiz assigned. Ask your teacher for a quiz link or ID.");
      setLoading(false);
      return;
    }
    client
      .get(`/mockboard/quiz/${quizId}`)
      .then((res) => setQuiz(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Could not load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleMcqSelect = (questionId, optionIndex) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubjectiveChange = (questionId, text) => {
    setSubjectiveAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await client.post(`/mockboard/submit/${quizId}`, {
        quiz_id: quizId,
        mcq_answers: mcqAnswers,
        subjective_answers: subjectiveAnswers,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container"><p>Loading your exam...</p></div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div>
        <Navbar />
        <div className="container"><div className="error-text">{error}</div></div>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>Exam submitted</h2>
            <h3>Score: {result.score} / {result.max_score}</h3>

            <h4>MCQ breakdown</h4>
            {result.mcq_breakdown.map((m, i) => (
              <p key={m.question_id} style={{ color: m.is_correct ? "#0f6e56" : "#c0392b" }}>
                Q{i + 1}: {m.is_correct ? "Correct" : `Incorrect (correct option: ${m.correct_index + 1})`}
              </p>
            ))}

            <h4>Subjective breakdown</h4>
            {result.subjective_breakdown.map((s, i) => (
              <div key={s.question_id} style={{ marginBottom: "10px" }}>
                <p><strong>Q{i + 1}: {s.marks_awarded} / {s.max_marks}</strong></p>
                <p style={{ color: "#667085", fontSize: "13px" }}>{s.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>{quiz.title}</h2>

          {quiz.mcqs.map((m, i) => (
            <div key={m.id} style={{ marginBottom: "20px" }}>
              <strong>{i + 1}. {m.question}</strong>
              <div style={{ marginTop: "8px" }}>
                {m.options.map((opt, oi) => (
                  <label key={oi} style={{ display: "block", fontWeight: 400, marginBottom: "4px" }}>
                    <input
                      type="radio"
                      style={{ width: "auto", marginRight: "8px" }}
                      name={`mcq-${m.id}`}
                      checked={mcqAnswers[m.id] === oi}
                      onChange={() => handleMcqSelect(m.id, oi)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {quiz.subjective.map((s, i) => (
            <div key={s.id} style={{ marginBottom: "20px" }}>
              <strong>{quiz.mcqs.length + i + 1}. {s.question}</strong>
              <span style={{ color: "#667085", fontSize: "12px" }}> ({s.max_marks} marks)</span>
              <textarea
                rows={4}
                value={subjectiveAnswers[s.id] || ""}
                onChange={(e) => handleSubjectiveChange(s.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          ))}

          {error && <div className="error-text">{error}</div>}

          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit exam"}
          </button>
        </div>
      </div>
    </div>
  );
}