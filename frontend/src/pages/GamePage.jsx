import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
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
  const winnerId = useGameStore((state) => state.winnerId);
  const playMove = useGameStore((state) => state.playMove);
  const resetGame = useGameStore((state) => state.resetGame);
  const leaveGame = useGameStore((state) => state.leaveGame);
  const messages = useGameStore((state) => state.messages);
  const sendMessage = useGameStore((state) => state.sendMessage);
  const opponentLeft = useGameStore((state) => state.opponentLeft);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // Si no hay partida en curso (ej: refresh), volver al dashboard
  useEffect(() => {
    if (status === "idle") navigate("/dashboard");
  }, [status]);

  // Advertencia del navegador si el usuario intenta recargar con partida activa
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === "playing") {
        e.preventDefault();
        // El texto no se muestra en navegadores modernos, pero el diálogo sí aparece
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClick = (index) => {
    // Bloquear si no es su turno, casilla ocupada, juego no activo, o el oponente se fue
    if (!isMyTurn || board[index] !== "" || status !== "playing" || opponentLeft) return;
    playMove(index);
  };

  const handleLeaveGame = () => {
    leaveGame();   // avisa al backend → backend notifica al oponente
    resetGame();
    navigate("/dashboard");
  };

  const handleBackToDashboard = () => {
    resetGame();
    navigate("/dashboard");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  const getResultMessage = () => {
    if (result === "draw") return "Empate!";
    if (winnerId === user?.id) return "Ganaste!";
    return "Perdiste!";
  };

  return (
    <Box className="game-container">
      {/* Header: título + botón salir */}
      <Box className="game-header">
        <Typography variant="h5" className="game-title">
          Vos ({mySymbol}) vs {opponent}
        </Typography>

        {status === "playing" && !opponentLeft && (
          <Button className="leave-btn" onClick={handleLeaveGame}>
            Salir
          </Button>
        )}
      </Box>

      {status === "playing" && !opponentLeft && (
        <Typography variant="body1" className="game-turn">
          {isMyTurn ? "Tu turno" : "Turno del oponente..."}
        </Typography>
      )}

      {/* Banner: oponente se fue */}
      {opponentLeft && (
        <Box className="opponent-left-banner">
          <Typography variant="body1" className="opponent-left-text">
            Tu oponente salió de la partida
          </Typography>
          <Button
            variant="contained"
            className="lobby-btn"
            onClick={handleBackToDashboard}
          >
            Volver al Lobby
          </Button>
        </Box>
      )}

      {/* Tablero */}
      <Box className="board">
        {board.map((cell, index) => (
          <Box
            key={index}
            className={`cell ${isMyTurn && cell === "" && status === "playing" && !opponentLeft ? "clickable" : ""}`}
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
        <Box className="game-result">
          <Typography variant="h4" className={`result-text ${
            result === "draw" ? "result-draw" :
            winnerId === user?.id ? "result-win" : "result-loss"
          }`}>
            {getResultMessage()}
          </Typography>
          <Button
            variant="contained"
            className="lobby-btn"
            onClick={handleBackToDashboard}
          >
            Volver al Lobby
          </Button>
        </Box>
      )}

      {/* Chat en tiempo real */}
      {(status === "playing" || status === "finished") && (
        <Box className="chat-container">
          <Box className="chat-messages">
            {messages.map((msg, i) => (
              <Typography key={i} variant="body2" className="chat-message">
                <span className="chat-sender">{msg.sender}:</span> {msg.text}
              </Typography>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Escribí un mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button className="chat-send-btn" onClick={handleSendMessage}>
              Enviar
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
