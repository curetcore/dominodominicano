import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext } from '@dnd-kit/core'
import ModernGameTable from '../components/ModernGameTable'
import ModernPlayerHand from '../components/ModernPlayerHand'
import SoundControls from '../components/SoundControls'
import { DominoGame, GAME_MODES, TEAM_MODES } from '../../shared/gameLogic'
import { BotPlayer } from '../utils/botPlayer'
import { PlayerProgress } from '../utils/gameProgress'
import soundManager from '../utils/soundEffects'

function ModernBotGameRoom() {
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
    { id: 'bot1', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '🤖' },
    { id: 'bot2', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '🎮' },
    { id: 'bot3', name: BotPlayer.getBotName(), ai: new BotPlayer('medium'), avatar: '🎯' }
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
    } else {
      soundManager.play('yourTurn')
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
            soundManager.play('yourTurn')
          } else {
            setTimeout(() => botPlay(result.currentPlayer), 1500)
          }
        }
      }, bot.ai.playDelay)
    } else {
      // Bot must pass
      addMessage({
        player: bot,
        text: bot.ai.getReaction('pass'),
        type: 'pass'
      })
      
      const result = game.pass(botId)
      
      if (result.success) {
        if (result.gameOver) {
          handleGameEnd(result, botId)
        } else if (result.currentPlayer === location.state.playerName) {
          setIsPlayerTurn(true)
          soundManager.play('yourTurn')
        } else {
          setTimeout(() => botPlay(result.currentPlayer), 1500)
        }
      }
    }
  }

  const handleDominoClick = (domino, index) => {
    if (!isPlayerTurn) return
    soundManager.play('click')
    setSelectedDomino(selectedDomino === index ? null : index)
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
      // Show error with animation
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto h-full min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 mb-4"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="font-bebas text-3xl text-white">Modo Práctica</h2>
            </div>
            
            {/* Score Display */}
            <div className="flex items-center gap-8">
              <ScoreDisplay team="Tu Equipo" score={scores[0]} color="blue" />
              <div className="text-white/50 text-2xl">VS</div>
              <ScoreDisplay team="Bots" score={scores[1]} color="red" />
            </div>
          </div>
        </motion.div>

        {/* Bot Avatars */}
        <div className="flex justify-center gap-8 mb-4">
          {bots.slice(0, 3).map((bot, index) => (
            <BotAvatar 
              key={bot.id}
              bot={bot}
              isActive={gameState.currentPlayer === bot.id}
              handSize={game.hands[bot.id]?.length || 0}
            />
          ))}
        </div>

        {/* Game Table */}
        <div className="flex-1 mb-4">
          <DndContext onDragEnd={(event) => {
            const { active, over } = event
            if (over && over.id.startsWith('table-')) {
              const dominoIndex = parseInt(active.id.split('-')[1])
              const side = over.data.current.side
              handleDragEnd(dominoIndex, side)
            }
          }}>
            <ModernGameTable 
              dominoes={gameState.table}
              leftEnd={gameState.leftEnd}
              rightEnd={gameState.rightEnd}
            />
          </DndContext>
        </div>

        {/* Player Hand */}
        <ModernPlayerHand 
          dominoes={playerHand}
          isMyTurn={isPlayerTurn}
          onDominoClick={handleDominoClick}
          selectedIndex={selectedDomino}
          onDragEnd={handleDragEnd}
        />

        {/* Sound Controls */}
        <SoundControls />

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
        <div className="fixed bottom-24 left-4 space-y-2">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function ScoreDisplay({ team, score, color }) {
  return (
    <div className="text-center">
      <div className="text-white/70 text-sm">{team}</div>
      <motion.div 
        className={`font-bebas text-4xl text-${color}-400`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
        key={score}
      >
        {score}
      </motion.div>
      <div className="text-white/50 text-xs">de 150</div>
    </div>
  )
}

function BotAvatar({ bot, isActive, handSize }) {
  return (
    <motion.div 
      animate={{ 
        scale: isActive ? 1.1 : 1,
        y: isActive ? -5 : 0 
      }}
      className="text-center"
    >
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center text-2xl
        ${isActive ? 'bg-yellow-400 shadow-lg' : 'bg-white/20'}
        transition-all duration-300
      `}>
        {bot.avatar}
      </div>
      <div className="text-white/80 text-sm mt-1">{bot.name}</div>
      <div className="text-white/50 text-xs">{handSize} fichas</div>
      {isActive && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mt-1"
        />
      )}
    </motion.div>
  )
}

function MessageBubble({ message }) {
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      className={`
        px-4 py-2 rounded-2xl max-w-xs
        ${message.type === 'pass' ? 'bg-red-500' : 'bg-white/20'}
        backdrop-blur-sm text-white
      `}
    >
      <span className="font-medium">{message.player.name}:</span> {message.text}
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
      <div className="bg-yellow-400 text-black px-8 py-6 rounded-3xl shadow-2xl">
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="font-bebas text-5xl mb-2">¡{type}!</div>
          {points && (
            <div className="text-2xl font-bold">+{points} puntos</div>
          )}
          <div className="text-sm mt-2">{player}</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ModernBotGameRoom