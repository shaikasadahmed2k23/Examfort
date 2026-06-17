import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function MockBoardCreate() {
  const [topic, setTopic] = useState("");
  const [syllabusText, setSyllabusText] = useState("");
  const [numMcq, setNumMcq] = useState(5);
  const [numSubjective, setNumSubjective] = useState(2);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !syllabusText.trim()) {
      setError("Provide either a topic or syllabus text");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await client.post("/mockboard/generate", {
        topic: topic.trim() || null,
        syllabus_text: syllabusText.trim() || null,
        num_mcq: numMcq,
        num_subjective: numSubjective,
        difficulty,
      });
      setQuiz(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Quiz generation failed");
    } finally {
      setLoading(false);
    }
  };

  const quizLink = quiz ? `${window.location.origin}/exam?quiz_id=${quiz.quiz_id}` : "";

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>MockBoard — Create Quiz</h2>

        <div className="card">
          <label>Topic (short prompt)</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Newton's Laws of Motion"
          />

          <label>OR paste syllabus / source text</label>
          <textarea
            rows={5}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="Paste syllabus content here..."
          />

          <div className="grid-2">
            <div>
              <label>Number of MCQs</label>
              <input
                type="number"
                min="1"
                max="30"
                value={numMcq}
                onChange={(e) => setNumMcq(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label>Number of subjective questions</label>
              <input
                type="number"
                min="0"
                max="10"
                value={numSubjective}
                onChange={(e) => setNumSubjective(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {error && <div className="error-text">{error}</div>}

          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating with Groq..." : "Generate quiz"}
          </button>
        </div>

        {quiz && (
          <div className="card">
            <h3>{quiz.title}</h3>
            <p className="success-text">
              Quiz created. Share this link or quiz ID with students: <br />
              <code>{quizLink}</code>
            </p>

            <h4>MCQs ({quiz.mcqs.length})</h4>
            {quiz.mcqs.map((m, i) => (
              <div key={m.id} style={{ marginBottom: "12px" }}>
                <strong>{i + 1}. {m.question}</strong>
                <ul>
                  {m.options.map((opt, oi) => (
                    <li key={oi} style={{ color: oi === m.correct_index ? "#0f6e56" : "inherit" }}>
                      {opt} {oi === m.correct_index && "✓"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h4>Subjective ({quiz.subjective.length})</h4>
            {quiz.subjective.map((s, i) => (
              <div key={s.id} style={{ marginBottom: "8px" }}>
                <strong>{i + 1}. {s.question}</strong> <span style={{ color: "#667085" }}>({s.max_marks} marks)</span>
              </div>
            ))}

            <button
              className="secondary"
              style={{ marginTop: "16px" }}
              onClick={() => window.open(`/admin/mockboard/leaderboard/${quiz.quiz_id}`, "_blank")}
            >
              View leaderboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}