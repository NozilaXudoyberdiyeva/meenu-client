import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Dish {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default function WaiterMenuPage() {
  const { cart, addToCart, decrementFromCart } = useCartStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/category")).data,
  });

  const { data: dishes = [] } = useQuery<Dish[]>({
    queryKey: ["dishes"],
    queryFn: async () => (await api.get("/product")).data,
  });

  const filtered = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  const getQuantity = (id: string) => {
    return cart.find((item) => item.id === id)?.quantity || 0;
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");
          if (entry.isIntersecting && id) {
            setActiveCategory(id);
          }
        });
      },
      {
        root: container,
        threshold: 0.4,
        rootMargin: "-20% 0px -60% 0px",
      }
    );

    categories.forEach((cat) => {
      const section = sectionRefs.current[cat.id];
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (id: string) => {
    const section = sectionRefs.current[id];
    const container = containerRef.current;
    const offset = 200;
    if (section && container) {
      const sectionTop = section.offsetTop;
      container.scrollTo({
        top: sectionTop - offset,
        behavior: "smooth",
      });
      setActiveCategory(id);
    }
  };

  return (
    <div ref={containerRef} className="p-0 space-y-6 overflow-y-auto h-[100vh]">
      <div className="sticky top-0 z-40 backdrop-blur-md py-2 space-y-2">
        <div className="flex justify-between items-center px-4">
          <Input
            placeholder="Taom nomi bo‘yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/waiter/cart")}
          >
            <ShoppingCart size={28} color="#F7374F" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F7374F] text-white text-xs font-bold rounded-full px-2 py-0.5">
                {itemCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto border-b pb-2 scrollbar-hide px-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`flex flex-col items-center min-w-[80px] cursor-pointer p-2 rounded-xl transition border font-semibold text-sm ${
                activeCategory === cat.id
                  ? "bg-[#F7374F] text-white shadow"
                  : "bg-white text-black"
              }`}
            >
              {cat.image && (
                <img
                  src={`https://devtools.uz/file/${cat.image}`}
                  alt={cat.name}
                  className="w-10 h-10 object-contain mb-1"
                />
              )}
              <span className="text-xs text-center font-semibold truncate w-full">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-10 px-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            data-id={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
          >
            <h2 className="text-xl font-bold text-[#F7374F] mb-4">
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered
                .filter((dish) => dish.categoryId === cat.id)
                .map((dish) => {
                  const quantity = getQuantity(dish.id);
                  return (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl bg-[#F7374F] text-white overflow-hidden shadow-md hover:shadow-xl transition-all"
                    >
                      {dish.image && (
                        <img
                          src={`https://devtools.uz/file/${dish.image}`}
                          alt={dish.name}
                          className="w-full h-32 object-cover hover:brightness-110 transition duration-300"
                        />
                      )}
                      <div className="p-3 text-sm">
                        <div className="font-semibold text-base truncate">
                          {dish.name}
                        </div>
                        <div className="text-white/80 mb-3">
                          {dish.price.toLocaleString()} so'm
                        </div>
                        {quantity === 0 ? (
                          <Button
                            onClick={() =>
                              addToCart({
                                ...dish,
                                image: dish.image || "", // image undefined bo‘lsa ham stringga majbur bo‘ladi
                              })
                            }
                            className="w-full bg-white text-[#F7374F] font-bold"
                          >
                            Qo‘shish
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between mt-2">
                            <Button
                              onClick={() => decrementFromCart(dish.id)}
                              className="bg-white text-[#F7374F] text-lg font-bold px-3"
                            >
                              –
                            </Button>
                            <span className="text-lg font-semibold">
                              {quantity}
                            </span>
                            <Button
                              onClick={() =>
                                addToCart({
                                  ...dish,
                                  image: dish.image || "", // image undefined bo‘lsa ham stringga majbur bo‘ladi
                                })
                              }
                              className="bg-white text-[#F7374F] text-lg font-bold px-3"
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
