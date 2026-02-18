import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GamePage from "./pages/GamePage";

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        {/* Si no hay token → login. Si hay token → dashboard */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/game" element={token ? <GamePage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;