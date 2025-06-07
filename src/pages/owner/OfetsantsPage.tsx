import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Waiter {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface Order {
  id: string;
  total: number;
  createdAt: string;
}

export default function WaitersPage() {
  const { restaurantId } = useAuthStore();
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: waiters = [], isLoading } = useQuery<Waiter[]>({
    queryKey: ["waiters"],
    queryFn: async () =>
      (await api.get(`/user?restaurantId=${restaurantId}&role=WAITER`)).data,
    select: (data) => data.filter((u) => u.role === "WAITER"),
  });

  const filteredWaiters = waiters.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const closeModal = () => {
    setSelectedWaiter(null);
    setOrders([]);
  };

  const totalSum = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <motion.div
      className="p-4 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Ofitsantlar</h2>

      <Input
        placeholder="Ofitsant bo‘yicha qidiruv..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
      ) : (
        <div className="space-y-2">
          {filteredWaiters.map((waiter) => (
            <motion.div
              key={waiter.id}
              className="border rounded-lg p-3 flex justify-between items-center"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="font-medium">{waiter.name}</div>
                <div className="text-sm text-muted-foreground">
                  {waiter.phone}
                </div>
              </div>
              <Button
                className="bg-[#F7374F] text-white"
                onClick={() => navigate(`/owner/waiters/${waiter.id}`)}
              >
                Buyurtmalar
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedWaiter} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWaiter?.name} — Bugungi buyurtmalar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {orders.map((order) => (
              <div key={order.id} className="border p-2 rounded-md">
                Buyurtma #{order.id.slice(-4)} — {order.total} so‘m
              </div>
            ))}
          </div>

          <div className="mt-4 text-lg font-semibold">
            Umumiy: {totalSum} so‘m
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
