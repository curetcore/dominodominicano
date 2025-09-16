import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import Domino from '../components/Domino'

function GameRoom() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { emit, on, off, socket } = useSocket()
  
  const [gameState, setGameState] = useState(location.state?.gameState || null)
  const [hand, setHand] = useState([])
  const [selectedDomino, setSelectedDomino] = useState(null)
  const [selectedSide, setSelectedSide] = useState(null)
  const [messages, setMessages] = useState([])
  const [scores, setScores] = useState([0, 0])
  const [roundScores, setRoundScores] = useState(null)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const [showEndRound, setShowEndRound] = useState(false)
  const [specialScoreNotification, setSpecialScoreNotification] = useState(null)

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    // Socket event handlers
    const handleHandDealt = (data) => {
      setHand(data.hand)
    }

    const handleHandUpdate = (data) => {
      setHand(data.hand)
    }

    const handleDominoPlayed = (data) => {
      setGameState(prev => ({
        ...prev,
        table: data.table,
        currentPlayer: data.currentPlayer,
        leftEnd: data.leftEnd,
        rightEnd: data.rightEnd
      }))
      setSelectedDomino(null)
      setSelectedSide(null)
    }

    const handleTurnPassed = (data) => {
      setGameState(prev => ({
        ...prev,
        currentPlayer: data.currentPlayer
      }))
      setMessages(prev => [...prev, {
        type: 'pass',
        player: data.playerId,
        text: 'Pasó el turno'
      }])
    }

    const handleRoundEnded = (data) => {
      setRoundScores(data.scoreData)
      setScores(data.scores)
      setShowEndRound(true)
      
      if (!data.gameOver) {
        setTimeout(() => {
          setShowEndRound(false)
          setGameState(prev => ({
            ...prev,
            table: [],
            roundNumber: data.roundNumber + 1
          }))
        }, 5000)
      }
    }

    const handleGameOver = (data) => {
      alert(`¡Juego terminado! Ganador: Equipo ${data.winner + 1}`)
      navigate('/')
    }

    const handlePlayError = (data) => {
      alert(data.message)
    }
    
    const handleSpecialScore = (data) => {
      setSpecialScoreNotification(data)
      setTimeout(() => setSpecialScoreNotification(null), 3000)
    }
    
    const handlePenalty = (data) => {
      setMessages(prev => [...prev, {
        type: 'penalty',
        player: data.player,
        text: `Penalización: ${data.points} puntos por ${data.reason}`
      }])
    }

    on('hand-dealt', handleHandDealt)
    on('hand-update', handleHandUpdate)
    on('domino-played', handleDominoPlayed)
    on('turn-passed', handleTurnPassed)
    on('round-ended', handleRoundEnded)
    on('game-over', handleGameOver)
    on('play-error', handlePlayError)
    on('special-score', handleSpecialScore)
    on('penalty', handlePenalty)

    return () => {
      off('hand-dealt', handleHandDealt)
      off('hand-update', handleHandUpdate)
      off('domino-played', handleDominoPlayed)
      off('turn-passed', handleTurnPassed)
      off('round-ended', handleRoundEnded)
      off('game-over', handleGameOver)
      off('play-error', handlePlayError)
      off('special-score', handleSpecialScore)
      off('penalty', handlePenalty)
    }
  }, [on, off, navigate, location.state])

  useEffect(() => {
    if (gameState && socket) {
      setIsMyTurn(gameState.currentPlayer === socket.id)
      
      // Check if player can play
      if (gameState.currentPlayer === socket.id && hand.length > 0) {
        const hasValidMove = hand.some(domino => {
          if (gameState.table.length === 0) return true
          return [domino.top, domino.bottom].includes(gameState.leftEnd) ||
                 [domino.top, domino.bottom].includes(gameState.rightEnd)
        })
        setCanPlay(hasValidMove)
      }
    }
  }, [gameState, hand, socket])

  const handleDominoClick = (domino, index) => {
    if (!isMyTurn) return
    
    if (selectedDomino === index) {
      setSelectedDomino(null)
      setSelectedSide(null)
    } else {
      setSelectedDomino(index)
      
      // Auto-select side if only one is valid
      if (gameState.table.length > 0) {
        const canPlayLeft = [domino.top, domino.bottom].includes(gameState.leftEnd)
        const canPlayRight = [domino.top, domino.bottom].includes(gameState.rightEnd)
        
        if (canPlayLeft && !canPlayRight) {
          setSelectedSide('left')
        } else if (!canPlayLeft && canPlayRight) {
          setSelectedSide('right')
        } else {
          setSelectedSide(null)
        }
      }
    }
  }

  const playDomino = () => {
    if (selectedDomino === null) return
    
    const domino = hand[selectedDomino]
    emit('play-domino', {
      dominoIndex: selectedDomino,
      domino: domino,
      side: selectedSide
    })
  }

  const passTurn = () => {
    emit('pass-turn')
  }

  const sendQuickPhrase = (phraseIndex) => {
    emit('quick-phrase', { phraseIndex })
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando juego...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-t-3xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-bebas text-2xl">Sala: {roomId}</h2>
            <div className="text-sm">
              Ronda {gameState.roundNumber || 1}
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-600">Equipo 1</div>
              <div className="font-bold text-2xl text-dominican-blue">{scores[0]}</div>
              <div className="text-xs text-gray-500">de 150</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Equipo 2</div>
              <div className="font-bold text-2xl text-dominican-red">{scores[1]}</div>
              <div className="text-xs text-gray-500">de 150</div>
            </div>
          </div>
        </div>
        
        {/* Special Score Notification */}
        {specialScoreNotification && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-yellow-400 text-black px-8 py-4 rounded-full shadow-lg">
              <p className="font-bebas text-3xl">
                ¡{specialScoreNotification.type}!
              </p>
              <p className="text-center font-bold">+{specialScoreNotification.points} puntos</p>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-green-800 p-8 min-h-[400px] relative">
          {/* Table */}
          <div className="flex flex-wrap justify-center items-center gap-2 min-h-[200px] bg-green-900/50 rounded-xl p-4">
            {gameState.table.map((domino, idx) => (
              <Domino key={idx} domino={domino} horizontal={true} />
            ))}
            {gameState.table.length === 0 && (
              <div className="text-white/50 text-center">
                <p className="text-xl">Mesa vacía</p>
                <p className="text-sm">El jugador con doble 6 empieza</p>
              </div>
            )}
          </div>

          {/* Side indicators */}
          {gameState.table.length > 0 && selectedDomino !== null && (
            <div className="mt-4 flex justify-between px-8">
              <button
                onClick={() => setSelectedSide('left')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedSide === 'left' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                disabled={!hand[selectedDomino] || ![hand[selectedDomino].top, hand[selectedDomino].bottom].includes(gameState.leftEnd)}
              >
                Izquierda ({gameState.leftEnd})
              </button>
              <button
                onClick={() => setSelectedSide('right')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedSide === 'right' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                disabled={!hand[selectedDomino] || ![hand[selectedDomino].top, hand[selectedDomino].bottom].includes(gameState.rightEnd)}
              >
                Derecha ({gameState.rightEnd})
              </button>
            </div>
          )}
        </div>

        {/* Player Hand */}
        <div className="bg-white/95 backdrop-blur-lg rounded-b-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Tu mano</h3>
            <div className="flex gap-2">
              {isMyTurn && (
                <>
                  <button
                    onClick={playDomino}
                    disabled={selectedDomino === null || (gameState.table.length > 0 && !selectedSide)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                  >
                    Jugar
                  </button>
                  <button
                    onClick={passTurn}
                    disabled={canPlay}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                  >
                    Pasar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {hand.map((domino, idx) => (
              <Domino
                key={idx}
                domino={domino}
                onClick={() => handleDominoClick(domino, idx)}
                selectable={isMyTurn}
                selected={selectedDomino === idx}
              />
            ))}
          </div>

          {isMyTurn && (
            <div className="mt-4 text-center text-green-600 font-bold animate-pulse">
              ¡Es tu turno!
            </div>
          )}
        </div>

        {/* Quick phrases */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['¡Agua!', '¡Me pegué!', '¡Capicúa manito!', '¡Tranque!', 'Dale que llegamo\'', 'Ta\' buena esa'].map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => sendQuickPhrase(idx)}
              className="px-3 py-2 bg-white/80 hover:bg-white rounded-lg text-sm transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>
        
        {/* Rules Reminder */}
        <div className="mt-4 bg-white/80 rounded-lg p-4 text-xs">
          <p className="font-bold mb-1">Recordatorios:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>• Se juega a 150 puntos</div>
            <div>• Capicúa: +30 puntos</div>
            <div>• Pase corrido: +30 puntos</div>
            <div>• Prohibido pasar con ficha</div>
          </div>
        </div>
      </div>

      {/* Round End Modal */}
      {showEndRound && roundScores && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="font-bebas text-4xl text-center mb-6">
              ¡Fin de la Ronda!
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-bold">Puntos totales: {roundScores.total}</p>
                {roundScores.specialScore && (
                  <div className="mt-2 bg-yellow-100 p-3 rounded-lg">
                    <p className="font-bold text-yellow-800">
                      ¡{roundScores.specialScore.type}! +{roundScores.specialScore.points} puntos
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Puntuación actual:</h3>
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-dominican-blue font-bold text-2xl">{scores[0]}</p>
                    <p className="text-sm">Equipo 1</p>
                  </div>
                  <div className="text-center">
                    <p className="text-dominican-red font-bold text-2xl">{scores[1]}</p>
                    <p className="text-sm">Equipo 2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameRoom