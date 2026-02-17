import { Box, Typography, Paper, Alert } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../stores/authStore";
import logo from "../assets/logo-snoop.png";
import "./LoginPage.css";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential);
      navigate("/dashboard");
    } catch {
      setError("Error al iniciar sesión");
    }
  };

  return (
    <Box className="login-container">
      <Paper elevation={3} className="login-card">
        <img src={logo} alt="Snoop Consulting" className="login-logo" />

        <Typography variant="h4" gutterBottom>
          Ta-Te-Ti Arena
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Jugá en tiempo real contra otros jugadores
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Error con Google")}
        />
      </Paper>
    </Box>
  );
}