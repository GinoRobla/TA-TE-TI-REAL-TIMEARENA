import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Avatar, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert,
} from "@mui/material";
import useAuthStore from "../stores/authStore";
import useGameStore from "../stores/gameStore";
import api from "../api/axios";
import "./DashboardPage.css";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const status = useGameStore((state) => state.status);
  const connectSocket = useGameStore((state) => state.connectSocket);
  const findMatch = useGameStore((state) => state.findMatch);

  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Cargar stats al entrar
  useEffect(() => {
    api.get("/profile/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Error al cargar estadísticas"));
  }, []);

  // Conectar socket al entrar
  useEffect(() => {
    if (token) connectSocket(token);
  }, [token]);

  // Cuando se encuentra partida, ir al juego
  useEffect(() => {
    if (status === "playing") navigate("/game");
  }, [status]);

  const handleFindMatch = () => {
    findMatch();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box className="dashboard-container">
      {/* Perfil */}
      <Paper className="dashboard-card">
        <Box className="profile-section">
          <Avatar src={user?.avatar} sx={{ width: 64, height: 64 }} />
          <Box>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ ml: "auto" }}>
            Salir
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      {stats && (
        <Paper className="dashboard-card">
          <Typography variant="h6" gutterBottom>Estadísticas</Typography>
          <Box className="stats-section">
            <Box className="stat-item">
              <Typography variant="h4">{stats.wins}</Typography>
              <Typography variant="body2">Ganadas</Typography>
            </Box>
            <Box className="stat-item">
              <Typography variant="h4">{stats.losses}</Typography>
              <Typography variant="body2">Perdidas</Typography>
            </Box>
            <Box className="stat-item">
              <Typography variant="h4">{stats.draws}</Typography>
              <Typography variant="body2">Empates</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Buscar partida */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleFindMatch}
        disabled={status === "waiting"}
        sx={{ mt: 2, mb: 2 }}
      >
        {status === "waiting" ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
            Esperando oponente...
          </>
        ) : (
          "Buscar Partida"
        )}
      </Button>

      {/* Historial */}
      {stats?.match_history?.length > 0 && (
        <Paper className="dashboard-card">
          <Typography variant="h6" gutterBottom>Historial</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Oponente</TableCell>
                  <TableCell>Resultado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.match_history.map((match, index) => (
                  <TableRow key={index}>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell>{match.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
