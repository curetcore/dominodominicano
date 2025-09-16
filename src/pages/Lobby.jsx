import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'

function Lobby() {
  const location = useLocation()
  const navigate = useNavigate()
  const { emit, on, off } = useSocket()
  
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [isReady, setIsReady] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [chat, setChat] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    const { action, playerName, roomCode, roomSettings } = location.state

    if (action === 'create') {
      emit('create-room', {
        playerName,
        ...roomSettings
      })
    } else if (action === 'join') {
      emit('join-room', {
        roomId: roomCode,
        playerName
      })
    }

    // Socket event handlers
    const handleRoomCreated = (data) => {
      setRoom(data.room)
      setPlayers(data.room.players)
      navigate(`/lobby?room=${data.roomId}`, { replace: true })
    }

    const handleRoomJoined = (data) => {
      setRoom(data.room)
      setPlayers(data.room.players)
      navigate(`/lobby?room=${data.roomId}`, { replace: true })
    }

    const handlePlayerJoined = (data) => {
      setPlayers(data.players)
    }

    const handlePlayerReadyUpdate = (data) => {
      setPlayers(data.players)
    }

    const handleGameStarted = (data) => {
      navigate(`/game/${room.id}`, { 
        state: { 
          gameState: data.gameState,
          room: room 
        } 
      })
    }

    const handleChatMessage = (data) => {
      setChat(prev => [...prev, data])
    }

    const handleError = (data) => {
      alert(data.message)
      navigate('/')
    }

    on('room-created', handleRoomCreated)
    on('room-joined', handleRoomJoined)
    on('player-joined', handlePlayerJoined)
    on('player-ready-update', handlePlayerReadyUpdate)
    on('game-started', handleGameStarted)
    on('chat-message', handleChatMessage)
    on('error', handleError)

    return () => {
      off('room-created', handleRoomCreated)
      off('room-joined', handleRoomJoined)
      off('player-joined', handlePlayerJoined)
      off('player-ready-update', handlePlayerReadyUpdate)
      off('game-started', handleGameStarted)
      off('chat-message', handleChatMessage)
      off('error', handleError)
    }
  }, [emit, on, off, location.state, navigate])

  const handleReady = () => {
    if (room?.settings?.teamMode === 'pairs' && !selectedTeam) {
      alert('Selecciona un equipo primero')
      return
    }

    setIsReady(!isReady)
    emit('player-ready', {
      ready: !isReady,
      team: selectedTeam
    })
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (message.trim()) {
      emit('chat-message', { message })
      setMessage('')
    }
  }

  const sendQuickPhrase = (phraseIndex) => {
    emit('quick-phrase', { phraseIndex })
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Conectando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-bebas text-4xl text-dominican-blue">
                {room.name || `Sala ${room.id}`}
              </h1>
              <p className="text-gray-600">Código: <span className="font-mono font-bold text-xl">{room.id}</span></p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-red-600 hover:text-red-700"
            >
              Salir
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Jugadores ({players.length}/4)</h2>
              
              <div className="space-y-4">
                {room.settings?.teamMode === 'pairs' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <h3 className="font-bold text-dominican-blue">Equipo 1</h3>
                      <div className="space-y-2 mt-2">
                        {[0, 2].map(idx => {
                          const player = players[idx]
                          return (
                            <div key={idx} className={`p-3 rounded-lg border-2 ${
                              player?.team === 0 ? 'border-dominican-blue bg-blue-50' : 'border-gray-300'
                            }`}>
                              {player ? (
                                <div>
                                  <p className="font-medium">{player.name}</p>
                                  {player.ready && <span className="text-green-600 text-sm">✓ Listo</span>}
                                </div>
                              ) : (
                                <p className="text-gray-400">Esperando...</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-bold text-dominican-red">Equipo 2</h3>
                      <div className="space-y-2 mt-2">
                        {[1, 3].map(idx => {
                          const player = players[idx]
                          return (
                            <div key={idx} className={`p-3 rounded-lg border-2 ${
                              player?.team === 1 ? 'border-dominican-red bg-red-50' : 'border-gray-300'
                            }`}>
                              {player ? (
                                <div>
                                  <p className="font-medium">{player.name}</p>
                                  {player.ready && <span className="text-green-600 text-sm">✓ Listo</span>}
                                </div>
                              ) : (
                                <p className="text-gray-400">Esperando...</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {room.settings?.teamMode === 'pairs' && !isReady && (
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setSelectedTeam(0)}
                      className={`px-6 py-2 rounded-lg ${
                        selectedTeam === 0 
                          ? 'bg-dominican-blue text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Unirse a Equipo 1
                    </button>
                    <button
                      onClick={() => setSelectedTeam(1)}
                      className={`px-6 py-2 rounded-lg ${
                        selectedTeam === 1 
                          ? 'bg-dominican-red text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Unirse a Equipo 2
                    </button>
                  </div>
                )}

                <button
                  onClick={handleReady}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    isReady 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isReady ? 'Cancelar' : 'Estoy Listo'}
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">Configuración</h3>
                <p className="text-sm">Modo: {room.settings?.mode === 'dominican' ? 'Dominicano' : 'Clásico'}</p>
                <p className="text-sm">Tipo: {room.settings?.teamMode === 'pairs' ? 'Parejas' : 'Individual'}</p>
                <p className="text-sm">Puntos para ganar: {room.settings?.winningScore || 200}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <h3 className="font-bold mb-4">Chat</h3>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-96">
                {chat.map((msg, idx) => (
                  <div key={idx} className={`text-sm ${msg.isPhrase ? 'italic text-blue-600' : ''}`}>
                    <span className="font-medium">{msg.playerName}:</span> {msg.message}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-1 mb-2">
                {['Dale que llegamo\'', 'Ta\' buena esa', 'Se te trancó', 'Dominó!'].map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickPhrase(idx)}
                    className="text-xs bg-white hover:bg-gray-200 rounded p-1"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Escribe un mensaje..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby