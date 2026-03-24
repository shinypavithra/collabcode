import React from "react";

const UserList = ({ users, mySocketId }) => {
  const userEntries = Object.entries(users);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.dot} />
        <span style={s.title}>Online ({userEntries.length})</span>
      </div>
      <div style={s.list}>
        {userEntries.map(([socketId, user]) => (
          <div key={socketId} style={s.userRow}>
            <div style={{ ...s.avatar, background: user.color }}>
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
            <span
              style={{
                ...s.name,
                color: socketId === mySocketId ? "#EEFFFF" : "#7B9DB4",
              }}
            >
              {user.name}
              {socketId === mySocketId && (
                <span style={s.youTag}> (you)</span>
              )}
            </span>
            <div style={{ ...s.onlineDot, background: user.color }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Defined outside — avoids re-creating this object on every render
const s = {
  container: { borderBottom: "1px solid #1E2D3D", fontFamily: "monospace" },
  header: {
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#4ECDC4",
    borderRadius: "50%",
  },
  title: {
    color: "#3D5268",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  list: {
    padding: "0 16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  userRow: { display: "flex", alignItems: "center", gap: "8px" },
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
  name: { fontSize: "12px", flex: 1 },
  youTag: { color: "#3D5268", fontSize: "11px" },
  onlineDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
};

export default UserList;
