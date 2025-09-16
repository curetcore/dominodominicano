import React, { useState, useEffect } from 'react'
import { PlayerProgress as Progress, LEVELS } from '../utils/gameProgress'

function PlayerProgress({ playerId, onClose }) {
  const [progress, setProgress] = useState(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpRewards, setLevelUpRewards] = useState(null)

  useEffect(() => {
    const playerProgress = new Progress(playerId)
    setProgress(playerProgress.getStats())
    
    // Check daily login
    const dailyReward = playerProgress.checkDailyLogin()
    if (dailyReward) {
      // Show daily login reward notification
      console.log('Daily login reward:', dailyReward)
    }
  }, [playerId])

  if (!progress) return null

  const currentLevel = LEVELS[progress.level - 1]
  const nextLevel = LEVELS[progress.level]
  const xpProgress = nextLevel 
    ? ((progress.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100)
    : 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bebas text-3xl text-dominican-blue">Mi Progreso</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Level Progress */}
        <div className="mb-6 bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-dominican-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bebas text-2xl">{progress.level}</span>
              </div>
              <div>
                <p className="font-bold">Nivel {progress.level}</p>
                <p className="text-sm text-gray-600">{progress.xp} XP Total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Próximo nivel</p>
              <p className="font-bold">{nextLevel ? `${nextLevel.xpRequired} XP` : 'MAX'}</p>
            </div>
          </div>
          
          {nextLevel && (
            <div className="mt-3">
              <div className="bg-gray-300 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-dominican-blue to-dominican-red h-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {Math.floor(xpProgress)}% al siguiente nivel
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bebas text-dominican-blue">{progress.wins}</p>
            <p className="text-sm text-gray-600">Victorias</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bebas text-dominican-red">{progress.totalGames}</p>
            <p className="text-sm text-gray-600">Partidas</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bebas text-green-600">{progress.winRate}%</p>
            <p className="text-sm text-gray-600">% Victorias</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bebas text-yellow-600">{progress.bestStreak}</p>
            <p className="text-sm text-gray-600">Mejor Racha</p>
          </div>
        </div>

        {/* Resources */}
        <div className="flex justify-around mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl">🪙</span>
              <p className="font-bold text-xl">{progress.coins.toLocaleString()}</p>
            </div>
            <p className="text-xs text-gray-600">Fichas</p>
          </div>
          <div className="w-px bg-gray-300" />
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl">💎</span>
              <p className="font-bold text-xl">{progress.diamonds}</p>
            </div>
            <p className="text-xs text-gray-600">Diamantes</p>
          </div>
        </div>

        {/* Daily Login Streak */}
        {progress.consecutiveDays > 0 && (
          <div className="mb-6 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-yellow-800">Racha de Login</p>
                <p className="text-sm text-yellow-600">
                  {progress.consecutiveDays} {progress.consecutiveDays === 1 ? 'día' : 'días'} consecutivos
                </p>
              </div>
              <span className="text-3xl">🔥</span>
            </div>
            {progress.consecutiveDays < 7 && (
              <p className="text-xs text-yellow-600 mt-2">
                ¡Llega a 7 días para bonus máximo!
              </p>
            )}
          </div>
        )}

        {/* Achievements Preview */}
        <div className="mb-4">
          <h3 className="font-bold mb-2">Logros ({progress.achievements.length})</h3>
          <div className="flex flex-wrap gap-2">
            {progress.achievements.slice(0, 6).map(achievementId => (
              <div key={achievementId} className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
            ))}
            {progress.achievements.length > 6 && (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">+{progress.achievements.length - 6}</span>
              </div>
            )}
          </div>
        </div>

        {/* Unlocks Preview */}
        {progress.unlocks.length > 0 && (
          <div>
            <h3 className="font-bold mb-2">Desbloqueados</h3>
            <div className="space-y-2">
              {progress.unlocks.slice(-3).map((unlock, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                  <span className="text-xl">
                    {unlock.type === 'theme' ? '🎨' : 
                     unlock.type === 'domino' ? '🁫' : 
                     unlock.type === 'effect' ? '✨' : '🖼️'}
                  </span>
                  <p className="text-sm">{unlock.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {showLevelUp && levelUpRewards && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-bounce-slow">
            <h2 className="font-bebas text-4xl text-center text-dominican-blue mb-4">
              ¡NIVEL {levelUpRewards.newLevel}!
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🪙</span>
                <p className="text-xl font-bold">+{levelUpRewards.rewards.coins} Fichas</p>
              </div>
              
              {levelUpRewards.rewards.diamonds > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">💎</span>
                  <p className="text-xl font-bold">+{levelUpRewards.rewards.diamonds} Diamantes</p>
                </div>
              )}
              
              {levelUpRewards.rewards.unlock && (
                <div className="bg-yellow-100 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-yellow-800">¡Nuevo Desbloqueo!</p>
                  <p className="text-lg">{levelUpRewards.rewards.unlock.name}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full btn-primary"
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerProgress