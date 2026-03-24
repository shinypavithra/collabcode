# CollabCode

A real-time collaborative code editor built with the **MERN stack** and **Socket.IO**.

## ✨ Features

- 🔴 **Live code sync** — everyone sees changes instantly via WebSocket
- 👁 **Remote cursors** — see where teammates are editing
- 💬 **Room chat** — built-in team messaging
- 📜 **Version history** — save and restore snapshots
- 🌐 **Multi-language** — JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown
- 🎨 **Monaco Editor** — the same engine that powers VS Code

## 🛠 Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Frontend  | React 18, Monaco Editor         |
| Realtime  | Socket.IO (WebSocket)           |
| Backend   | Node.js, Express                |
| Database  | MongoDB (Mongoose)              |
| HTTP client | Axios                         |

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/collabcode.git
cd collabcode

# Install all dependencies
npm run install:all
```

### Configuration

```bash
# Copy the example env file and fill in your values
cp server/.env.example server/.env
```

`.env` values:

| Variable     | Default                              | Description             |
| ------------ | ------------------------------------ | ----------------------- |
| `PORT`       | `5000`                               | Express server port     |
| `MONGO_URI`  | ``                                   | MongoDB connection URI |
| `CLIENT_URL` | `http://localhost:3000`              | CORS allowed origin     |

### Running in development

Open two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm start
```

App is available at **http://localhost:3000**

## 📁 Project Structure

```
collabcode/
├── server/
│   ├── index.js              # Express + Socket.IO entry point
│   ├── models/
│   │   └── Room.js           # Mongoose schema
│   ├── routes/
│   │   └── rooms.js          # REST API routes
│   ├── middleware/
│   │   └── errorHandler.js   # Global error handler
│   └── package.json
│
└── client/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── socket.js          # Socket.IO singleton
        ├── hooks/
        │   └── useRoom.js     # All socket logic in one hook
        ├── pages/
        │   ├── Lobby.js       # Join / Create room screen
        │   └── Room.js        # Main editor screen
        └── components/
            ├── CodeEditor.js  # Monaco wrapper
            ├── Chat.js        # Room chat
            ├── UserList.js    # Online users sidebar
            └── VersionPanel.js # Version history panel
```

## 🔌 Socket.IO Events

| Event              | Direction       | Description                        |
| ------------------ | --------------- | ---------------------------------- |
| `join_room`        | client → server | Join a room by ID                  |
| `room_state`       | server → client | Initial room data on join          |
| `code_change`      | client → server | Broadcast code update              |
| `code_update`      | server → client | Receive code from another user     |
| `cursor_move`      | client → server | Send cursor position               |
| `cursor_update`    | server → client | Receive remote cursor position     |
| `chat_message`     | client → server | Send a chat message                |
| `new_message`      | server → client | Receive a chat message             |
| `save_version`     | client → server | Save current code snapshot         |
| `version_saved`    | server → client | Confirm + broadcast version saved  |
| `restore_version`  | client → server | Restore a previous version         |
| `language_change`  | client → server | Change editor language             |
| `user_joined`      | server → client | A user joined the room             |
| `user_left`        | server → client | A user left the room               |
