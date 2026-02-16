import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set) => ({
      // Estado
      token: null,
      user: null,

      // Acciones
      login: async (googleToken) => {
        const response = await api.post("/auth/google", { token: googleToken });
        set({ token: response.data.token, user: response.data.user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    { name: "auth-storage" } // nombre de la key en localStorage
  )
);

export default useAuthStore;