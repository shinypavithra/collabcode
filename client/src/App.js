import React, { useState } from "react";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import "./App.css";

const App = () => {
  const [session, setSession] = useState(null);

  if (!session) {
    return <Lobby onJoin={(s) => setSession(s)} />;
  }

  return <Room session={session} onLeave={() => setSession(null)} />;
};

export default App;
