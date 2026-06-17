import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import client from "../api/client.js";

export default function SeatSmart() {
  const [example, setExample] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [numBlocks, setNumBlocks] = useState(1);
  const [rooms, setRooms] = useState([{ block_name: "Block 1", room_no: "101", capacity: 30 }]);
  const [selectedSheetIds, setSelectedSheetIds] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get("/seatsmart/naming-convention-example").then((res) => setExample(res.data));
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    const res = await client.get("/seatsmart/sheets");
    setSheets(res.data);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await client.post("/seatsmart/upload-sheet", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchSheets();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleSheetSelection = (id) => {
    setSelectedSheetIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const updateRoomField = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = field === "capacity" ? parseInt(value) || 0 : value;
    setRooms(updated);
  };

  const addRoom = () => {
    setRooms([...rooms, { block_name: `Block ${numBlocks}`, room_no: "", capacity: 30 }]);
  };

  const removeRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (selectedSheetIds.length === 0) {
      setError("Select at least one sheet");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await client.post("/seatsmart/generate", {
        sheet_ids: selectedSheetIds,
        rooms: rooms,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>SeatSmart</h2>

        <div className="card">
          <h3>1. Upload roll number sheets</h3>
          {example && (
            <p style={{ fontSize: "13px", color: "#667085", background: "#f4f6f8", padding: "10px", borderRadius: "6px" }}>
              Naming rule: subject = filename characters AFTER position 7. Example:{" "}
              <strong>{example.example_filename}</strong> → first 7 chars{" "}
              <code>{example.first_7_chars}</code> → subject = <code>{example.extracted_subject}</code>
            </p>
          )}
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} disabled={uploading} />
          {uploading && <p>Uploading...</p>}

          {sheets.length > 0 && (
            <table style={{ marginTop: "16px" }}>
              <thead>
                <tr><th>Select</th><th>Filename</th><th>Subject</th><th>Students</th></tr>
              </thead>
              <tbody>
                {sheets.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        style={{ width: "auto" }}
                        checked={selectedSheetIds.includes(s.id)}
                        onChange={() => toggleSheetSelection(s.id)}
                      />
                    </td>
                    <td>{s.filename}</td>
                    <td>{s.subject}</td>
                    <td>{s.roll_numbers?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>2. Configure blocks and rooms</h3>
          <label>Number of blocks</label>
          <input
            type="number"
            min="1"
            value={numBlocks}
            onChange={(e) => setNumBlocks(parseInt(e.target.value) || 1)}
            style={{ maxWidth: "120px" }}
          />

          {rooms.map((room, idx) => (
            <div key={idx} className="grid-2" style={{ alignItems: "end", marginBottom: "8px" }}>
              <div>
                <label>Block name</label>
                <input value={room.block_name} onChange={(e) => updateRoomField(idx, "block_name", e.target.value)} />
              </div>
              <div>
                <label>Room number</label>
                <input value={room.room_no} onChange={(e) => updateRoomField(idx, "room_no", e.target.value)} />
              </div>
              <div>
                <label>Capacity</label>
                <input
                  type="number"
                  value={room.capacity}
                  onChange={(e) => updateRoomField(idx, "capacity", e.target.value)}
                />
              </div>
              <div>
                <button className="secondary" onClick={() => removeRoom(idx)}>Remove</button>
              </div>
            </div>
          ))}
          <button className="secondary" onClick={addRoom}>+ Add room</button>
        </div>

        {error && <div className="error-text">{error}</div>}

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate seating"}
        </button>

        {result && (
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Seating summary</h3>
            <table>
              <thead><tr><th>Block</th><th>Room</th><th>Students</th></tr></thead>
              <tbody>
                {result.summary.map((s, i) => (
                  <tr key={i}>
                    <td>{s.block_name}</td>
                    <td>{s.room_no}</td>
                    <td>{s.num_students}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: "20px" }}>Full assignment list</h3>
            <table>
              <thead><tr><th>Roll No</th><th>Subject</th><th>Block</th><th>Room</th></tr></thead>
              <tbody>
                {result.assignments.map((a, i) => (
                  <tr key={i}>
                    <td>{a.roll_no}</td>
                    <td>{a.subject}</td>
                    <td>{a.block_name}</td>
                    <td>{a.room_no}</td>
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