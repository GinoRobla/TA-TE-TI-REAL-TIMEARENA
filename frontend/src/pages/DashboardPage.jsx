import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Avatar, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip,
} from "@mui/material";
import useAuthStore from "../stores/authStore";
import ErrorModal from "../components/ErrorModal";
import useGameStore from "../stores/gameStore";
import api from "../api/axios";
import logoSnoop from "../assets/boton-snoop.png";
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
      <Paper className="dashboard-card profile-card">
        <Avatar src={user?.avatar} className="profile-avatar" />
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
          {user?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleLogout}
          className="logout-btn"
        >
          Cerrar sesión
        </Button>
      </Paper>

      <ErrorModal message={error} onClose={() => setError(null)} />

      {/* Stats */}
      {stats && (
        <Paper className="dashboard-card">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Estadísticas
          </Typography>
          <Box className="stats-section">
            <Box className="stat-item stat-win">
              <Typography variant="h3">{stats.wins}</Typography>
              <Typography variant="body2">Ganadas</Typography>
            </Box>
            <Box className="stat-item stat-loss">
              <Typography variant="h3">{stats.losses}</Typography>
              <Typography variant="body2">Perdidas</Typography>
            </Box>
            <Box className="stat-item stat-draw">
              <Typography variant="h3">{stats.draws}</Typography>
              <Typography variant="body2">Empates</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Buscar partida */}
      <Box className="find-match-section">
        {status === "waiting" ? (
          <img src={logoSnoop} alt="Buscando..." className="find-match-spinner" />
        ) : (
          <Button
            variant="contained"
            className="find-match-btn"
            onClick={handleFindMatch}
          >
            Buscar Partida
          </Button>
        )}
      </Box>

      {/* Historial */}
      {stats?.match_history?.length > 0 && (
        <Paper className="dashboard-card">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Historial
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Oponente</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Resultado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.match_history.map((match, index) => (
                  <TableRow key={index}>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={match.result}
                        size="small"
                        color={
                          match.result === "WIN" ? "success" :
                          match.result === "LOSS" ? "error" : "default"
                        }
                        variant={match.result === "DRAW" ? "outlined" : "filled"}
                      />
                    </TableCell>
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