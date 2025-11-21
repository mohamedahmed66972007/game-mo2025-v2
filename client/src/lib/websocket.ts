import { useNumberGame } from "./stores/useNumberGame";

let socket: WebSocket | null = null;

export const connectWebSocket = (playerName: string, roomId?: string) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/game`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
    if (roomId) {
      send({ type: "join_room", roomId, playerName });
    } else {
      send({ type: "create_room", playerName });
    }
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleMessage(message);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
};

export const send = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

export const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

const handleMessage = (message: any) => {
  const store = useNumberGame.getState();

  console.log("Received message:", message);

  switch (message.type) {
    case "room_created":
      store.setRoomId(message.roomId);
      store.setPlayerId(message.playerId);
      console.log("Room created:", message.roomId);
      break;

    case "room_joined":
      store.setRoomId(message.roomId);
      store.setPlayerId(message.playerId);
      store.setPlayers(message.players);
      console.log("Room joined:", message.roomId);
      break;

    case "players_updated":
      store.setPlayers(message.players);
      break;

    case "challenge_received":
      store.setOpponentId(message.fromPlayerId);
      store.setChallengeStatus("received");
      useNumberGame.setState((state) => ({
        multiplayer: {
          ...state.multiplayer,
          isChallengeSender: false,
        },
      }));
      break;

    case "challenge_sent":
      store.setChallengeStatus("sent");
      useNumberGame.setState((state) => ({
        multiplayer: {
          ...state.multiplayer,
          isChallengeSender: true,
        },
      }));
      break;

    case "challenge_accepted":
      if (!store.multiplayer.opponentId) {
        store.setOpponentId(message.opponentId);
      }
      store.setChallengeStatus("accepted");
      break;

    case "game_started":
      // Challenge sender goes first
      store.setIsMyTurn(store.multiplayer.isChallengeSender);
      store.resetMultiplayer();
      console.log("Game started. Am I challenge sender?", store.multiplayer.isChallengeSender, "My turn?", store.multiplayer.isChallengeSender);
      break;

    case "guess_result":
      const attempt = {
        guess: message.guess,
        correctCount: message.correctCount,
        correctPositionCount: message.correctPositionCount,
      };
      
      const currentState = useNumberGame.getState();
      if (message.playerId === currentState.multiplayer.playerId) {
        useNumberGame.setState({
          multiplayer: {
            ...currentState.multiplayer,
            attempts: [...currentState.multiplayer.attempts, attempt],
          },
        });
      } else {
        store.addOpponentAttempt(attempt);
      }

      store.setIsMyTurn(message.nextTurn === store.multiplayer.playerId);
      store.setTurnTimeLeft(60);

      if (message.won) {
        if (message.playerId === store.multiplayer.playerId) {
          store.setMultiplayerPhase("won");
        } else {
          store.setMultiplayerPhase("lost");
        }
      }
      break;

    case "turn_timeout":
      store.setIsMyTurn(message.currentTurn === store.multiplayer.playerId);
      store.setTurnTimeLeft(60);
      break;

    case "opponent_disconnected":
      console.log("Opponent disconnected");
      store.setMultiplayerPhase("won");
      break;

    case "opponent_quit":
      console.log("Opponent quit");
      store.setMultiplayerPhase("won");
      break;

    default:
      console.log("Unknown message type:", message.type);
  }
};
