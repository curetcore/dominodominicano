export const GAME_MODES = {
  CLASSIC: 'classic',
  DOMINICAN: 'dominican',
  PATIO: 'patio' // Modalidad de patio
};

export const TEAM_MODES = {
  INDIVIDUAL: 'individual',
  PAIRS: 'pairs'
};

export const SPECIAL_SCORES = {
  PASE_SALIDA: 30,    // Cuando el 2do jugador no puede jugar la salida
  PASE_CORRIDO: 30,   // Hacer pasar a los otros 3 jugadores
  CAPICUA: 30,        // Ganar con ficha que sirve por ambos lados
  TRANQUE: 0,         // Se suman todos los puntos de la mesa
  PENALTY_PASS: 30    // Penalización por pasar con ficha
};

export const DOMINO_NAMES = {
  '6-6': 'El burro / La cochina',
  '0-0': 'La caja',
  '2-2': 'El duque',
  '4-4': 'El cuatro doble',
  '1-1': 'El uno doble',
  '3-3': 'El tres doble',
  '5-5': 'El cinco doble'
};

export class DominoGame {
  constructor(mode = GAME_MODES.DOMINICAN, teamMode = TEAM_MODES.PAIRS) {
    this.mode = mode;
    this.teamMode = teamMode;
    this.players = [];
    this.teams = teamMode === TEAM_MODES.PAIRS ? [[0, 2], [1, 3]] : null;
    this.deck = [];
    this.table = [];
    this.hands = {};
    this.currentPlayer = 0;
    this.blocked = false;
    this.leftEnd = null;
    this.rightEnd = null;
    this.scores = teamMode === TEAM_MODES.PAIRS ? [0, 0] : [0, 0, 0, 0];
    this.winningScore = mode === GAME_MODES.DOMINICAN ? 150 : 100; // 150 para dominicano
    this.gameStarted = false;
    this.roundNumber = 1;
    this.history = [];
    this.passCount = 0;
    this.roundWinner = null; // Quien ganó la ronda anterior
    this.firstPlay = true; // Para detectar pase de salida
    this.consecutivePasses = 0; // Para pase corrido
    this.lastPlayerToPlay = null;
    this.specialScores = []; // Registro de puntuaciones especiales
  }

  createDeck() {
    const deck = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        deck.push({ top: i, bottom: j, id: `${i}-${j}` });
      }
    }
    return this.shuffle(deck);
  }

  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  startGame(playerIds) {
    if (playerIds.length !== 4 && this.teamMode === TEAM_MODES.PAIRS) {
      throw new Error('El juego en parejas requiere exactamente 4 jugadores');
    }
    
    this.players = playerIds;
    this.deck = this.createDeck();
    this.hands = {};
    this.table = [];
    this.leftEnd = null;
    this.rightEnd = null;
    this.blocked = false;
    this.passCount = 0;
    
    // Distribute dominoes
    playerIds.forEach((playerId, index) => {
      this.hands[playerId] = this.deck.slice(index * 7, (index + 1) * 7);
    });
    
    // Find who has double 6 to start (Dominican rule)
    this.currentPlayer = this.findStartingPlayer();
    this.gameStarted = true;
    
    return {
      hands: this.hands,
      currentPlayer: this.players[this.currentPlayer],
      table: this.table
    };
  }

  findStartingPlayer() {
    // Primera ronda: sale quien tiene el doble 6 (el burro)
    if (this.roundNumber === 1) {
      for (let i = 0; i < this.players.length; i++) {
        const playerId = this.players[i];
        const hasDoubleSix = this.hands[playerId].some(
          domino => domino.top === 6 && domino.bottom === 6
        );
        if (hasDoubleSix) return i;
      }
      
      // Si nadie tiene el doble 6, buscar el doble más alto
      for (let value = 5; value >= 0; value--) {
        for (let i = 0; i < this.players.length; i++) {
          const playerId = this.players[i];
          const hasDouble = this.hands[playerId].some(
            domino => domino.top === value && domino.bottom === value
          );
          if (hasDouble) return i;
        }
      }
    } else {
      // Siguientes rondas: sale quien ganó la anterior
      if (this.roundWinner !== null) {
        return this.players.indexOf(this.roundWinner);
      }
    }
    
    return 0; // Por defecto
  }

  canPlay(domino, side = null) {
    if (this.table.length === 0) return true;
    
    const values = [domino.top, domino.bottom];
    
    if (side === 'left') {
      return values.includes(this.leftEnd);
    } else if (side === 'right') {
      return values.includes(this.rightEnd);
    } else {
      return values.includes(this.leftEnd) || values.includes(this.rightEnd);
    }
  }

  getValidMoves(playerId) {
    const hand = this.hands[playerId];
    const moves = [];
    
    hand.forEach((domino, index) => {
      if (this.table.length === 0) {
        moves.push({ domino, index, side: 'any' });
      } else {
        if ([domino.top, domino.bottom].includes(this.leftEnd)) {
          moves.push({ domino, index, side: 'left' });
        }
        if ([domino.top, domino.bottom].includes(this.rightEnd)) {
          moves.push({ domino, index, side: 'right' });
        }
      }
    });
    
    return moves;
  }

  playDomino(playerId, dominoIndex, side = null) {
    if (this.players[this.currentPlayer] !== playerId) {
      return { success: false, error: 'No es tu turno' };
    }
    
    const hand = this.hands[playerId];
    const domino = hand[dominoIndex];
    
    if (!domino) {
      return { success: false, error: 'Ficha inválida' };
    }
    
    if (!this.canPlay(domino, side)) {
      return { success: false, error: 'No puedes jugar esa ficha ahí' };
    }
    
    // Remove domino from hand
    hand.splice(dominoIndex, 1);
    
    // Place domino on table
    if (this.table.length === 0) {
      this.table.push(domino);
      this.leftEnd = domino.top;
      this.rightEnd = domino.bottom;
    } else {
      this.placeDominoOnTable(domino, side);
    }
    
    // Record move
    this.history.push({
      player: playerId,
      domino: domino,
      side: side,
      timestamp: Date.now()
    });
    
    // Reset consecutive passes for pase corrido
    this.consecutivePasses = 0;
    this.passCount = 0;
    this.lastPlayerToPlay = playerId;
    this.firstPlay = false;
    
    // Check for special scores
    const specialScore = this.checkSpecialScores(playerId, domino, hand);
    
    // Check win condition
    if (hand.length === 0) {
      return { 
        success: true, 
        gameOver: true, 
        winner: playerId,
        specialScore: specialScore 
      };
    }
    
    // Next player
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    
    return {
      success: true,
      table: this.table,
      currentPlayer: this.players[this.currentPlayer],
      leftEnd: this.leftEnd,
      rightEnd: this.rightEnd,
      specialScore: specialScore
    };
  }

  placeDominoOnTable(domino, side) {
    const needsFlip = (value, end) => {
      if (domino.top === end) return false;
      if (domino.bottom === end) return true;
      return false;
    };
    
    if (side === 'left' || (side === null && [domino.top, domino.bottom].includes(this.leftEnd))) {
      const flip = needsFlip(domino, this.leftEnd);
      const placedDomino = flip ? 
        { ...domino, top: domino.bottom, bottom: domino.top } : 
        domino;
      
      this.table.unshift(placedDomino);
      this.leftEnd = flip ? domino.top : domino.bottom;
    } else {
      const flip = needsFlip(domino, this.rightEnd);
      const placedDomino = flip ? 
        { ...domino, top: domino.bottom, bottom: domino.top } : 
        domino;
      
      this.table.push(placedDomino);
      this.rightEnd = flip ? domino.top : domino.bottom;
    }
  }

  pass(playerId) {
    if (this.players[this.currentPlayer] !== playerId) {
      return { success: false, error: 'No es tu turno' };
    }
    
    const validMoves = this.getValidMoves(playerId);
    
    // REGLA IMPORTANTE: Prohibido pasar con ficha
    if (validMoves.length > 0) {
      // Penalización por pasar con ficha
      if (this.teamMode === TEAM_MODES.PAIRS) {
        const teamIndex = this.teams.findIndex(team => team.includes(this.currentPlayer));
        const opponentTeam = teamIndex === 0 ? 1 : 0;
        this.scores[opponentTeam] += SPECIAL_SCORES.PENALTY_PASS;
        
        return { 
          success: false, 
          error: 'Tienes fichas para jugar - Penalización de 30 puntos',
          penalty: true,
          penaltyPoints: SPECIAL_SCORES.PENALTY_PASS
        };
      }
    }
    
    this.passCount++;
    this.consecutivePasses++;
    
    // Check for PASE DE SALIDA (only on second player after first play)
    if (this.firstPlay && this.passCount === 1 && this.table.length === 1) {
      const firstPlayerTeam = this.teams.findIndex(team => team.includes((this.currentPlayer + 3) % 4));
      this.scores[firstPlayerTeam] += SPECIAL_SCORES.PASE_SALIDA;
      this.specialScores.push({
        type: 'PASE_SALIDA',
        team: firstPlayerTeam,
        points: SPECIAL_SCORES.PASE_SALIDA
      });
    }
    
    // Check for PASE CORRIDO/REDONDO
    if (this.consecutivePasses === 3 && this.lastPlayerToPlay !== null) {
      const playerIndex = this.players.indexOf(this.lastPlayerToPlay);
      const teamIndex = this.teams.findIndex(team => team.includes(playerIndex));
      this.scores[teamIndex] += SPECIAL_SCORES.PASE_CORRIDO;
      this.specialScores.push({
        type: 'PASE_CORRIDO',
        team: teamIndex,
        points: SPECIAL_SCORES.PASE_CORRIDO,
        player: this.lastPlayerToPlay
      });
      
      // El jugador que hizo el pase corrido vuelve a tirar
      this.currentPlayer = playerIndex;
      this.consecutivePasses = 0;
      
      return {
        success: true,
        currentPlayer: this.players[this.currentPlayer],
        specialScore: {
          type: 'PASE_CORRIDO',
          points: SPECIAL_SCORES.PASE_CORRIDO
        }
      };
    }
    
    // Check if game is blocked (all players passed)
    if (this.passCount >= this.players.length) {
      return this.handleBlockedGame();
    }
    
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    
    return {
      success: true,
      currentPlayer: this.players[this.currentPlayer]
    };
  }

  handleBlockedGame() {
    this.blocked = true;
    
    // TRANQUE: Cuando se cierra el juego intencionalmente
    // Se compara con "el de abajo" (jugador a la derecha)
    
    // Count points in each hand
    const handPoints = {};
    this.players.forEach(playerId => {
      handPoints[playerId] = this.hands[playerId].reduce(
        (sum, domino) => sum + domino.top + domino.bottom, 0
      );
    });
    
    // Find who blocked the game
    const blocker = this.lastPlayerToPlay;
    let winner = null;
    let totalPoints = 0;
    
    if (this.teamMode === TEAM_MODES.PAIRS) {
      // En parejas, se comparan los equipos
      const teamPoints = [
        handPoints[this.players[0]] + handPoints[this.players[2]],
        handPoints[this.players[1]] + handPoints[this.players[3]]
      ];
      
      // Calcular puntos totales en la mesa
      totalPoints = teamPoints[0] + teamPoints[1];
      
      if (teamPoints[0] < teamPoints[1]) {
        winner = [this.players[0], this.players[2]];
        this.scores[0] += totalPoints; // En tranque, gana todos los puntos
      } else if (teamPoints[1] < teamPoints[0]) {
        winner = [this.players[1], this.players[3]];
        this.scores[1] += totalPoints;
      } else {
        // En empate, gana quien salió esa ronda
        const startingPlayer = this.history[0]?.player;
        const startingTeam = this.teams.findIndex(team => 
          team.includes(this.players.indexOf(startingPlayer))
        );
        winner = this.teams[startingTeam].map(i => this.players[i]);
        this.scores[startingTeam] += totalPoints;
      }
      
      this.specialScores.push({
        type: 'TRANQUE',
        winner: winner,
        points: totalPoints
      });
    }
    
    return {
      success: true,
      gameOver: true,
      blocked: true,
      winner: winner,
      handPoints: handPoints,
      scores: this.scores,
      specialScore: {
        type: 'TRANQUE',
        points: totalPoints
      }
    };
  }

  calculateRoundScore() {
    const points = {};
    let totalPoints = 0;
    
    this.players.forEach(playerId => {
      const handValue = this.hands[playerId].reduce(
        (sum, domino) => sum + domino.top + domino.bottom, 0
      );
      points[playerId] = handValue;
      totalPoints += handValue;
    });
    
    return { points, total: totalPoints };
  }

  checkSpecialScores(playerId, domino, hand) {
    if (hand.length !== 0) return null;
    
    // CAPICÚA: Ganar con ficha que sirve por ambos lados
    // NO vale si es con doble o ficha blanca
    const isDouble = domino.top === domino.bottom;
    const isBlank = domino.top === 0 || domino.bottom === 0;
    
    if (!isDouble && !isBlank && this.table.length > 1) {
      // Check if the domino could have been played on either end
      const couldPlayLeft = [domino.top, domino.bottom].includes(this.leftEnd);
      const couldPlayRight = [domino.top, domino.bottom].includes(this.rightEnd);
      
      if (couldPlayLeft && couldPlayRight) {
        const teamIndex = this.teams.findIndex(team => 
          team.includes(this.players.indexOf(playerId))
        );
        this.scores[teamIndex] += SPECIAL_SCORES.CAPICUA;
        
        this.specialScores.push({
          type: 'CAPICUA',
          player: playerId,
          team: teamIndex,
          points: SPECIAL_SCORES.CAPICUA
        });
        
        return {
          type: 'CAPICUA',
          points: SPECIAL_SCORES.CAPICUA
        };
      }
    }
    
    return null;
  }

  getGameState() {
    return {
      mode: this.mode,
      teamMode: this.teamMode,
      players: this.players,
      table: this.table,
      currentPlayer: this.players[this.currentPlayer],
      leftEnd: this.leftEnd,
      rightEnd: this.rightEnd,
      scores: this.scores,
      roundNumber: this.roundNumber,
      blocked: this.blocked,
      gameStarted: this.gameStarted,
      specialScores: this.specialScores
    };
  }
  
  getDominoName(domino) {
    const key = `${domino.top}-${domino.bottom}`;
    const reverseKey = `${domino.bottom}-${domino.top}`;
    return DOMINO_NAMES[key] || DOMINO_NAMES[reverseKey] || null;
  }
  
  resetRound() {
    // Keep scores and round winner
    this.deck = this.createDeck();
    this.table = [];
    this.hands = {};
    this.leftEnd = null;
    this.rightEnd = null;
    this.blocked = false;
    this.passCount = 0;
    this.firstPlay = true;
    this.consecutivePasses = 0;
    this.lastPlayerToPlay = null;
    this.history = [];
    this.specialScores = [];
    this.roundNumber++;
  }
}