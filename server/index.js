import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DominoGame, GAME_MODES, TEAM_MODES, SPECIAL_SCORES } from '../shared/gameLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Production CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const clientUrl = process.env.CLIENT_URL || (isDevelopment ? 'http://localhost:3000' : '');

const io = new Server(server, {
  cors: {
    origin: isDevelopment ? "http://localhost:3000" : true,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: isDevelopment ? "http://localhost:3000" : true,
  credentials: true
}));
app.use(express.json());

// Serve static files in production
app.use(express.static(join(__dirname, '../dist')));

// Catch all routes and serve index.html in production
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Game rooms storage
const gameRooms = new Map();
const playerRooms = new Map();

// Dominican phrases for chat
const dominicanPhrases = [
  "¡Agua!",
  "¡Me pegué!",
  "¡Capicúa manito!",
  "¡Tranque!",
  "Dale que llegamo'",
  "Ta' buena esa",
  "Se te trancó el juego",
  "Eso e' pa' que aprenda'",
  "¡Dominó cerrao'!",
  "Ahí e' que tá"
];

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('create-room', (data) => {
    const roomId = generateRoomId();
    const room = {
      id: roomId,
      name: data.name || `Sala ${roomId}`,
      players: [{
        id: socket.id,
        name: data.playerName,
        ready: false,
        team: null
      }],
      game: new DominoGame(data.mode || GAME_MODES.DOMINICAN, data.teamMode || TEAM_MODES.PAIRS),
      host: socket.id,
      settings: {
        mode: data.mode || GAME_MODES.DOMINICAN,
        teamMode: data.teamMode || TEAM_MODES.PAIRS,
        winningScore: data.winningScore || 200,
        timeLimit: data.timeLimit || 30
      }
    };
    
    gameRooms.set(roomId, room);
    playerRooms.set(socket.id, roomId);
    
    socket.join(roomId);
    socket.emit('room-created', { roomId, room });
    
    console.log(`Sala creada: ${roomId} por ${data.playerName}`);
  });

  socket.on('join-room', (data) => {
    const room = gameRooms.get(data.roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }
    
    if (room.players.length >= 4) {
      socket.emit('error', { message: 'Sala llena' });
      return;
    }
    
    room.players.push({
      id: socket.id,
      name: data.playerName,
      ready: false,
      team: null
    });
    
    playerRooms.set(socket.id, data.roomId);
    socket.join(data.roomId);
    
    io.to(data.roomId).emit('player-joined', {
      player: { id: socket.id, name: data.playerName },
      players: room.players
    });
    
    socket.emit('room-joined', { roomId: data.roomId, room });
  });

  socket.on('player-ready', (data) => {
    const roomId = playerRooms.get(socket.id);
    const room = gameRooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = data.ready;
      player.team = data.team;
      
      io.to(roomId).emit('player-ready-update', {
        playerId: socket.id,
        ready: data.ready,
        team: data.team,
        players: room.players
      });
      
      // Check if all players are ready
      if (room.players.length >= 2 && room.players.every(p => p.ready)) {
        startGame(roomId);
      }
    }
  });

  socket.on('play-domino', (data) => {
    const roomId = playerRooms.get(socket.id);
    const room = gameRooms.get(roomId);
    
    if (!room || !room.game.gameStarted) return;
    
    const result = room.game.playDomino(socket.id, data.dominoIndex, data.side);
    
    if (result.success) {
      io.to(roomId).emit('domino-played', {
        playerId: socket.id,
        domino: data.domino,
        side: data.side,
        table: result.table,
        currentPlayer: result.currentPlayer,
        leftEnd: result.leftEnd,
        rightEnd: result.rightEnd
      });
      
      // Update hands
      room.players.forEach(player => {
        io.to(player.id).emit('hand-update', {
          hand: room.game.hands[player.id]
        });
      });
      
      if (result.gameOver) {
        handleRoundEnd(roomId, result.winner, false, result.specialScore);
      }
      
      // Notify about special scores
      if (result.specialScore) {
        io.to(roomId).emit('special-score', {
          type: result.specialScore.type,
          points: result.specialScore.points,
          player: socket.id
        });
      }
    } else {
      socket.emit('play-error', { message: result.error });
    }
  });

  socket.on('pass-turn', () => {
    const roomId = playerRooms.get(socket.id);
    const room = gameRooms.get(roomId);
    
    if (!room || !room.game.gameStarted) return;
    
    const result = room.game.pass(socket.id);
    
    if (result.success) {
      io.to(roomId).emit('turn-passed', {
        playerId: socket.id,
        currentPlayer: result.currentPlayer
      });
      
      if (result.gameOver) {
        handleRoundEnd(roomId, result.winner, result.blocked, result.specialScore);
      }
      
      // Notify about special scores
      if (result.specialScore) {
        io.to(roomId).emit('special-score', {
          type: result.specialScore.type,
          points: result.specialScore.points
        });
      }
    } else {
      socket.emit('pass-error', { message: result.error });
      
      // Handle penalty
      if (result.penalty) {
        io.to(roomId).emit('penalty', {
          player: socket.id,
          points: result.penaltyPoints,
          reason: 'PASAR_CON_FICHA'
        });
      }
    }
  });

  socket.on('chat-message', (data) => {
    const roomId = playerRooms.get(socket.id);
    const room = gameRooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    
    io.to(roomId).emit('chat-message', {
      playerId: socket.id,
      playerName: player.name,
      message: data.message,
      timestamp: Date.now()
    });
  });

  socket.on('quick-phrase', (data) => {
    const roomId = playerRooms.get(socket.id);
    const room = gameRooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    const phrase = dominicanPhrases[data.phraseIndex] || dominicanPhrases[0];
    
    io.to(roomId).emit('chat-message', {
      playerId: socket.id,
      playerName: player.name,
      message: phrase,
      timestamp: Date.now(),
      isPhrase: true
    });
  });

  socket.on('disconnect', () => {
    const roomId = playerRooms.get(socket.id);
    
    if (roomId) {
      const room = gameRooms.get(roomId);
      
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit('player-disconnected', {
            playerId: socket.id,
            players: room.players
          });
          
          // If host left, assign new host
          if (room.host === socket.id && room.players.length > 0) {
            room.host = room.players[0].id;
            io.to(roomId).emit('host-changed', { newHost: room.host });
          }
        }
      }
      
      playerRooms.delete(socket.id);
    }
    
    console.log('Usuario desconectado:', socket.id);
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function startGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;
  
  const playerIds = room.players.map(p => p.id);
  const gameState = room.game.startGame(playerIds);
  
  io.to(roomId).emit('game-started', {
    gameState: room.game.getGameState(),
    currentPlayer: gameState.currentPlayer
  });
  
  // Send individual hands to each player
  room.players.forEach(player => {
    io.to(player.id).emit('hand-dealt', {
      hand: gameState.hands[player.id]
    });
  });
}

function handleRoundEnd(roomId, winner, blocked = false, specialScore = null) {
  const room = gameRooms.get(roomId);
  if (!room) return;
  
  const scoreData = room.game.calculateRoundScore();
  
  // Set round winner for next round
  room.game.roundWinner = winner;
  
  // Update scores (already done by game logic for special scores)
  if (!specialScore || specialScore.type !== 'TRANQUE') {
    if (room.game.teamMode === TEAM_MODES.PAIRS) {
      const winningTeam = room.game.teams.findIndex(team => 
        Array.isArray(winner) ? team.some(i => winner.includes(room.players[i].id)) : 
        team.includes(room.players.findIndex(p => p.id === winner))
      );
      room.game.scores[winningTeam] += scoreData.total;
    }
  }
  
  const gameOver = room.game.scores.some(score => score >= room.game.winningScore);
  
  io.to(roomId).emit('round-ended', {
    winner: winner,
    blocked: blocked,
    scores: room.game.scores,
    scoreData: scoreData,
    gameOver: gameOver,
    roundNumber: room.game.roundNumber,
    specialScore: specialScore,
    specialScores: room.game.specialScores
  });
  
  if (!gameOver) {
    // Start new round after delay
    setTimeout(() => {
      room.game.resetRound();
      const playerIds = room.players.map(p => p.id);
      const gameState = room.game.startGame(playerIds);
      
      io.to(roomId).emit('game-started', {
        gameState: room.game.getGameState(),
        currentPlayer: gameState.currentPlayer
      });
      
      // Send individual hands to each player
      room.players.forEach(player => {
        io.to(player.id).emit('hand-dealt', {
          hand: gameState.hands[player.id]
        });
      });
    }, 5000);
  } else {
    const winningTeam = room.game.scores.indexOf(Math.max(...room.game.scores));
    io.to(roomId).emit('game-over', {
      finalScores: room.game.scores,
      winner: winningTeam,
      team: room.game.teams[winningTeam].map(i => room.players[i])
    });
  }
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});