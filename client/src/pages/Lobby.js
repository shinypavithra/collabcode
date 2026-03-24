import React, { useState } from "react";
import axios from "axios";

const FEATURES = [
  ["⚡", "Real-time sync"],
  ["👁", "Live cursors"],
  ["💬", "Team chat"],
  ["📜", "Version history"],
];

const Lobby = ({ onJoin }) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("join"); // "join" | "create"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Please enter your name");
    if (mode === "join" && !roomId.trim()) return setError("Please enter a Room ID");
    setError("");
    setLoading(true);

    try {
      let id = roomId.trim().toUpperCase();

      if (mode === "create") {
        const res = await axios.post("/api/rooms");
        id = res.data.roomId;
      } else {
        const res = await axios.get(`/api/rooms/${id}`);
        if (!res.data.exists) {
          setError("Room not found. Check the ID or create a new room.");
          setLoading(false);
          return;
        }
      }

      onJoin({ name: name.trim(), roomId: id });
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Room not found. Check the ID or create a new room.");
      } else {
        setError(err.response?.data?.error || err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const genRandom = () =>
    setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase());

  const handleKey = (e) => e.key === "Enter" && handleSubmit();

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <span style={s.logoIcon}>⌨</span>
          <span style={s.logoText}>
            Collab<span style={{ color: "#4ECDC4" }}>Code</span>
          </span>
        </div>
        <p style={s.subtitle}>Real-time collaborative code editor</p>

        {/* Tabs */}
        <div style={s.tabs}>
          {["join", "create"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{ ...s.tab, ...(mode === m ? s.tabActive : {}) }}
            >
              {m === "join" ? "Join Room" : "Create Room"}
            </button>
          ))}
        </div>

        {/* Name input */}
        <label style={s.label}>Your Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alice"
          style={s.input}
          onKeyDown={handleKey}
          maxLength={32}
          autoFocus
        />

        {/* Room ID input */}
        <label style={{ ...s.label, marginTop: "12px" }}>Room ID</label>
        <div style={{ position: "relative" }}>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder={
              mode === "create" ? "Click RANDOM or type one" : "Enter room code"
            }
            style={{ ...s.input, paddingRight: "110px" }}
            onKeyDown={handleKey}
            maxLength={16}
          />
          <button onClick={genRandom} style={s.randomBtn}>
            RANDOM
          </button>
        </div>

        {/* Error */}
        {error && <p style={s.error}>⚠ {error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
        >
          {loading
            ? "Connecting…"
            : mode === "join"
            ? "→ JOIN ROOM"
            : "→ CREATE ROOM"}
        </button>

        {/* Feature badges */}
        <div style={s.features}>
          {FEATURES.map(([icon, label]) => (
            <div key={label} style={s.feature}>
              <span>{icon}</span>
              <span style={s.featureLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#080D13",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    padding: "20px",
  },
  card: {
    background: "#0D1117",
    border: "1px solid #1E2D3D",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "8px",
  },
  logoIcon: {
    fontSize: "26px",
    background: "linear-gradient(135deg,#4ECDC4,#45B7D1)",
    borderRadius: "8px",
    padding: "6px 10px",
  },
  logoText: { fontSize: "26px", fontWeight: 800, color: "#EEFFFF" },
  subtitle: {
    textAlign: "center",
    color: "#3D5268",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "28px",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #1E2D3D",
    marginBottom: "24px",
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "none",
    border: "none",
    color: "#3D5268",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#4ECDC4",
    borderBottom: "2px solid #4ECDC4",
    background: "rgba(78,205,196,0.06)",
  },
  label: {
    display: "block",
    color: "#4ECDC4",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "10px",
    padding: "11px 12px",
    color: "#EEFFFF",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },
  randomBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(78,205,196,0.1)",
    border: "1px solid rgba(78,205,196,0.2)",
    borderRadius: "6px",
    padding: "5px 10px",
    color: "#4ECDC4",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  error: { color: "#FF6B6B", fontSize: "12px", margin: "8px 0 0" },
  submitBtn: {
    display: "block",
    width: "100%",
    marginTop: "20px",
    background: "linear-gradient(135deg,#4ECDC4,#45B7D1)",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    color: "#0A0F16",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    transition: "opacity 0.2s",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "24px",
  },
  feature: {
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "14px",
  },
  featureLabel: { color: "#3D5268", fontSize: "11px" },
};

export default Lobby;
