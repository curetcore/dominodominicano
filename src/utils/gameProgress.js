// Sistema de progresión y recompensas

export const XP_REWARDS = {
  GAME_WIN: 100,
  GAME_LOSS: 25,
  DOMINO_CERRADO: 75,
  CAPICUA: 50,
  POLLONA: 150, // Ganar sin que el oponente anote
  QUICK_PLAY: 10, // Jugar en menos de 5 segundos
  DAILY_LOGIN: 50,
  PERFECT_GAME: 200 // Ganar sin pasar turno
};

export const LEVELS = Array.from({ length: 100 }, (_, i) => ({
  level: i + 1,
  xpRequired: Math.floor(100 * Math.pow(1.15, i)),
  rewards: {
    coins: 100 + (i * 50),
    diamonds: i % 10 === 0 ? 10 : 0,
    unlock: getUnlockForLevel(i + 1)
  }
}));

function getUnlockForLevel(level) {
  const unlocks = {
    5: { type: 'theme', id: 'beach', name: 'Mesa Playa Dominicana' },
    10: { type: 'domino', id: 'wood', name: 'Fichas de Madera' },
    15: { type: 'avatar_frame', id: 'bronze', name: 'Marco Bronce' },
    20: { type: 'theme', id: 'colmado', name: 'Mesa Colmado' },
    25: { type: 'effect', id: 'fire', name: 'Efecto Fuego' },
    30: { type: 'domino', id: 'marble', name: 'Fichas de Mármol' },
    40: { type: 'avatar_frame', id: 'silver', name: 'Marco Plata' },
    50: { type: 'theme', id: 'malecon', name: 'Mesa Malecón' },
    60: { type: 'domino', id: 'gold', name: 'Fichas de Oro' },
    75: { type: 'effect', id: 'lightning', name: 'Efecto Rayo' },
    100: { type: 'avatar_frame', id: 'diamond', name: 'Marco Diamante' }
  };
  
  return unlocks[level] || null;
}

export class PlayerProgress {
  constructor(playerId) {
    this.playerId = playerId;
    this.data = this.loadProgress();
  }
  
  loadProgress() {
    const saved = localStorage.getItem(`player_${this.playerId}_progress`);
    return saved ? JSON.parse(saved) : {
      level: 1,
      xp: 0,
      totalGames: 0,
      wins: 0,
      winStreak: 0,
      bestStreak: 0,
      coins: 1000,
      diamonds: 10,
      unlocks: [],
      achievements: [],
      lastLogin: null,
      consecutiveDays: 0
    };
  }
  
  saveProgress() {
    localStorage.setItem(`player_${this.playerId}_progress`, JSON.stringify(this.data));
  }
  
  addXP(amount, reason) {
    this.data.xp += amount;
    
    // Check level up
    const currentLevelData = LEVELS[this.data.level - 1];
    const nextLevelData = LEVELS[this.data.level];
    
    if (nextLevelData && this.data.xp >= nextLevelData.xpRequired) {
      this.levelUp();
    }
    
    this.saveProgress();
    
    return {
      xpGained: amount,
      reason: reason,
      currentXP: this.data.xp,
      level: this.data.level,
      nextLevelXP: nextLevelData?.xpRequired || 0
    };
  }
  
  levelUp() {
    this.data.level += 1;
    const rewards = LEVELS[this.data.level - 1].rewards;
    
    this.data.coins += rewards.coins;
    this.data.diamonds += rewards.diamonds;
    
    if (rewards.unlock) {
      this.data.unlocks.push(rewards.unlock);
    }
    
    return {
      newLevel: this.data.level,
      rewards: rewards
    };
  }
  
  recordGameResult(won, gameStats) {
    this.data.totalGames += 1;
    
    if (won) {
      this.data.wins += 1;
      this.data.winStreak += 1;
      this.data.bestStreak = Math.max(this.data.bestStreak, this.data.winStreak);
      this.addXP(XP_REWARDS.GAME_WIN, 'Victoria');
    } else {
      this.data.winStreak = 0;
      this.addXP(XP_REWARDS.GAME_LOSS, 'Participación');
    }
    
    // Bonus XP
    if (gameStats.capicua) this.addXP(XP_REWARDS.CAPICUA, 'Capicúa');
    if (gameStats.dominoCerrado) this.addXP(XP_REWARDS.DOMINO_CERRADO, 'Dominó Cerrado');
    if (gameStats.pollona) this.addXP(XP_REWARDS.POLLONA, 'Pollona');
    
    this.checkAchievements();
    this.saveProgress();
  }
  
  checkDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = this.data.lastLogin ? new Date(this.data.lastLogin).toDateString() : null;
    
    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLogin === yesterday.toDateString()) {
        this.data.consecutiveDays += 1;
      } else {
        this.data.consecutiveDays = 1;
      }
      
      this.data.lastLogin = new Date().toISOString();
      const bonusMultiplier = Math.min(this.data.consecutiveDays, 7);
      const bonus = XP_REWARDS.DAILY_LOGIN * bonusMultiplier;
      
      this.addXP(bonus, `Login día ${this.data.consecutiveDays}`);
      this.data.coins += 100 * bonusMultiplier;
      
      this.saveProgress();
      
      return {
        consecutiveDays: this.data.consecutiveDays,
        rewards: {
          xp: bonus,
          coins: 100 * bonusMultiplier
        }
      };
    }
    
    return null;
  }
  
  checkAchievements() {
    const achievements = [
      { id: 'first_win', name: 'Primera Victoria', condition: () => this.data.wins === 1 },
      { id: 'win_10', name: 'Veterano', condition: () => this.data.wins >= 10 },
      { id: 'win_50', name: 'Experto', condition: () => this.data.wins >= 50 },
      { id: 'win_100', name: 'Maestro', condition: () => this.data.wins >= 100 },
      { id: 'streak_5', name: 'En Racha', condition: () => this.data.winStreak >= 5 },
      { id: 'streak_10', name: 'Imparable', condition: () => this.data.winStreak >= 10 },
      { id: 'level_10', name: 'Subiendo', condition: () => this.data.level >= 10 },
      { id: 'level_50', name: 'Dedicado', condition: () => this.data.level >= 50 },
      { id: 'rich', name: 'Rico', condition: () => this.data.coins >= 10000 },
      { id: 'login_7', name: 'Fiel', condition: () => this.data.consecutiveDays >= 7 }
    ];
    
    achievements.forEach(achievement => {
      if (!this.data.achievements.includes(achievement.id) && achievement.condition()) {
        this.data.achievements.push(achievement.id);
        this.data.diamonds += 5;
        // Trigger achievement notification
      }
    });
  }
  
  getStats() {
    return {
      winRate: this.data.totalGames > 0 ? (this.data.wins / this.data.totalGames * 100).toFixed(1) : 0,
      avgXPPerGame: this.data.totalGames > 0 ? Math.floor(this.data.xp / this.data.totalGames) : 0,
      ...this.data
    };
  }
}