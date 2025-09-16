import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function JogatinaHome() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')

  const handlePlayWithBot = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    
    localStorage.setItem('playerName', playerName)
    navigate('/game/bot', { 
      state: { 
        mode: 'bot',
        playerName
      } 
    })
  }

  const handleMultiplayer = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    
    localStorage.setItem('playerName', playerName)
    navigate('/lobby', { 
      state: { 
        action: 'create',
        playerName
      } 
    })
  }

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Dominó Dominicano
          </h1>
          <p className="text-gray-600">¡El juego tradicional!</p>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Tu nombre"
            maxLength={20}
          />
        </div>

        {/* Buttons - Jogatina style: large, colorful */}
        <div className="space-y-3">
          {/* Main Play Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayWithBot}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-colors"
          >
            🎮 JUGAR
          </motion.button>

          {/* Multiplayer Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMultiplayer}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg transition-colors"
          >
            👥 Multijugador
          </motion.button>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow transition-colors">
              🏆 Ranking
            </button>
            <button className="py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg shadow transition-colors">
              🏪 Tienda
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Versión 1.0</p>
        </div>
      </motion.div>
    </div>
  )
}

export default JogatinaHome