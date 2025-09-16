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
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl">🁣</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dominó Online
          </h1>
          <p className="text-gray-600 text-sm">¡Juega gratis con amigos!</p>
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
            className="w-full py-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold text-xl rounded-xl shadow-lg transition-all duration-200"
          >
            ▶️ JUGAR AHORA
          </motion.button>

          {/* Game Mode Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-colors flex flex-col items-center">
              <span className="text-2xl">⚡</span>
              <span className="text-sm">Turbo</span>
            </button>
            <button className="py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-colors flex flex-col items-center">
              <span className="text-2xl">🎯</span>
              <span className="text-sm">Clásico</span>
            </button>
          </div>

          {/* Multiplayer Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMultiplayer}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            👥 Crear Sala Privada
          </motion.button>

          {/* Secondary Options */}
          <div className="grid grid-cols-3 gap-2">
            <button className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
              📊 Stats
            </button>
            <button className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
              🏆 Ranking
            </button>
            <button className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
              ⚙️ Ajustes
            </button>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-3">O conecta con:</p>
          <div className="flex justify-center gap-3">
            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
              <span className="text-xl">f</span>
            </button>
            <button className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
              <span className="text-xl">G</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Más de 1 millón de jugadores</p>
          <p className="mt-1">Versión 1.0 | HD Graphics</p>
        </div>
      </motion.div>
    </div>
  )
}

export default JogatinaHome