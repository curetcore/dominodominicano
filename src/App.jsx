import React from 'react'
import { Routes, Route } from 'react-router-dom'
import JogatinaHome from './pages/JogatinaHome'
import GameRoom from './pages/GameRoom'
import JogatinaGameRoom from './pages/JogatinaGameRoom'
import Lobby from './pages/Lobby'

function App() {
  return (
    <Routes>
      <Route path="/" element={<JogatinaHome />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/game/bot" element={<JogatinaGameRoom />} />
      <Route path="/game/:roomId" element={<GameRoom />} />
    </Routes>
  )
}

export default App