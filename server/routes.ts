import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  roomId: string;
}

interface Room {
  id: string;
  players: Player[];
  games: Map<string, GameSession>;
}

interface GameSession {
  player1: Player;
  player2: Player;
  secretCodes: Map<string, number[]>;
  attempts: Map<string, any[]>;
  currentTurn: string;
  turnStartTime: number;
}

const rooms = new Map<string, Room>();
const players = new Map<WebSocket, Player>();

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function checkGuess(secret: number[], guess: number[]): { correctCount: number; correctPositionCount: number } {
  let correctCount = 0;
  let correctPositionCount = 0;

  const secretCopy = [...secret];
  const guessCopy = [...guess];

  for (let i = 0; i < 4; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      correctPositionCount++;
      secretCopy[i] = -1;
      guessCopy[i] = -2;
    }
  }

  for (let i = 0; i < 4; i++) {
    if (guessCopy[i] !== -2) {
      const index = secretCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        correctCount++;
        secretCopy[index] = -1;
      }
    }
  }

  correctCount += correctPositionCount;

  return { correctCount, correctPositionCount };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;
    
    if (pathname === "/game") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New game WebSocket connection");

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      const player = players.get(ws);
      if (player) {
        const room = rooms.get(player.roomId);
        if (room) {
          room.players = room.players.filter((p) => p.id !== player.id);
          
          if (room.players.length === 0) {
            rooms.delete(player.roomId);
          } else {
            broadcastToRoom(room, {
              type: "players_updated",
              players: room.players.map((p) => ({ id: p.id, name: p.name })),
            });
          }
        }
        players.delete(ws);
      }
    });
  });

  function handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case "create_room": {
        const roomId = generateRoomId();
        const playerId = generatePlayerId();
        const player: Player = {
          id: playerId,
          name: message.playerName,
          ws,
          roomId,
        };

        const room: Room = {
          id: roomId,
          players: [player],
          games: new Map(),
        };

        rooms.set(roomId, room);
        players.set(ws, player);

        send(ws, {
          type: "room_created",
          roomId,
          playerId,
        });
        break;
      }

      case "join_room": {
        const room = rooms.get(message.roomId);
        if (room && room.players.length < 4) {
          const playerId = generatePlayerId();
          const player: Player = {
            id: playerId,
            name: message.playerName,
            ws,
            roomId: room.id,
          };

          room.players.push(player);
          players.set(ws, player);

          send(ws, {
            type: "room_joined",
            roomId: room.id,
            playerId,
            players: room.players.map((p) => ({ id: p.id, name: p.name })),
          });

          broadcastToRoom(room, {
            type: "players_updated",
            players: room.players.map((p) => ({ id: p.id, name: p.name })),
          });
        } else {
          send(ws, { type: "error", message: "Room not found or full" });
        }
        break;
      }

      case "challenge_player": {
        const player = players.get(ws);
        if (!player) return;

        const room = rooms.get(player.roomId);
        if (!room) return;

        const opponent = room.players.find((p) => p.id === message.opponentId);
        if (opponent) {
          send(opponent.ws, {
            type: "challenge_received",
            fromPlayerId: player.id,
            fromPlayerName: player.name,
          });
        }
        break;
      }

      case "accept_challenge": {
        const player = players.get(ws);
        if (!player) return;

        const room = rooms.get(player.roomId);
        if (!room) return;

        const opponent = room.players.find((p) => p.id === message.opponentId);
        if (opponent) {
          send(opponent.ws, {
            type: "challenge_accepted",
          });
        }
        break;
      }

      case "set_secret_code": {
        const player = players.get(ws);
        if (!player) return;

        const room = rooms.get(player.roomId);
        if (!room) return;

        const opponent = room.players.find((p) => p.id === message.opponentId);
        if (!opponent) return;

        const gameKey = [player.id, opponent.id].sort().join("-");
        let game = room.games.get(gameKey);

        if (!game) {
          game = {
            player1: player,
            player2: opponent,
            secretCodes: new Map(),
            attempts: new Map(),
            currentTurn: player.id,
            turnStartTime: Date.now(),
          };
          room.games.set(gameKey, game);
        }

        game.secretCodes.set(player.id, message.code);

        if (game.secretCodes.size === 2) {
          const firstPlayer = Math.random() < 0.5 ? player.id : opponent.id;
          game.currentTurn = firstPlayer;
          game.turnStartTime = Date.now();

          send(player.ws, {
            type: "game_started",
            firstPlayerId: firstPlayer,
          });

          send(opponent.ws, {
            type: "game_started",
            firstPlayerId: firstPlayer,
          });
        }
        break;
      }

      case "submit_guess": {
        const player = players.get(ws);
        if (!player) return;

        const room = rooms.get(player.roomId);
        if (!room) return;

        const opponent = room.players.find((p) => p.id === message.opponentId);
        if (!opponent) return;

        const gameKey = [player.id, opponent.id].sort().join("-");
        const game = room.games.get(gameKey);
        if (!game) return;

        if (game.currentTurn !== player.id) {
          send(ws, { type: "error", message: "Not your turn" });
          return;
        }

        const opponentSecret = game.secretCodes.get(opponent.id);
        if (!opponentSecret) return;

        const { correctCount, correctPositionCount } = checkGuess(opponentSecret, message.guess);

        if (!game.attempts.has(player.id)) {
          game.attempts.set(player.id, []);
        }

        game.attempts.get(player.id)!.push({
          guess: message.guess,
          correctCount,
          correctPositionCount,
        });

        const won = correctPositionCount === 4;

        send(player.ws, {
          type: "guess_result",
          playerId: player.id,
          guess: message.guess,
          correctCount,
          correctPositionCount,
          won,
          nextTurn: opponent.id,
        });

        send(opponent.ws, {
          type: "guess_result",
          playerId: player.id,
          guess: message.guess,
          correctCount,
          correctPositionCount,
          won,
          nextTurn: opponent.id,
        });

        if (won) {
          const attempts = game.attempts.get(player.id)!.length;
          send(opponent.ws, {
            type: "game_over",
            winner: player.id,
            winnerName: player.name,
            attempts,
          });
        } else {
          game.currentTurn = opponent.id;
          game.turnStartTime = Date.now();
        }
        break;
      }
    }
  }

  function send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function broadcastToRoom(room: Room, message: any, exclude?: WebSocket) {
    room.players.forEach((player) => {
      if (player.ws !== exclude) {
        send(player.ws, message);
      }
    });
  }

  return httpServer;
}
