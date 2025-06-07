import { create } from "zustand";
import { persist } from "zustand/middleware";

type Dish = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
};

type CartDish = Dish & {
  quantity: number;
};

interface CartStore {
  cart: CartDish[];
  addToCart: (dish: Dish | CartDish) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (dish) =>
        set((state) => {
          const exists = state.cart.find((d) => d.id === dish.id);
          if (exists) {
            return {
              cart: state.cart.map((d) =>
                d.id === dish.id ? { ...d, quantity: d.quantity + 1 } : d
              ),
            };
          }
          return { cart: [...state.cart, { ...dish, quantity: 1 }] };
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((d) => d.id !== id),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
