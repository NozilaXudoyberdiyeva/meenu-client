
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  role: string | null;
  restaurantId: string | null;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  setRestaurantId: (id: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      restaurantId: null,

      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setRestaurantId: (id) => set({ restaurantId: id }),

      logout: () => set({ token: null, role: null, restaurantId: null }),
    }),
    {
      name: "auth-storage", // localStorage kaliti
    }
  )
);

export default useAuthStore;
