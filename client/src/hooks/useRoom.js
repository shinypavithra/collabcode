import { useState, useEffect, useRef, useCallback } from "react";
import { connectSocket, disconnectSocket } from "../socket";

const useRoom = (roomId, userName) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [remoteCursors, setRemoteCursors] = useState({});
  const [versions, setVersions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [mySocketId, setMySocketId] = useState(null);

  const socketRef = useRef(null);
  const codeTimer = useRef(null);
  // Keep a ref to language so the debounced emit always sends the latest value
  // without needing to re-create the callback (avoids stale closure).
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    if (!roomId || !userName) return;

    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setMySocketId(socket.id);
      socket.emit("join_room", { roomId, userName });
    };

    const onRoomState = ({ code: c, language: l, messages: m, users: u, versions: v }) => {
      setCode(c);
      setLanguage(l);
      setMessages(m || []);
      setUsers(u || {});
      setVersions(v || []);
    };

    const onUserJoined = ({ socketId, name, color }) =>
      setUsers((prev) => ({ ...prev, [socketId]: { name, color } }));

    const onUserLeft = ({ socketId }) => {
      setUsers((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
      setRemoteCursors((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
    };

    const onUsersUpdate = (u) => setUsers(u);

    const onCodeUpdate = ({ code: c, language: l }) => {
      setCode(c);
      if (l) setLanguage(l);
    };

    const onLanguageUpdate = ({ language: l }) => setLanguage(l);

    const onCursorUpdate = ({ socketId, line, col, name, color }) =>
      setRemoteCursors((prev) => ({ ...prev, [socketId]: { line, col, name, color } }));

    const onNewMessage = (msg) => setMessages((prev) => [...prev, msg]);

    const onVersionSaved = (v) =>
      setVersions((prev) => [v, ...prev].slice(0, 20));

    const onVersionRestored = ({ code: c, language: l }) => {
      setCode(c);
      setLanguage(l);
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("room_state", onRoomState);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("users_update", onUsersUpdate);
    socket.on("code_update", onCodeUpdate);
    socket.on("language_update", onLanguageUpdate);
    socket.on("cursor_update", onCursorUpdate);
    socket.on("new_message", onNewMessage);
    socket.on("version_saved", onVersionSaved);
    socket.on("version_restored", onVersionRestored);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("room_state", onRoomState);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("users_update", onUsersUpdate);
      socket.off("code_update", onCodeUpdate);
      socket.off("language_update", onLanguageUpdate);
      socket.off("cursor_update", onCursorUpdate);
      socket.off("new_message", onNewMessage);
      socket.off("version_saved", onVersionSaved);
      socket.off("version_restored", onVersionRestored);
      socket.off("disconnect", onDisconnect);
      clearTimeout(codeTimer.current);
      disconnectSocket();
    };
  }, [roomId, userName]);

  // ── Handlers ──────────────────────────────────────────────

  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);
      clearTimeout(codeTimer.current);
      codeTimer.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("code_change", {
            roomId,
            code: newCode,
            // Use ref so we always emit the current language without re-creating this callback
            language: languageRef.current,
          });
        }
      }, 50);
    },
    [roomId]
  );

  const handleLanguageChange = useCallback(
    (lang) => {
      setLanguage(lang);
      socketRef.current?.connected &&
        socketRef.current.emit("language_change", { roomId, language: lang });
    },
    [roomId]
  );

  const handleCursorMove = useCallback(
    (line, col) => {
      socketRef.current?.connected &&
        socketRef.current.emit("cursor_move", { roomId, line, col });
    },
    [roomId]
  );

  const handleSendMessage = useCallback(
    (text) => {
      socketRef.current?.connected &&
        socketRef.current.emit("chat_message", { roomId, text });
    },
    [roomId]
  );

  const handleSaveVersion = useCallback(() => {
    socketRef.current?.connected &&
      socketRef.current.emit("save_version", {
        roomId,
        code,
        language: languageRef.current,
      });
  }, [roomId, code]);

  const handleRestoreVersion = useCallback(
    (version) => {
      socketRef.current?.connected &&
        socketRef.current.emit("restore_version", {
          roomId,
          code: version.code,
          language: version.language,
        });
    },
    [roomId]
  );

  return {
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
  };
};

export default useRoom;
