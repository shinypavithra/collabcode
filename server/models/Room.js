const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  socketId: { type: String },
  name: { type: String, required: true },
  color: { type: String },
  text: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now },
});

const versionSchema = new mongoose.Schema({
  code: { type: String },
  language: { type: String },
  savedBy: { type: String },
  savedAt: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 16,
    },
    code: { type: String, default: "// Start coding here\n" },
    language: {
      type: String,
      default: "javascript",
      enum: ["javascript", "typescript", "python", "html", "css", "json", "markdown"],
    },
    messages: { type: [messageSchema], default: [] },
    versions: { type: [versionSchema], default: [] },
  },
  {
    // Use built-in Mongoose timestamps — no need to manage manually
    timestamps: true,
  }
);

// Index for fast lookups
roomSchema.index({ roomId: 1 });

module.exports = mongoose.model("Room", roomSchema);
