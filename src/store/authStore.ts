import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  token: string | null;
  role: string | null;
  restaurantId: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  setRestaurantId: (id: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      restaurantId: null,
      user: null,

      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setRestaurantId: (id) => set({ restaurantId: id }),
      setUser: (user) => set({ user }),

      logout: () =>
        set({
          token: null,
          role: null,
          restaurantId: null,
          user: null,
        }),
    }),
    {
      name: "auth-storage", // localStorage kaliti
    }
  )
);

export default useAuthStore;
