require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const roomRoutes = require("./routes/rooms");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Express middleware ─────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/api/rooms", roomRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

// 404 fallback for unknown API routes
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ── In-memory room state ───────────────────────────────────
/** @type {Record<string, { users: Record<string, { name: string, color: string, cursor: null | { line: number, col: number } }> }>} */
const roomState = {};

const USER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F78C6C", "#BB8FCE", "#85C1E9",
];
let colorIndex = 0;
const getColor = () => USER_COLORS[(colorIndex++) % USER_COLORS.length];

// ── Default starter code per language ─────────────────────
const DEFAULT_CODE = {
  javascript:
    "// Welcome to CollabCode!\n// Start typing — everyone sees your changes in real-time\n\nasync function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    return await res.json();\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}\n\nfetchData('https://api.example.com/data').then(console.log);\n",
  python:
    "# Welcome to CollabCode!\n\nimport asyncio\n\nasync def fetch_data(url: str) -> dict:\n    pass  # TODO: implement\n\nasync def main():\n    data = await fetch_data('https://api.example.com')\n    print(data)\n\nif __name__ == '__main__':\n    asyncio.run(main())\n",
  typescript:
    "// Welcome to CollabCode!\n\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n}\n\nasync function fetchData<T>(url: string): Promise<ApiResponse<T>> {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);\n  return response.json();\n}\n",
};

const getDefaultCode = (language) =>
  DEFAULT_CODE[language] || "// Welcome to CollabCode!\n";

// ── DB save debounce map ───────────────────────────────────
const dbSaveTimers = {};
const debouncedSaveCode = (roomId, code, language, delayMs = 500) => {
  clearTimeout(dbSaveTimers[roomId]);
  dbSaveTimers[roomId] = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { code, language, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (err) {
      console.error("debouncedSaveCode error:", err.message);
    }
  }, delayMs);
};

// ── Socket.IO handlers ─────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  // ── join_room ──────────────────────────────────────────
  socket.on("join_room", async ({ roomId, userName }) => {
    if (!roomId || !userName) {
      return socket.emit("error", { message: "roomId and userName are required" });
    }
    const id = String(roomId).toUpperCase().trim();
    const name = String(userName).trim().slice(0, 32);

    try {
      socket.join(id);
      if (!roomState[id]) roomState[id] = { users: {} };

      const color = getColor();
      roomState[id].users[socket.id] = { name, color, cursor: null };

      let room = await Room.findOne({ roomId: id });
      if (!room) {
        room = await Room.create({
          roomId: id,
          code: getDefaultCode("javascript"),
          language: "javascript",
        });
      }

      socket.emit("room_state", {
        code: room.code,
        language: room.language,
        messages: room.messages.slice(-100),
        users: roomState[id].users,
        versions: room.versions.slice(-20).reverse(),
      });

      socket.to(id).emit("user_joined", { socketId: socket.id, name, color });
      io.to(id).emit("users_update", roomState[id].users);
      console.log(`[room] "${name}" joined #${id}`);
    } catch (err) {
      console.error("join_room error:", err.message);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // ── code_change ────────────────────────────────────────
  socket.on("code_change", ({ roomId, code, language }) => {
    const id = String(roomId).toUpperCase();
    socket.to(id).emit("code_update", { code, language });
    debouncedSaveCode(id, code, language);
  });

  // ── cursor_move ────────────────────────────────────────
  socket.on("cursor_move", ({ roomId, line, col }) => {
    const id = String(roomId).toUpperCase();
    const user = roomState[id]?.users[socket.id];
    if (!user) return;
    user.cursor = { line, col };
    socket.to(id).emit("cursor_update", {
      socketId: socket.id,
      line,
      col,
      name: user.name,
      color: user.color,
    });
  });

  // ── chat_message ───────────────────────────────────────
  socket.on("chat_message", async ({ roomId, text }) => {
    const id = String(roomId).toUpperCase();
    const user = roomState[id]?.users[socket.id];
    if (!user || !text?.trim()) return;

    const message = {
      socketId: socket.id,
      name: user.name,
      color: user.color,
      text: String(text).trim().slice(0, 1000),
      timestamp: new Date(),
    };
    io.to(id).emit("new_message", message);

    try {
      await Room.findOneAndUpdate(
        { roomId: id },
        { $push: { messages: { $each: [message], $slice: -200 } } }
      );
    } catch (err) {
      console.error("chat_message DB error:", err.message);
    }
  });

  // ── save_version ───────────────────────────────────────
  socket.on("save_version", async ({ roomId, code, language }) => {
    const id = String(roomId).toUpperCase();
    const user = roomState[id]?.users[socket.id];
    try {
      const version = {
        code,
        language,
        savedAt: new Date(),
        savedBy: user?.name || "Unknown",
      };
      await Room.findOneAndUpdate(
        { roomId: id },
        { $push: { versions: { $each: [version], $slice: -20 } } }
      );
      io.to(id).emit("version_saved", version);
    } catch (err) {
      console.error("save_version error:", err.message);
      socket.emit("error", { message: "Failed to save version" });
    }
  });

  // ── restore_version ────────────────────────────────────
  socket.on("restore_version", async ({ roomId, code, language }) => {
    const id = String(roomId).toUpperCase();
    try {
      await Room.findOneAndUpdate({ roomId: id }, { code, language });
      io.to(id).emit("code_update", { code, language });
      io.to(id).emit("version_restored", { code, language });
    } catch (err) {
      console.error("restore_version error:", err.message);
      socket.emit("error", { message: "Failed to restore version" });
    }
  });

  // ── language_change ────────────────────────────────────
  socket.on("language_change", async ({ roomId, language }) => {
    const id = String(roomId).toUpperCase();
    socket.to(id).emit("language_update", { language });
    try {
      await Room.findOneAndUpdate({ roomId: id }, { language });
    } catch (err) {
      console.error("language_change error:", err.message);
    }
  });

  // ── disconnecting ──────────────────────────────────────
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const state = roomState[roomId];
      if (!state?.users[socket.id]) continue;
      delete state.users[socket.id];
      socket.to(roomId).emit("user_left", { socketId: socket.id });
      io.to(roomId).emit("users_update", state.users);
      if (Object.keys(state.users).length === 0) delete roomState[roomId];
    }
  });

  socket.on("disconnect", () =>
    console.log(`[socket] disconnected: ${socket.id}`)
  );
});

// ── Start server ───────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
