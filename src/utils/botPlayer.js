// Bot/AI player for Dominican Domino

export class BotPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.playDelay = {
      easy: 2000,
      medium: 1500,
      hard: 1000
    }[difficulty];
  }

  // Evaluate best move for bot
  evaluateMove(hand, table, leftEnd, rightEnd) {
    const possibleMoves = [];
    
    hand.forEach((domino, index) => {
      const values = [domino.top, domino.bottom];
      
      if (table.length === 0) {
        // First move - prefer doubles
        const isDouble = domino.top === domino.bottom;
        possibleMoves.push({
          domino,
          index,
          side: 'any',
          score: isDouble ? domino.top * 2 + 10 : domino.top + domino.bottom
        });
      } else {
        // Check both ends
        if (values.includes(leftEnd)) {
          possibleMoves.push({
            domino,
            index,
            side: 'left',
            score: this.calculateMoveScore(domino, hand, 'left')
          });
        }
        if (values.includes(rightEnd) && rightEnd !== leftEnd) {
          possibleMoves.push({
            domino,
            index,
            side: 'right',
            score: this.calculateMoveScore(domino, hand, 'right')
          });
        }
      }
    });
    
    if (possibleMoves.length === 0) return null;
    
    // Sort by score and pick based on difficulty
    possibleMoves.sort((a, b) => b.score - a.score);
    
    switch (this.difficulty) {
      case 'easy':
        // Random from top 50%
        const easyOptions = possibleMoves.slice(0, Math.ceil(possibleMoves.length / 2));
        return easyOptions[Math.floor(Math.random() * easyOptions.length)];
      
      case 'medium':
        // Usually best, sometimes random
        return Math.random() > 0.8 
          ? possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
          : possibleMoves[0];
      
      case 'hard':
        // Always best move
        return possibleMoves[0];
      
      default:
        return possibleMoves[0];
    }
  }
  
  calculateMoveScore(domino, hand, side) {
    let score = 0;
    
    // Prefer playing doubles early
    if (domino.top === domino.bottom) {
      score += 20;
    }
    
    // Prefer playing high value pieces
    score += (domino.top + domino.bottom);
    
    // Check if this move could lead to capicúa
    const otherValue = domino.top === domino.bottom ? domino.top : 
                      (side === 'left' ? domino.bottom : domino.top);
    const canCapicua = hand.some(d => 
      d !== domino && [d.top, d.bottom].includes(otherValue)
    );
    if (canCapicua && hand.length <= 3) {
      score += 30; // Capicúa bonus
    }
    
    // Avoid leaving only high pieces
    if (hand.length <= 4) {
      const remainingSum = hand
        .filter(d => d !== domino)
        .reduce((sum, d) => sum + d.top + d.bottom, 0);
      score -= remainingSum / 10;
    }
    
    // Add some randomness for medium difficulty
    if (this.difficulty === 'medium') {
      score += Math.random() * 10;
    }
    
    return score;
  }
  
  // Generate bot names
  static getBotName() {
    const names = [
      'Juan el Duro',
      'María la Campeona',
      'Pedro Capicúa',
      'Ana Dominó',
      'Carlos el Tranque',
      'Rosa la Maestra',
      'Miguel Doble-6',
      'Carmen la Rápida',
      'Luis el Pensador',
      'Sofia la Estratega'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  // Bot personalities (different play styles)
  static getBotPersonality() {
    const personalities = [
      { type: 'aggressive', message: '¡Dale que voy con to\'!' },
      { type: 'defensive', message: 'Hay que pensar bien...' },
      { type: 'balanced', message: 'Vamo\' a ver qué sale' },
      { type: 'lucky', message: '¡La suerte está conmigo!' }
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }
  
  // Bot reactions to game events
  getReaction(event, data = {}) {
    const reactions = {
      win: [
        '¡Me pegué! 🎉',
        '¡Eso e\' pa\' que aprendan!',
        '¡Dominó cerrao\'!',
        '¡La victoria es mía!'
      ],
      lose: [
        'Esa estuvo buena...',
        'Pa\' la próxima gano yo',
        'Me descuidé un chin',
        'Bien jugao\' socio'
      ],
      capicua: [
        '¡Capicúa manito! 💪',
        '¡Esa no la viste venir!',
        '¡30 puntos más!'
      ],
      tranque: [
        '¡Se trancó el juego!',
        'A contar fichas...',
        'Vamo\' a ver quién gana'
      ],
      pass: [
        '¡Agua! 💧',
        'Paso mi llave',
        'No tengo na\''
      ],
      goodPlay: [
        'Esa estuvo buena',
        'Bien jugao\'',
        'Te la comiste'
      ],
      thinking: [
        '🤔',
        'Déjame pensar...',
        'A ver, a ver...'
      ]
    };
    
    const options = reactions[event] || ['🎲'];
    return options[Math.floor(Math.random() * options.length)];
  }
}