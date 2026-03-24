import React from "react";

const VersionPanel = ({ versions, onRestore, onClose }) => (
  <div style={s.panel}>
    <div style={s.header}>
      <span style={s.title}>📜 Version History</span>
      <button onClick={onClose} style={s.closeBtn} title="Close">✕</button>
    </div>
    <div style={s.list}>
      {versions.length === 0 && (
        <p style={s.empty}>
          No versions saved yet.{"\n"}Click SAVE VERSION in the toolbar.
        </p>
      )}
      {versions.map((v, i) => (
        // Use savedAt + index as key — versions don't have unique IDs
        <div key={`${v.savedAt}-${i}`} style={s.versionCard}>
          <div style={s.versionMeta}>
            <span style={s.versionLabel}>v{versions.length - i}</span>
            <span style={s.versionTime}>
              {new Date(v.savedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div style={s.versionInfo}>
            {v.savedBy && (
              <span style={s.savedBy}>by {v.savedBy}</span>
            )}
            <span style={s.stats}>
              {v.language?.toUpperCase()} · {v.code ? v.code.split("\n").length : 0} lines
            </span>
          </div>
          <button onClick={() => onRestore(v)} style={s.restoreBtn}>
            ↩ RESTORE
          </button>
        </div>
      ))}
    </div>
  </div>
);

const s = {
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "260px",
    background: "#0A0F16",
    borderLeft: "1px solid #1E2D3D",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    fontFamily: "monospace",
    boxShadow: "-8px 0 24px rgba(0,0,0,0.4)",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #1E2D3D",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  title: {
    color: "#4ECDC4",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#3D5268",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: 1,
    padding: "2px 6px",
    borderRadius: "4px",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  empty: {
    color: "#2E4057",
    fontSize: "12px",
    textAlign: "center",
    marginTop: "16px",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
  versionCard: {
    background: "#111823",
    border: "1px solid #1E2D3D",
    borderRadius: "8px",
    padding: "12px",
  },
  versionMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  versionLabel: { color: "#7B9DB4", fontSize: "11px", fontWeight: 600 },
  versionTime: { color: "#2E4057", fontSize: "10px" },
  versionInfo: { display: "flex", gap: "8px", marginBottom: "10px" },
  savedBy: { color: "#4ECDC4", fontSize: "11px" },
  stats: { color: "#3D5268", fontSize: "11px" },
  restoreBtn: {
    background: "rgba(78,205,196,0.1)",
    border: "1px solid rgba(78,205,196,0.2)",
    borderRadius: "6px",
    padding: "5px 12px",
    color: "#4ECDC4",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
  },
};

export default VersionPanel;
