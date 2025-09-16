import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import soundManager from '../utils/soundEffects'

function SoundControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled)
  const [volume, setVolume] = useState(soundManager.volume * 100)

  const toggleSound = () => {
    const newEnabled = !soundEnabled
    setSoundEnabled(newEnabled)
    soundManager.setEnabled(newEnabled)
    if (newEnabled) {
      soundManager.play('click')
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    soundManager.setVolume(newVolume / 100)
    soundManager.play('click')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl p-4 w-64"
          >
            <h3 className="font-bold text-gray-800 mb-4">Configuración de Sonido</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Sonido</span>
                <button
                  onClick={toggleSound}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: soundEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </button>
              </div>
              
              {soundEnabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Volumen</span>
                    <span className="text-sm text-gray-500">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => soundManager.play('placeDomino')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Probar sonido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg 
          className="w-6 h-6 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {soundEnabled ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" 
            />
          )}
        </svg>
      </motion.button>
    </div>
  )
}

export default SoundControls