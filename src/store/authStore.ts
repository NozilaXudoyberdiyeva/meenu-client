import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  role: string | null;
  restaurantId: string | null;
  phone: string | null;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  setRestaurantId: (id: string) => void;
  setPhone: (phone: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      restaurantId: null,
      phone: null,

      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setRestaurantId: (id) => set({ restaurantId: id }),
      setPhone: (phone) => set({ phone }),

      logout: () =>
        set({
          token: null,
          role: null,
          restaurantId: null,
          phone: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
