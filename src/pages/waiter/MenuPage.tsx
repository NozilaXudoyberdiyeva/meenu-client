import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import api from "@/services/api";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Category = {
  id: string;
  name: string;
};

type Dish = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
};

export default function MenuPage() {
  const { cart, addToCart, removeFromCart } = useCartStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: categories = [], isLoading: loadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: () => api.get("/category").then((res) => res.data),
  });

  const { data: dishes = [], isLoading: loadingDishes } = useQuery<Dish[]>({
    queryKey: ["dishes"],
    queryFn: () => api.get("/product").then((res) => res.data),
  });

  if (loadingCategories || loadingDishes) return <p>Yuklanmoqda...</p>;

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categories.map((cat) => ({
    ...cat,
    dishes: filteredDishes.filter((dish) => dish.categoryId === cat.id),
  }));

  const getQuantity = (id: string) => {
    return cart.find((item) => item.id === id)?.quantity || 0;
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-6 space-y-10 relative">
      <div
        className="absolute top-0 right-0 z-10 cursor-pointer"
        onClick={() => navigate("/waiter/cart")}
      >
        <ShoppingCart size={28} color="#F7374F" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#F7374F] text-white text-xs font-bold rounded-full px-2 py-0.5">
            {itemCount}
          </span>
        )}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ovqat nomi bo‘yicha qidiring..."
        className="w-full p-2 border rounded-xl mb-6 mt-4 outline-none"
      />

      {grouped.map((category) => (
        <div key={category.id}>
          <h2 className="text-xl font-bold mb-2 text-[#F7374F]">
            🍽 {category.name}
          </h2>

          {category.dishes.length > 0 ? (
            <div className="space-y-2">
              {category.dishes.map((dish) => {
                const quantity = getQuantity(dish.id);
                return (
                  <motion.div
                    key={dish.id}
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 border rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-base font-semibold">{dish.name}</h3>
                        <p className="text-sm text-gray-500">
                          {dish.price} so'm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(dish)}
                          className="px-4 py-2 rounded-xl text-white font-medium"
                          style={{ backgroundColor: "#F7374F" }}
                        >
                          Qo‘shish
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            className="text-white px-3 py-1 rounded-full"
                            style={{ backgroundColor: "#F7374F" }}
                          >
                            –
                          </button>
                          <span>{quantity}</span>
                          <button
                            onClick={() => addToCart(dish)}
                            className="text-white px-3 py-1 rounded-full"
                            style={{ backgroundColor: "#F7374F" }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400 mb-4">
              Hech qanday taom topilmadi.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
