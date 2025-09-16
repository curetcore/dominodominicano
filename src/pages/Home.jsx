import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GAME_MODES, TEAM_MODES } from '../../shared/gameLogic'
import PlayerProgress from '../components/PlayerProgress'
import TournamentList from '../components/TournamentList'
import { PlayerProgress as Progress } from '../utils/gameProgress'

function Home() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [roomSettings, setRoomSettings] = useState({
    name: '',
    mode: GAME_MODES.DOMINICAN,
    teamMode: TEAM_MODES.PAIRS,
    winningScore: 200
  })
  const [showProgress, setShowProgress] = useState(false)
  const [showTournaments, setShowTournaments] = useState(false)
  const [playerStats, setPlayerStats] = useState(null)

  useEffect(() => {
    const savedName = localStorage.getItem('playerName')
    if (savedName) {
      setPlayerName(savedName)
      const progress = new Progress(savedName)
      setPlayerStats(progress.getStats())
    }
  }, [])

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    
    localStorage.setItem('playerName', playerName)
    navigate('/lobby', { 
      state: { 
        action: 'create',
        playerName,
        roomSettings 
      } 
    })
  }

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Por favor ingresa tu nombre y el código de sala')
      return
    }
    
    localStorage.setItem('playerName', playerName)
    navigate('/lobby', { 
      state: { 
        action: 'join',
        playerName,
        roomCode: roomCode.toUpperCase()
      } 
    })
  }

  const handlePlayWithBot = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    
    localStorage.setItem('playerName', playerName)
    navigate('/game/bot', { 
      state: { 
        mode: 'bot',
        playerName,
        difficulty: 'medium' // Podríamos agregar selector de dificultad
      } 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-bebas text-6xl text-dominican-blue mb-2">
            DOMINÓ DOMINICANO
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-dominican-blue"></div>
            <div className="w-6 h-3 bg-white border-2 border-dominican-blue"></div>
            <div className="w-3 h-3 bg-dominican-red"></div>
          </div>
          
          {playerStats && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <button
                onClick={() => setShowProgress(true)}
                className="flex items-center gap-2 hover:text-dominican-blue transition-colors"
              >
                <div className="w-10 h-10 bg-dominican-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bebas">{playerStats.level}</span>
                </div>
                <div className="text-left">
                  <p className="font-bold">Nivel {playerStats.level}</p>
                  <p className="text-xs text-gray-600">{playerStats.xp} XP</p>
                </div>
              </button>
              
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="font-bold">🪙 {playerStats.coins.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Fichas</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">💎 {playerStats.diamonds}</p>
                  <p className="text-xs text-gray-600">Diamantes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!showCreateRoom ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu Nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dominican-blue focus:border-transparent"
                placeholder="Ingresa tu nombre"
                maxLength={20}
              />
            </div>

            <div className="space-y-3">
              {/* Opción principal - Jugar contra Bot */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                <h3 className="font-bold text-green-800 mb-2">🤖 Jugar Solo</h3>
                <p className="text-sm text-gray-600 mb-3">Practica contra la computadora</p>
                <button
                  onClick={() => handlePlayWithBot()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Jugar con Bot
                </button>
              </div>

              {/* Opciones multijugador */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">👥 Multijugador</h3>
                
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="w-full btn-primary mb-2"
                >
                  Crear Sala Privada
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dominican-blue focus:border-transparent"
                    placeholder="Código"
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Unirse
                  </button>
                </div>
              </div>

              {/* Torneos */}
              <button
                onClick={() => setShowTournaments(true)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🏆</span>
                <span>Torneos</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setShowCreateRoom(false)}
              className="text-dominican-blue hover:underline text-sm"
            >
              ← Volver
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sala
              </label>
              <input
                type="text"
                value={roomSettings.name}
                onChange={(e) => setRoomSettings({...roomSettings, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dominican-blue focus:border-transparent"
                placeholder="Mi Sala de Dominó"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Juego
              </label>
              <select
                value={roomSettings.mode}
                onChange={(e) => setRoomSettings({...roomSettings, mode: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dominican-blue focus:border-transparent"
              >
                <option value={GAME_MODES.DOMINICAN}>Dominicano (200 puntos)</option>
                <option value={GAME_MODES.CLASSIC}>Clásico (100 puntos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Juego
              </label>
              <select
                value={roomSettings.teamMode}
                onChange={(e) => setRoomSettings({...roomSettings, teamMode: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dominican-blue focus:border-transparent"
              >
                <option value={TEAM_MODES.PAIRS}>Parejas (2 vs 2)</option>
                <option value={TEAM_MODES.INDIVIDUAL}>Individual</option>
              </select>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full btn-primary"
            >
              Crear Sala
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Juega al dominó estilo dominicano con amigos</p>
          <p className="mt-1">¡Dale que llegamo'! 🇩🇴</p>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgress && playerName && (
        <PlayerProgress 
          playerId={playerName}
          onClose={() => setShowProgress(false)}
        />
      )}

      {/* Tournaments Modal */}
      {showTournaments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bebas text-3xl">Torneos</h2>
              <button 
                onClick={() => setShowTournaments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TournamentList 
              playerId={playerName}
              playerName={playerName}
              onJoinTournament={(tournament) => {
                setShowTournaments(false)
                // Could navigate to tournament lobby or start game
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home