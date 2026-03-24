import React, { useState } from "react";
import useRoom from "../hooks/useRoom";
import CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import UserList from "../components/UserList";
import VersionPanel from "../components/VersionPanel";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "json",
  "markdown",
];

const Room = ({ session, onLeave }) => {
  const { name, roomId } = session;
  const {
    code,
    language,
    messages,
    users,
    remoteCursors,
    versions,
    connected,
    mySocketId,
    handleCodeChange,
    handleLanguageChange,
    handleCursorMove,
    handleSendMessage,
    handleSaveVersion,
    handleRestoreVersion,
  } = useRoom(roomId, name);

  const [showChat, setShowChat] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userList = Object.entries(users);

  return (
    <div style={s.root}>
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div style={s.toolbar}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={s.logoIcon}>⌨</span>
          <span style={s.logoText}>
            Collab<span style={{ color: "#4ECDC4" }}>Code</span>
          </span>
        </div>

        <div style={s.divider} />

        {/* Room chip */}
        <div style={s.roomChip} onClick={copyRoomId} title="Click to copy">
          <div
            style={{
              ...s.statusDot,
              background: connected ? "#4ECDC4" : "#FF6B6B",
            }}
          />
          <span style={s.roomIdText}>#{roomId}</span>
          <span style={s.copyHint}>{copied ? "copied!" : "copy"}</span>
        </div>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={s.langSelect}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Online avatars */}
        <div style={s.avatars}>
          {userList.slice(0, 6).map(([sid, u], i) => (
            <div
              key={sid}
              title={u.name}
              style={{
                ...s.avatar,
                background: u.color,
                marginLeft: i > 0 ? "-8px" : "0",
              }}
            >
              {u.name?.[0]?.toUpperCase()}
            </div>
          ))}
          <span style={s.onlineCount}>{userList.length} online</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <button onClick={handleSaveVersion} style={s.toolBtn}>
          SAVE VERSION
        </button>
        <button
          onClick={() => setShowVersions((v) => !v)}
          style={{ ...s.toolBtn, ...(showVersions ? s.toolBtnActive : {}) }}
        >
          HISTORY
        </button>
        <button
          onClick={() => setShowChat((v) => !v)}
          style={{ ...s.toolBtn, ...(showChat ? s.toolBtnActive : {}) }}
        >
          CHAT
        </button>
        <button onClick={onLeave} style={s.leaveBtn}>
          LEAVE
        </button>
      </div>

      {/* ── Main area ──────────────────────────────────────── */}
      <div style={s.main}>
        {/* Editor pane */}
        <div style={s.editorWrap}>
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onCursorMove={handleCursorMove}
            remoteCursors={remoteCursors}
          />

          {/* Status bar */}
          <div style={s.statusBar}>
            <span style={s.statusItem}>{language.toUpperCase()}</span>
            <span style={s.statusItem}>{code.split("\n").length} lines</span>
            <span style={s.statusItem}>{code.length} chars</span>
            <div style={{ flex: 1 }} />
            <div style={s.liveIndicator}>
              <div
                style={{
                  ...s.liveDot,
                  background: connected ? "#4ECDC4" : "#FF6B6B",
                }}
              />
              <span style={s.statusItem}>
                {connected ? "Live sync on" : "Reconnecting…"}
              </span>
            </div>
          </div>

          {/* Version panel overlay */}
          {showVersions && (
            <VersionPanel
              versions={versions}
              onRestore={(v) => {
                handleRestoreVersion(v);
                setShowVersions(false);
              }}
              onClose={() => setShowVersions(false)}
            />
          )}
        </div>

        {/* Sidebar: users + chat */}
        {showChat && (
          <div style={s.sidebar}>
            <UserList users={users} mySocketId={mySocketId} />
            <Chat
              messages={messages}
              onSend={handleSendMessage}
              mySocketId={mySocketId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Styles outside the component — not recreated on every render
const s = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#080D13",
    fontFamily: "monospace",
    overflow: "hidden",
  },
  toolbar: {
    height: "52px",
    background: "#0D1117",
    borderBottom: "1px solid #1E2D3D",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 16px",
    flexShrink: 0,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "8px" },
  logoIcon: {
    fontSize: "18px",
    background: "linear-gradient(135deg,#4ECDC4,#45B7D1)",
    borderRadius: "6px",
    padding: "4px 7px",
    color: "#0A0F16",
    fontWeight: 800,
  },
  logoText: { color: "#EEFFFF", fontWeight: 800, fontSize: "14px" },
  divider: { width: "1px", height: "24px", background: "#1E2D3D" },
  roomChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "8px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%" },
  roomIdText: {
    color: "#4ECDC4",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  copyHint: { color: "#2E4057", fontSize: "10px" },
  langSelect: {
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "8px",
    padding: "5px 8px",
    color: "#C8D8E8",
    fontSize: "11px",
    fontFamily: "inherit",
    cursor: "pointer",
    fontWeight: 600,
  },
  avatars: { display: "flex", alignItems: "center" },
  avatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "2px solid #0D1117",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 800,
    color: "#0A0F16",
  },
  onlineCount: { color: "#3D5268", fontSize: "11px", marginLeft: "10px" },
  toolBtn: {
    background: "none",
    border: "1px solid #1E2D3D",
    borderRadius: "6px",
    padding: "5px 10px",
    color: "#7B9DB4",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  toolBtnActive: {
    background: "rgba(78,205,196,0.1)",
    border: "1px solid rgba(78,205,196,0.3)",
    color: "#4ECDC4",
  },
  leaveBtn: {
    background: "none",
    border: "1px solid rgba(255,107,107,0.25)",
    borderRadius: "6px",
    padding: "5px 10px",
    color: "#FF6B6B",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  main: { flex: 1, display: "flex", overflow: "hidden" },
  editorWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    background: "#0D1117",
  },
  statusBar: {
    height: "24px",
    background: "#080D13",
    borderTop: "1px solid #1E2D3D",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: "16px",
    flexShrink: 0,
  },
  statusItem: { color: "#2E4057", fontSize: "11px" },
  liveIndicator: { display: "flex", alignItems: "center", gap: "6px" },
  liveDot: { width: "5px", height: "5px", borderRadius: "50%" },
  sidebar: {
    width: "280px",
    flexShrink: 0,
    borderLeft: "1px solid #1E2D3D",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

export default Room;
