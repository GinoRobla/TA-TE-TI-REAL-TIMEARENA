import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: antes de cada request, inyecta el JWT en el header
api.interceptors.request.use((config) => {
  const state = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const token = state?.state?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;