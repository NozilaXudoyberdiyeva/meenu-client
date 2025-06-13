import { useCartStore } from "../../store/cartStore";
import { motion } from "framer-motion";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import useAuthStore from "../../store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, addToCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState("");

  const auth = useAuthStore();
  const restaurantId = auth.restaurantId;
  const token = auth.token;

  const decodeToken = (token: string): { id: string } | null => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return { id: decoded.id };
    } catch {
      return null;
    }
  };

  const userId = decodeToken(token || "")?.id;
  console.log(userId);

  const decreaseQty = (id: string) => {
    const item = cart.find((d) => d.id === id);
    if (item && item.quantity > 1) {
      removeFromCart(id);
      addToCart({ ...item, quantity: item.quantity - 2 });
    } else {
      removeFromCart(id);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (!userId || !restaurantId) {
      toast.error("Foydalanuvchi yoki restoran aniqlanmadi");
      return;
    }

    if (!table.trim()) {
      toast.error("Buyurtma nomini kiriting");
      return;
    }

    setLoading(true);
    try {
      await api.post("/order", {
        restaurantId,
        userId,
        table,
        orderItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      toast.success("Buyurtma muvaffaqiyatli yuborildi!");
      clearCart();
      setTable("");
      setOpen(false);
    } catch (error) {
      toast.error("Buyurtma yuborishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">🛒 Savat</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Savat bo‘sh.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between border rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.price} so'm × {item.quantity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="text-white px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F7374F" }}
                >
                  –
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="text-white px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F7374F" }}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-white px-3 py-1 rounded-xl"
                  style={{ backgroundColor: "#F7374F" }}
                >
                  ❌
                </button>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between font-semibold text-lg border-t pt-4">
            <span>Umumiy:</span>
            <span>{total} so'm</span>
          </div>

          <button
            onClick={() => setOpen(true)}
            disabled={loading}
            className="w-full py-3 text-white text-lg font-semibold rounded-xl"
            style={{ backgroundColor: "#F7374F" }}
          >
            Buyurtma berish
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zakaz nomini kiriting</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Masalan: Stol 4 yoki Shirinliklar"
                value={table}
                onChange={(e) => setTable(e.target.value)}
              />
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="mt-4 w-full py-2 rounded-xl text-white font-semibold"
                style={{ backgroundColor: "#F7374F" }}
              >
                {loading ? "Yuborilmoqda..." : "Tasdiqlash"}
              </button>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
