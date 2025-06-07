import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  total: number;
  createdAt: string;
  waiterId: string;
}

export default function WaiterOrdersPage() {
  const { id } = useParams(); // waiterId
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/order")).data,
  });

  const today = new Date().toISOString().split("T")[0];

  const orders = allOrders.filter((order) => {
    if (order.waiterId !== id) return false;
    const orderDate = order.createdAt.split("T")[0];

    if (dateFrom && dateTo) {
      return orderDate >= dateFrom && orderDate <= dateTo;
    } else if (dateFrom) {
      return orderDate === dateFrom;
    } else {
      return orderDate === today;
    }
  });

  const totalSum = orders.reduce((sum, o) => sum + o.total, 0);

  if (isLoading) return <div className="p-4">Yuklanmoqda...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ofitsant buyurtmalari</h2>

      <div className="flex gap-4 mb-4">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        {orders.map((order) => (
          <div key={order.id} className="border p-3 rounded-lg">
            Buyurtma #{order.id.slice(-4)} — {order.total} so‘m
          </div>
        ))}

        <div className="font-bold mt-4">Umumiy: {totalSum} so‘m</div>
      </motion.div>
    </div>
  );
}
