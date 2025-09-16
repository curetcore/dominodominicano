import React, { useState, useEffect } from 'react'
import { TournamentManager, TOURNAMENT_TYPES } from '../utils/tournaments'

function TournamentList({ playerId, playerName, onJoinTournament }) {
  const [tournaments, setTournaments] = useState([])
  const [playerStats, setPlayerStats] = useState(null)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState({})

  const tournamentManager = new TournamentManager()

  useEffect(() => {
    loadTournaments()
    const interval = setInterval(() => {
      loadTournaments()
      updateTimeRemaining()
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadTournaments = () => {
    const active = tournamentManager.getActiveTournaments()
    setTournaments(active)
    
    const stats = tournamentManager.getPlayerTournamentStats(playerId)
    setPlayerStats(stats)
  }

  const updateTimeRemaining = () => {
    const times = {}
    tournaments.forEach(tournament => {
      const remaining = tournament.timeRemaining
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
      times[tournament.id] = `${hours}h ${minutes}m ${seconds}s`
    })
    setTimeRemaining(times)
  }

  const handleJoinTournament = (tournamentId) => {
    const result = tournamentManager.joinTournament(tournamentId, playerId, playerName)
    if (result.success) {
      loadTournaments()
      if (onJoinTournament) {
        onJoinTournament(result.tournament)
      }
    } else {
      alert(result.error)
    }
  }

  const createNewTournament = (type) => {
    tournamentManager.createTournament(type)
    loadTournaments()
  }

  const getTournamentIcon = (type) => {
    switch (type) {
      case 'daily': return '☀️'
      case 'weekend': return '🌟'
      case 'blitz': return '⚡'
      default: return '🏆'
    }
  }

  const isPlayerInTournament = (tournament) => {
    return tournament.players.some(p => p.id === playerId)
  }

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-3xl text-dominican-blue">Torneos Activos</h2>
        <div className="flex items-center gap-4">
          {playerStats && (
            <div className="flex items-center gap-2 text-sm">
              <span>🏆 {playerStats.totalWins}</span>
              <span>💰 {playerStats.totalPrizes.coins.toLocaleString()}</span>
              {playerStats.trophies.gold > 0 && <span>🥇 {playerStats.trophies.gold}</span>}
            </div>
          )}
        </div>
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No hay torneos activos</p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => createNewTournament('daily')}
              className="btn-primary text-sm"
            >
              Crear Torneo Diario
            </button>
            <button 
              onClick={() => createNewTournament('blitz')}
              className="btn-secondary text-sm"
            >
              Crear Torneo Relámpago
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tournaments.map(tournament => {
          const isJoined = isPlayerInTournament(tournament)
          const playerData = tournament.players.find(p => p.id === playerId)
          const position = tournament.leaderboard.findIndex(p => p.id === playerId) + 1
          
          return (
            <div 
              key={tournament.id} 
              className="border-2 border-gray-200 rounded-xl p-4 hover:border-dominican-blue transition-colors cursor-pointer"
              onClick={() => setSelectedTournament(tournament)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTournamentIcon(tournament.type)}</span>
                    <h3 className="font-bold text-lg">{tournament.name}</h3>
                    {isJoined && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Inscrito
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Jugadores</p>
                      <p className="font-bold">
                        {tournament.players.length}/{tournament.config.maxPlayers}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tiempo restante</p>
                      <p className="font-bold text-dominican-red">
                        {timeRemaining[tournament.id] || 'Calculando...'}
                      </p>
                    </div>
                    {isJoined && playerData && (
                      <>
                        <div>
                          <p className="text-gray-600">Tu posición</p>
                          <p className="font-bold text-dominican-blue">
                            #{position} ({playerData.points} pts)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Partidas</p>
                          <p className="font-bold">
                            {playerData.gamesPlayed} ({playerData.wins}W)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Entrada:</span>
                      <span className="font-bold">
                        {tournament.config.entryFee.coins && `🪙 ${tournament.config.entryFee.coins}`}
                        {tournament.config.entryFee.diamonds && ` 💎 ${tournament.config.entryFee.diamonds}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">1er Premio:</span>
                      <span className="font-bold text-green-600">
                        🪙 {tournament.config.prizes[0].coins.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!isJoined && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJoinTournament(tournament.id)
                    }}
                    className="btn-primary text-sm ml-4"
                  >
                    Unirse
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tournament Detail Modal */}
      {selectedTournament && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTournament(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bebas text-3xl">{selectedTournament.name}</h2>
              <button 
                onClick={() => setSelectedTournament(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3">Tabla de Posiciones</h3>
              <div className="space-y-2">
                {selectedTournament.leaderboard.slice(0, 10).map((player, idx) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.id === playerId ? 'bg-blue-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bebas text-xl w-8">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div>
                        <p className="font-bold">{player.name}</p>
                        <p className="text-sm text-gray-600">
                          {player.gamesPlayed} juegos · {player.wins} victorias
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bebas text-2xl">{player.points}</p>
                      <p className="text-xs text-gray-600">puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2">Premios</h3>
                <div className="space-y-1 text-sm">
                  {selectedTournament.config.prizes.map((prize, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>
                        {typeof prize.position === 'number' 
                          ? `#${prize.position}` 
                          : `#${prize.position[0]}-${prize.position[1]}`}
                      </span>
                      <span className="font-bold">
                        {prize.coins && `🪙 ${prize.coins}`}
                        {prize.diamonds && ` 💎 ${prize.diamonds}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Reglas</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Victoria: 3 puntos</li>
                  <li>• Empate: 1 punto</li>
                  <li>• Dominó cerrado: +2 puntos</li>
                  <li>• Capicúa: +1 punto</li>
                  {selectedTournament.config.gameTime && (
                    <li>• Tiempo por partida: {selectedTournament.config.gameTime / 60} min</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentList