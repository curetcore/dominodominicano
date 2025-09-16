import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext } from '@dnd-kit/core'
import JogatinaTable from '../components/JogatinaTable'
import JogatinaPlayerHand from '../components/JogatinaPlayerHand'
import { DominoGame, GAME_MODES, TEAM_MODES } from '../../shared/gameLogic'
import { BotPlayer } from '../utils/botPlayer'
import soundManager from '../utils/soundEffects'

function JogatinaGameRoom() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [game] = useState(() => new DominoGame(GAME_MODES.DOMINICAN, TEAM_MODES.PAIRS))
  const [gameState, setGameState] = useState(null)
  const [playerHand, setPlayerHand] = useState([])
  const [selectedDomino, setSelectedDomino] = useState(null)
  const [scores, setScores] = useState([0, 0])
  const [messages, setMessages] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [showEndRound, setShowEndRound] = useState(false)
  const [showScoreAnimation, setShowScoreAnimation] = useState(null)
  
  // Bot players
  const [bots] = useState(() => [
    { id: 'bot1', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '👤' },
    { id: 'bot2', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '👤' },
    { id: 'bot3', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '👤' }
  ])

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }
    startNewGame()
  }, [])

  const startNewGame = () => {
    soundManager.play('shuffle')
    const playerName = location.state.playerName
    const players = [playerName, bots[0].id, bots[1].id, bots[2].id]
    
    const gameData = game.startGame(players)
    setGameState(game.getGameState())
    setPlayerHand(gameData.hands[playerName])
    setScores(game.scores)
    
    setIsPlayerTurn(gameData.currentPlayer === playerName)
    
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
      setTimeout(() => {
        const result = game.playDomino(botId, move.index, move.side)
        
        if (result.success) {
          soundManager.play('placeDomino')
          updateGameAfterMove(result, bot)
          
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
        text: 'Paso',
        type: 'pass'
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
    soundManager.play('click')
    
    if (selectedDomino === index) {
      // Try to play on either end
      const leftResult = game.canPlayDomino(domino, 'left', game.leftEnd)
      const rightResult = game.canPlayDomino(domino, 'right', game.rightEnd)
      
      let side = null
      if (leftResult && rightResult) {
        // Can play on both sides - default to left
        side = 'left'
      } else if (leftResult) {
        side = 'left'
      } else if (rightResult) {
        side = 'right'
      }
      
      if (side) {
        handleDragEnd(index, side)
      }
    } else {
      setSelectedDomino(index)
    }
  }

  const handleDragEnd = (dominoIndex, side) => {
    if (!isPlayerTurn) return
    
    const result = game.playDomino(
      location.state.playerName, 
      dominoIndex, 
      side
    )
    
    if (result.success) {
      soundManager.play('placeDomino')
      setSelectedDomino(null)
      setIsPlayerTurn(false)
      
      updateGameAfterMove(result, { name: 'Tú' })
      
      if (result.gameOver) {
        handleGameEnd(result, location.state.playerName)
      } else {
        setTimeout(() => botPlay(result.currentPlayer), 1500)
      }
    } else {
      setShowScoreAnimation({ type: 'error', text: result.error })
      setTimeout(() => setShowScoreAnimation(null), 2000)
    }
  }

  const updateGameAfterMove = (result, player) => {
    setGameState(game.getGameState())
    setPlayerHand(game.hands[location.state.playerName])
    
    if (result.specialScore) {
      soundManager.play(result.specialScore.type.toLowerCase())
      setShowScoreAnimation({
        type: result.specialScore.type,
        points: result.specialScore.points,
        player: player.name
      })
      setTimeout(() => setShowScoreAnimation(null), 3000)
    }
  }

  const handleGameEnd = (result, winner) => {
    const won = winner === location.state.playerName || 
                (Array.isArray(winner) && winner.includes(location.state.playerName))
    
    if (won) {
      soundManager.play('win')
    }
    
    setShowEndRound(true)
    setScores(game.scores)
    
    if (!game.scores.some(s => s >= game.winningScore)) {
      setTimeout(() => {
        setShowEndRound(false)
        game.resetRound()
        startNewGame()
      }, 5000)
    }
  }

  const addMessage = (msg) => {
    setMessages(prev => [...prev.slice(-4), msg])
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col">
      {/* Header - Jogatina style */}
      <div className="bg-blue-700 p-2 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors"
            >
              Salir
            </button>
            <h2 className="text-white text-xl font-bold">Dominó Dominicano</h2>
          </div>
          
          {/* Score Display */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-yellow-300 text-sm">Tu Equipo</div>
              <div className="text-white text-2xl font-bold">{scores[0]}</div>
            </div>
            <div className="text-white text-xl">-</div>
            <div className="text-center">
              <div className="text-yellow-300 text-sm">Oponentes</div>
              <div className="text-white text-2xl font-bold">{scores[1]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Player avatars - top */}
      <div className="flex justify-center gap-12 py-4">
        {bots.slice(0, 3).map((bot, index) => (
          <PlayerAvatar 
            key={bot.id}
            name={bot.name}
            avatar={bot.avatar}
            isActive={gameState.currentPlayer === bot.id}
            handSize={game.hands[bot.id]?.length || 0}
            position={index === 1 ? 'partner' : 'opponent'}
          />
        ))}
      </div>

      {/* Game Table */}
      <div className="flex-1 px-4 py-2">
        <DndContext onDragEnd={(event) => {
          const { active, over } = event
          if (over && over.id.startsWith('table-')) {
            const dominoIndex = parseInt(active.id.split('-')[1])
            const side = over.data.current.side
            handleDragEnd(dominoIndex, side)
          }
        }}>
          <JogatinaTable 
            dominoes={gameState.table}
            leftEnd={gameState.leftEnd}
            rightEnd={gameState.rightEnd}
          />
        </DndContext>
      </div>

      {/* Player Hand */}
      <JogatinaPlayerHand 
        dominoes={playerHand}
        isMyTurn={isPlayerTurn}
        onDominoClick={handleDominoClick}
        selectedIndex={selectedDomino}
      />

      {/* Score Animation */}
      <AnimatePresence>
        {showScoreAnimation && (
          <ScoreAnimation 
            type={showScoreAnimation.type}
            points={showScoreAnimation.points}
            player={showScoreAnimation.player}
          />
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="fixed bottom-32 right-4 space-y-2">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
        </AnimatePresence>
      </div>

      {/* End Round Modal */}
      <AnimatePresence>
        {showEndRound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md"
            >
              <h3 className="text-3xl font-bold mb-4">¡Ronda Terminada!</h3>
              <div className="text-lg mb-4">
                <div className="mb-2">Tu Equipo: <span className="font-bold text-2xl">{scores[0]}</span></div>
                <div>Oponentes: <span className="font-bold text-2xl">{scores[1]}</span></div>
              </div>
              {game.scores.some(s => s >= game.winningScore) ? (
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg"
                >
                  Volver al Menú
                </button>
              ) : (
                <div className="text-gray-600">Nueva ronda en 5 segundos...</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper Components
function PlayerAvatar({ name, avatar, isActive, handSize, position }) {
  const positionStyles = {
    partner: 'bg-green-500',
    opponent: 'bg-red-500'
  }

  return (
    <motion.div 
      animate={{ scale: isActive ? 1.05 : 1 }}
      className="text-center"
    >
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center text-xl
        ${isActive ? 'ring-4 ring-yellow-400' : ''}
        ${positionStyles[position] || 'bg-gray-500'}
        shadow-lg
      `}>
        {avatar}
      </div>
      <div className="text-white text-sm font-medium mt-1">{name}</div>
      <div className="text-white/70 text-xs">{handSize} fichas</div>
      {isActive && (
        <div className="text-yellow-300 text-xs mt-1">Jugando...</div>
      )}
    </motion.div>
  )
}

function MessageBubble({ message }) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      className={`
        px-4 py-2 rounded-lg max-w-xs text-white shadow-lg
        ${message.type === 'pass' ? 'bg-red-500' : 'bg-gray-700'}
      `}
    >
      <span className="font-bold">{message.player}:</span> {message.text}
    </motion.div>
  )
}

function ScoreAnimation({ type, points, player }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className="bg-yellow-400 text-black px-8 py-6 rounded-2xl shadow-2xl">
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-4xl font-bold mb-2">¡{type}!</div>
          {points && (
            <div className="text-2xl font-bold">+{points} puntos</div>
          )}
          <div className="text-sm mt-2">{player}</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default JogatinaGameRoom