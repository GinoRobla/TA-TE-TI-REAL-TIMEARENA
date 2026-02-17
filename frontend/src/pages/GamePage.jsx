import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import useGameStore from "../stores/gameStore";
import useAuthStore from "../stores/authStore";
import "./GamePage.css";

export default function GamePage() {
  const board = useGameStore((state) => state.board);
  const mySymbol = useGameStore((state) => state.mySymbol);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const opponent = useGameStore((state) => state.opponent);
  const status = useGameStore((state) => state.status);
  const result = useGameStore((state) => state.result);
  const winnerName = useGameStore((state) => state.winnerName);
  const winnerId = useGameStore((state) => state.winnerId);
  const playMove = useGameStore((state) => state.playMove);
  const resetGame = useGameStore((state) => state.resetGame);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Si no hay partida en curso (ej: refresh), volver al dashboard
  useEffect(() => {
    if (status === "idle") navigate("/dashboard");
  }, [status]);

  const handleClick = (index) => {
    if (!isMyTurn || board[index] !== "" || status !== "playing") return;
    playMove(index);
  };

  const handleBackToDashboard = () => {
    resetGame();
    navigate("/dashboard");
  };

  // Determinar mensaje de resultado
  const getResultMessage = () => {
    if (result === "draw") return "Empate!";
    if (winnerId === user?.id) return "Ganaste!";
    return "Perdiste!";
  };

  return (
    <Box className="game-container">
      <Paper className="game-card">
        {/* Info de la partida */}
        <Typography variant="h5" gutterBottom>
          Vos ({mySymbol}) vs {opponent}
        </Typography>

        {status === "playing" && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {isMyTurn ? "Tu turno" : "Turno del oponente..."}
          </Typography>
        )}

        {/* Tablero */}
        <Box className="board">
          {board.map((cell, index) => (
            <Box
              key={index}
              className={`cell ${isMyTurn && cell === "" && status === "playing" ? "clickable" : ""}`}
              onClick={() => handleClick(index)}
            >
              <Typography variant="h3" className={`symbol ${cell === "X" ? "symbol-x" : "symbol-o"}`}>
                {cell}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Resultado */}
        {status === "finished" && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={winnerId === user?.id ? "success" : result === "draw" ? "info" : "error"}>
              {getResultMessage()}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleBackToDashboard}
            >
              Volver al Lobby
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}