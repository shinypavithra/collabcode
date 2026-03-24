const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");

/**
 * GET /api/rooms/:roomId
 * Check if a room exists (used by Lobby before joining)
 */
router.get("/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase().trim();
    const room = await Room.findOne({ roomId }, "roomId language updatedAt");
    if (!room) return res.status(404).json({ exists: false });
    res.json({ exists: true, language: room.language, updatedAt: room.updatedAt });
  } catch (err) {
    console.error("GET /rooms/:id error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/rooms
 * Create a new room and return its ID
 */
router.post("/", async (req, res) => {
  try {
    // Use first 6 chars of a UUID (hex) — more collision-resistant than Math.random
    const roomId = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
    const room = await Room.create({ roomId, code: "// Start coding!\n", language: "javascript" });
    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    console.error("POST /rooms error:", err.message);
    res.status(500).json({ error: "Could not create room" });
  }
});

/**
 * GET /api/rooms/:roomId/versions
 * Fetch version history for a room (newest first)
 */
router.get("/:roomId/versions", async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase().trim();
    const room = await Room.findOne({ roomId }, "versions");
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room.versions.slice(-20).reverse());
  } catch (err) {
    console.error("GET /rooms/:id/versions error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
