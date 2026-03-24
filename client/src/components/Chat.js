import React, { useState, useEffect, useRef } from "react";

const Chat = ({ messages, onSend, mySocketId }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerIcon}>💬</span>
        <span style={s.title}>Chat</span>
        <span style={s.count}>{messages.length}</span>
      </div>

      {/* Message list */}
      <div style={s.messageList}>
        {messages.length === 0 && (
          <p style={s.empty}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.socketId === mySocketId;
          return (
            <div key={i} style={{ ...s.messageRow, justifyContent: isMe ? "flex-end" : "flex-start" }}>
              {!isMe && (
                <div style={{ ...s.avatar, background: msg.color }}>
                  {msg.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div style={s.bubble}>
                {!isMe && (
                  <span style={{ ...s.senderName, color: msg.color }}>{msg.name}</span>
                )}
                <p style={{ ...s.messageText, alignSelf: isMe ? "flex-end" : "flex-start",
                  background: isMe ? "rgba(78,205,196,0.15)" : "#111823",
                  border: isMe ? "1px solid rgba(78,205,196,0.25)" : "1px solid #1E2D3D",
                }}>
                  {msg.text}
                </p>
                <span style={{ ...s.timestamp, alignSelf: isMe ? "flex-end" : "flex-start" }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {isMe && (
                <div style={{ ...s.avatar, background: msg.color }}>
                  {msg.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={s.input}
          maxLength={1000}
        />
        <button onClick={handleSend} disabled={!text.trim()} style={s.sendBtn}>
          ➤
        </button>
      </div>
    </div>
  );
};

const s = {
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
    fontFamily: "monospace",
    minHeight: 0,
  },
  header: {
    padding: "10px 16px",
    borderBottom: "1px solid #1E2D3D",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  headerIcon: { fontSize: "13px" },
  title: {
    color: "#3D5268",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    flex: 1,
  },
  count: {
    background: "#1E2D3D",
    color: "#4ECDC4",
    fontSize: "9px",
    fontWeight: 700,
    borderRadius: "10px",
    padding: "2px 6px",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minHeight: 0,
  },
  empty: {
    color: "#2E4057",
    fontSize: "12px",
    textAlign: "center",
    marginTop: "20px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
  },
  avatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 800,
    color: "#0A0F16",
    flexShrink: 0,
  },
  bubble: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    maxWidth: "75%",
  },
  senderName: {
    fontSize: "10px",
    fontWeight: 700,
    paddingLeft: "4px",
  },
  messageText: {
    margin: 0,
    padding: "7px 10px",
    borderRadius: "10px",
    color: "#C8D8E8",
    fontSize: "12px",
    lineHeight: 1.5,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  timestamp: {
    display: "flex",
    color: "#2E4057",
    fontSize: "9px",
    paddingLeft: "4px",
    paddingRight: "4px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    padding: "10px 12px",
    borderTop: "1px solid #1E2D3D",
    flexShrink: 0,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "#EEFFFF",
    fontSize: "12px",
    fontFamily: "monospace",
    resize: "none",
    outline: "none",
    lineHeight: 1.4,
  },
  sendBtn: {
    background: "linear-gradient(135deg, #4ECDC4, #45B7D1)",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#0A0F16",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    flexShrink: 0,
    opacity: 1,
    transition: "opacity 0.2s",
  },
};

export default Chat;
