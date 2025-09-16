import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Domino from '../components/Domino'
import { DominoGame, GAME_MODES, TEAM_MODES } from '../../shared/gameLogic'
import { BotPlayer } from '../utils/botPlayer'
import { PlayerProgress } from '../utils/gameProgress'

function BotGameRoom() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [game] = useState(() => new DominoGame(GAME_MODES.DOMINICAN, TEAM_MODES.PAIRS))
  const [gameState, setGameState] = useState(null)
  const [playerHand, setPlayerHand] = useState([])
  const [selectedDomino, setSelectedDomino] = useState(null)
  const [selectedSide, setSelectedSide] = useState(null)
  const [scores, setScores] = useState([0, 0])
  const [messages, setMessages] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [showEndRound, setShowEndRound] = useState(false)
  const [roundResult, setRoundResult] = useState(null)
  
  // Bot players
  const [bots] = useState(() => [
    { id: 'bot1', name: BotPlayer.getBotName(), ai: new BotPlayer('medium') },
    { id: 'bot2', name: BotPlayer.getBotName(), ai: new BotPlayer('medium') },
    { id: 'bot3', name: BotPlayer.getBotName(), ai: new BotPlayer('medium') }
  ])

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    // Start new game
    startNewGame()
  }, [])

  const startNewGame = () => {
    const playerName = location.state.playerName
    const players = [playerName, bots[0].id, bots[1].id, bots[2].id]
    
    const gameData = game.startGame(players)
    setGameState(game.getGameState())
    setPlayerHand(gameData.hands[playerName])
    setScores(game.scores)
    
    // Check if player starts
    setIsPlayerTurn(gameData.currentPlayer === playerName)
    
    // Show bot names
    setMessages([{
      type: 'system',
      text: `Jugando contra: ${bots[0].name}, ${bots[1].name} y ${bots[2].name}`
    }])

    // If bot starts, make them play
    if (gameData.currentPlayer !== playerName) {
      setTimeout(() => botPlay(gameData.currentPlayer), 1500)
    }
  }

  const botPlay = (botId) => {
    const bot = bots.find(b => b.id === botId)
    if (!bot) return

    const botHand = game.hands[botId]
    const move = bot.ai.evaluateMove(
      botHand, 
      game.table, 
      game.leftEnd, 
      game.rightEnd
    )

    if (move) {
      // Bot thinking message
      addMessage({
        player: bot.name,
        text: bot.ai.getReaction('thinking')
      })

      setTimeout(() => {
        const result = game.playDomino(botId, move.index, move.side)
        
        if (result.success) {
          updateGameAfterMove(result, bot.name)
          
          if (result.gameOver) {
            handleGameEnd(result, botId)
          } else if (result.currentPlayer === location.state.playerName) {
            setIsPlayerTurn(true)
          } else {
            setTimeout(() => botPlay(result.currentPlayer), 1500)
          }
        }
      }, bot.ai.playDelay)
    } else {
      // Bot must pass
      addMessage({
        player: bot.name,
        text: bot.ai.getReaction('pass')
      })
      
      const result = game.pass(botId)
      
      if (result.success) {
        if (result.gameOver) {
          handleGameEnd(result, botId)
        } else if (result.currentPlayer === location.state.playerName) {
          setIsPlayerTurn(true)
        } else {
          setTimeout(() => botPlay(result.currentPlayer), 1500)
        }
      }
    }
  }

  const handleDominoClick = (domino, index) => {
    if (!isPlayerTurn) return
    
    if (selectedDomino === index) {
      setSelectedDomino(null)
      setSelectedSide(null)
    } else {
      setSelectedDomino(index)
      
      // Auto-select side if only one is valid
      if (game.table.length > 0) {
        const canPlayLeft = [domino.top, domino.bottom].includes(game.leftEnd)
        const canPlayRight = [domino.top, domino.bottom].includes(game.rightEnd)
        
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
    if (selectedDomino === null || !isPlayerTurn) return
    
    const result = game.playDomino(
      location.state.playerName, 
      selectedDomino, 
      selectedSide
    )
    
    if (result.success) {
      setSelectedDomino(null)
      setSelectedSide(null)
      setIsPlayerTurn(false)
      
      updateGameAfterMove(result, 'Tú')
      
      if (result.gameOver) {
        handleGameEnd(result, location.state.playerName)
      } else {
        setTimeout(() => botPlay(result.currentPlayer), 1500)
      }
    } else {
      alert(result.error)
    }
  }

  const passTurn = () => {
    if (!isPlayerTurn) return
    
    const result = game.pass(location.state.playerName)
    
    if (result.success) {
      addMessage({
        player: 'Tú',
        text: '¡Agua!'
      })
      
      setIsPlayerTurn(false)
      
      if (result.gameOver) {
        handleGameEnd(result)
      } else {
        setTimeout(() => botPlay(result.currentPlayer), 1500)
      }
    } else {
      alert(result.error)
    }
  }

  const updateGameAfterMove = (result, playerName) => {
    setGameState(game.getGameState())
    setPlayerHand(game.hands[location.state.playerName])
    
    if (result.specialScore) {
      addMessage({
        type: 'special',
        player: playerName,
        text: `¡${result.specialScore.type}! +${result.specialScore.points} puntos`
      })
    }
  }

  const handleGameEnd = (result, winner) => {
    const playerProgress = new PlayerProgress(location.state.playerName)
    const won = winner === location.state.playerName || 
                (Array.isArray(winner) && winner.includes(location.state.playerName))
    
    playerProgress.recordGameResult(won, {
      capicua: result.specialScore?.type === 'CAPICUA',
      dominoCerrado: !result.blocked
    })
    
    setRoundResult({
      won,
      points: result.scores,
      specialScore: result.specialScore
    })
    setShowEndRound(true)
    setScores(game.scores)
    
    // Start new round after delay
    if (!game.scores.some(s => s >= game.winningScore)) {
      setTimeout(() => {
        setShowEndRound(false)
        game.resetRound()
        startNewGame()
      }, 5000)
    }
  }

  const addMessage = (msg) => {
    setMessages(prev => [...prev.slice(-9), msg])
  }

  const canPlay = () => {
    return game.getValidMoves(location.state.playerName).length > 0
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-t-3xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Salir
              </button>
              <h2 className="font-bebas text-2xl">Modo Práctica</h2>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-gray-600">Tu equipo</div>
                <div className="font-bold text-2xl text-dominican-blue">{scores[0]}</div>
                <div className="text-xs text-gray-500">de 150</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Bots</div>
                <div className="font-bold text-2xl text-dominican-red">{scores[1]}</div>
                <div className="text-xs text-gray-500">de 150</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bot Messages */}
        <div className="bg-white/80 p-2 max-h-20 overflow-y-auto">
          {messages.slice(-3).map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.type === 'special' ? 'text-yellow-600 font-bold' : ''}`}>
              {msg.player && <span className="font-medium">{msg.player}:</span>} {msg.text}
            </div>
          ))}
        </div>

        {/* Game Board */}
        <div className="bg-green-800 p-8 min-h-[400px]">
          {/* Bot Hands (hidden) */}
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(game.hands[bots[1].id]?.length || 0)].map((_, i) => (
              <div key={i} className="w-10 h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>

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
                disabled={!playerHand[selectedDomino] || ![playerHand[selectedDomino].top, playerHand[selectedDomino].bottom].includes(gameState.leftEnd)}
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
                disabled={!playerHand[selectedDomino] || ![playerHand[selectedDomino].top, playerHand[selectedDomino].bottom].includes(gameState.rightEnd)}
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
              {isPlayerTurn && (
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
                    disabled={canPlay()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                  >
                    Pasar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {playerHand.map((domino, idx) => (
              <Domino
                key={idx}
                domino={domino}
                onClick={() => handleDominoClick(domino, idx)}
                selectable={isPlayerTurn}
                selected={selectedDomino === idx}
              />
            ))}
          </div>

          {isPlayerTurn && (
            <div className="mt-4 text-center text-green-600 font-bold animate-pulse">
              ¡Es tu turno!
            </div>
          )}
        </div>
      </div>

      {/* Round End Modal */}
      {showEndRound && roundResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="font-bebas text-4xl text-center mb-6">
              {roundResult.won ? '¡Ganaste la Ronda! 🎉' : 'Perdiste la Ronda 😔'}
            </h2>
            
            {roundResult.specialScore && (
              <div className="bg-yellow-100 p-3 rounded-lg mb-4 text-center">
                <p className="font-bold text-yellow-800">
                  ¡{roundResult.specialScore.type}! +{roundResult.specialScore.points} puntos
                </p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-gray-600">Nueva ronda en 5 segundos...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BotGameRoom