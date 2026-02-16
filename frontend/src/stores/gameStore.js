import { create } from "zustand";
import { io } from "socket.io-client";

const useGameStore = create((set, get) => ({
  // Estado
  socket: null,
  matchId: null,
  board: ["", "", "", "", "", "", "", "", ""],
  mySymbol: null,
  isMyTurn: false,
  opponent: null,
  status: "idle", // "idle" | "waiting" | "playing" | "finished"
  result: null,
  winnerName: null,

  // Conectar al socket (se llama al entrar al dashboard)
  connectSocket: (token) => {
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    socket.on("waiting", () => {
      set({ status: "waiting" });
    });

    socket.on("match_found", (data) => {
      set({
        matchId: data.match_id,
        board: data.board,
        mySymbol: data.your_symbol,
        isMyTurn: data.is_your_turn,
        opponent: data.opponent,
        status: "playing",
      });
    });

    socket.on("move_made", (data) => {
      const myUserId = JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.id;
      set({
        board: data.board,
        isMyTurn: data.current_turn === myUserId,
      });
    });

    socket.on("game_over", (data) => {
      set({
        board: data.board,
        status: "finished",
        result: data.result,
        winnerName: data.winner_name || null,
      });
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
    });

    set({ socket });
  },

  // Buscar partida
  findMatch: () => {
    const { socket } = get();
    if (socket) socket.emit("find_match");
  },

  // Hacer una jugada
  playMove: (position) => {
    const { socket, matchId } = get();
    if (socket) socket.emit("play_move", { match_id: matchId, position });
  },

  // Resetear para una nueva partida
  resetGame: () => {
    set({
      matchId: null,
      board: ["", "", "", "", "", "", "", "", ""],
      mySymbol: null,
      isMyTurn: false,
      opponent: null,
      status: "idle",
      result: null,
      winnerName: null,
    });
  },

  // Desconectar socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null });
  },
}));

export default useGameStore;