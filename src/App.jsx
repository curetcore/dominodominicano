import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GameRoom from './pages/GameRoom'
import BotGameRoom from './pages/BotGameRoom'
import Lobby from './pages/Lobby'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-800">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/bot" element={<BotGameRoom />} />
        <Route path="/game/:roomId" element={<GameRoom />} />
      </Routes>
    </div>
  )
}

export default App