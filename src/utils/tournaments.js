// Sistema de torneos y eventos

export const TOURNAMENT_TYPES = {
  DAILY: {
    id: 'daily',
    name: 'Torneo Diario',
    duration: 24 * 60 * 60 * 1000, // 24 horas
    entryFee: { coins: 500 },
    prizes: [
      { position: 1, coins: 5000, diamonds: 20, trophy: 'gold' },
      { position: 2, coins: 3000, diamonds: 10, trophy: 'silver' },
      { position: 3, coins: 1500, diamonds: 5, trophy: 'bronze' },
      { position: [4, 10], coins: 800 },
      { position: [11, 20], coins: 500 }
    ],
    maxPlayers: 100
  },
  WEEKEND: {
    id: 'weekend',
    name: 'Torneo Fin de Semana',
    duration: 48 * 60 * 60 * 1000, // 48 horas
    entryFee: { coins: 1000, diamonds: 5 },
    prizes: [
      { position: 1, coins: 15000, diamonds: 50, trophy: 'platinum' },
      { position: 2, coins: 10000, diamonds: 30, trophy: 'gold' },
      { position: 3, coins: 5000, diamonds: 20, trophy: 'silver' },
      { position: [4, 10], coins: 2000, diamonds: 5 },
      { position: [11, 25], coins: 1000 }
    ],
    maxPlayers: 200
  },
  BLITZ: {
    id: 'blitz',
    name: 'Torneo Relámpago',
    duration: 2 * 60 * 60 * 1000, // 2 horas
    entryFee: { coins: 200 },
    prizes: [
      { position: 1, coins: 1500, trophy: 'lightning' },
      { position: 2, coins: 800 },
      { position: 3, coins: 400 }
    ],
    maxPlayers: 50,
    gameTime: 300 // 5 minutos por partida
  }
};

export class TournamentManager {
  constructor() {
    this.activeTournaments = new Map();
    this.loadActiveTournaments();
  }

  loadActiveTournaments() {
    const saved = localStorage.getItem('active_tournaments');
    if (saved) {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([id, tournament]) => {
        if (new Date(tournament.endTime) > new Date()) {
          this.activeTournaments.set(id, tournament);
        }
      });
    }
  }

  saveTournaments() {
    const data = {};
    this.activeTournaments.forEach((tournament, id) => {
      data[id] = tournament;
    });
    localStorage.setItem('active_tournaments', JSON.stringify(data));
  }

  createTournament(type) {
    const config = TOURNAMENT_TYPES[type];
    const now = new Date();
    const tournament = {
      id: `${type}_${now.getTime()}`,
      type: type,
      name: config.name,
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + config.duration).toISOString(),
      players: [],
      leaderboard: [],
      config: config,
      status: 'active'
    };

    this.activeTournaments.set(tournament.id, tournament);
    this.saveTournaments();
    
    // Schedule tournament end
    setTimeout(() => this.endTournament(tournament.id), config.duration);
    
    return tournament;
  }

  joinTournament(tournamentId, playerId, playerName) {
    const tournament = this.activeTournaments.get(tournamentId);
    
    if (!tournament) {
      return { success: false, error: 'Torneo no encontrado' };
    }
    
    if (tournament.status !== 'active') {
      return { success: false, error: 'El torneo ha terminado' };
    }
    
    if (tournament.players.find(p => p.id === playerId)) {
      return { success: false, error: 'Ya estás inscrito' };
    }
    
    if (tournament.players.length >= tournament.config.maxPlayers) {
      return { success: false, error: 'Torneo lleno' };
    }
    
    // Add player
    tournament.players.push({
      id: playerId,
      name: playerName,
      points: 0,
      wins: 0,
      gamesPlayed: 0,
      joinedAt: new Date().toISOString()
    });
    
    this.updateLeaderboard(tournamentId);
    this.saveTournaments();
    
    return { success: true, tournament };
  }

  recordTournamentGame(tournamentId, gameResult) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'active') return;
    
    // Update player stats
    gameResult.players.forEach(playerResult => {
      const player = tournament.players.find(p => p.id === playerResult.id);
      if (player) {
        player.gamesPlayed += 1;
        if (playerResult.won) {
          player.wins += 1;
          player.points += 3; // 3 puntos por victoria
        } else if (playerResult.draw) {
          player.points += 1; // 1 punto por empate
        }
        
        // Bonus points
        if (playerResult.dominoCerrado) player.points += 2;
        if (playerResult.capicua) player.points += 1;
      }
    });
    
    this.updateLeaderboard(tournamentId);
    this.saveTournaments();
  }

  updateLeaderboard(tournamentId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament) return;
    
    // Sort by points, then by wins, then by games played
    tournament.leaderboard = [...tournament.players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.gamesPlayed - b.gamesPlayed; // Menos juegos es mejor si todo lo demás es igual
    });
  }

  endTournament(tournamentId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament) return;
    
    tournament.status = 'finished';
    this.updateLeaderboard(tournamentId);
    
    // Distribute prizes
    const prizes = [];
    tournament.config.prizes.forEach(prize => {
      if (typeof prize.position === 'number') {
        const winner = tournament.leaderboard[prize.position - 1];
        if (winner) {
          prizes.push({
            playerId: winner.id,
            playerName: winner.name,
            position: prize.position,
            rewards: {
              coins: prize.coins || 0,
              diamonds: prize.diamonds || 0,
              trophy: prize.trophy
            }
          });
        }
      } else if (Array.isArray(prize.position)) {
        const [start, end] = prize.position;
        for (let i = start - 1; i < end && i < tournament.leaderboard.length; i++) {
          const winner = tournament.leaderboard[i];
          prizes.push({
            playerId: winner.id,
            playerName: winner.name,
            position: i + 1,
            rewards: {
              coins: prize.coins || 0,
              diamonds: prize.diamonds || 0
            }
          });
        }
      }
    });
    
    tournament.prizes = prizes;
    this.saveTournaments();
    
    // Remove from active after 1 hour
    setTimeout(() => {
      this.activeTournaments.delete(tournamentId);
      this.saveTournaments();
    }, 60 * 60 * 1000);
    
    return prizes;
  }

  getTournamentInfo(tournamentId) {
    const tournament = this.activeTournaments.get(tournamentId);
    if (!tournament) return null;
    
    const now = new Date();
    const endTime = new Date(tournament.endTime);
    const timeRemaining = Math.max(0, endTime - now);
    
    return {
      ...tournament,
      timeRemaining,
      isActive: tournament.status === 'active' && timeRemaining > 0
    };
  }

  getActiveTournaments() {
    const tournaments = [];
    this.activeTournaments.forEach(tournament => {
      const info = this.getTournamentInfo(tournament.id);
      if (info && info.isActive) {
        tournaments.push(info);
      }
    });
    return tournaments;
  }

  getPlayerTournamentStats(playerId) {
    const stats = {
      tournamentsPlayed: 0,
      totalWins: 0,
      totalPrizes: { coins: 0, diamonds: 0 },
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0, lightning: 0 },
      currentTournaments: []
    };
    
    this.activeTournaments.forEach(tournament => {
      const player = tournament.players.find(p => p.id === playerId);
      if (player) {
        if (tournament.status === 'active') {
          stats.currentTournaments.push({
            id: tournament.id,
            name: tournament.name,
            position: tournament.leaderboard.findIndex(p => p.id === playerId) + 1,
            points: player.points
          });
        } else if (tournament.status === 'finished') {
          stats.tournamentsPlayed += 1;
          const prize = tournament.prizes?.find(p => p.playerId === playerId);
          if (prize) {
            stats.totalWins += 1;
            stats.totalPrizes.coins += prize.rewards.coins || 0;
            stats.totalPrizes.diamonds += prize.rewards.diamonds || 0;
            if (prize.rewards.trophy) {
              stats.trophies[prize.rewards.trophy] += 1;
            }
          }
        }
      }
    });
    
    return stats;
  }
}