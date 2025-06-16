import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Order {
  id: string;
  table: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "DEBT";
  total: number;
  createdAt: string;
  waiter: {
    name: string;
  };
}

export default function CashierOrders() {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/order?restaurantId=${restaurantId}`);
      const today = new Date().toISOString().slice(0, 10);
      const filtered = res.data
        .filter((order: Order) => {
          if (!filterDate) {
            return order.createdAt.startsWith(today);
          }
          return order.createdAt.startsWith(filterDate);
        })
        .sort((a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt));
      setOrders(filtered);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || "Xatolik yuz berdi";
      toast.error(message);
      console.error("Zakazlar yuklashda xatolik:", message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/order/${selectedOrder.id}`, { status: "COMPLETED" });
      await api.post("/withdraw", {
        restaurantId,
        amount: selectedOrder.total,
        type: "INCOME",
        orderId: selectedOrder.id,
      });
      toast.success("To‘lov tasdiqlandi");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      };
      console.error("Xatolik: ", err);
      if (err?.response?.status === 404) {
        toast.error("Withdraw endpoint topilmadi (404)");
      } else {
        const message = err?.response?.data?.message || "Xatolik yuz berdi";
        toast.error(message);
      }
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await api.patch(`/order/${id}`, { status: "CANCELLED" });
      toast.success("Zakaz bekor qilindi");
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || "Xatolik yuz berdi";
      toast.error(message);
      console.error("Bekor qilishda xatolik:", message);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchOrders();
  }, [restaurantId, filterDate]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📦 Zakazlar</h2>

      <div className="flex items-center gap-2">
        <label className="font-medium">Sana:</label>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center border p-4 rounded-xl shadow-sm bg-white"
            >
              <div>
                <p className="font-semibold">🍽 {order.table}</p>
                <p className="text-sm text-gray-500">
                  👤 {order.waiter?.name || "Afitsant"}
                </p>
                <p className="text-sm">
                  💵 {order.total.toLocaleString()} so'm
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    order.status === "COMPLETED"
                      ? "text-green-600"
                      : order.status === "CANCELLED"
                      ? "text-red-500"
                      : order.status === "DEBT"
                      ? "text-orange-500"
                      : "text-yellow-500"
                  }`}
                >
                  {order.status}
                </p>
              </div>
              {order.status === "PENDING" && (
                <div className="space-x-2">
                  <Button
                    className="bg-[#F7374F] text-white"
                    onClick={() => setSelectedOrder(order)}
                  >
                    To‘lov
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmCancelId(order.id)}
                  >
                    Bekor qilish
                  </Button>
                </div>
              )}
            </motion.div>
          ))}

          {orders.length === 0 && (
            <p className="text-gray-400">Hech qanday zakaz mavjud emas.</p>
          )}
        </div>
      )}

      {/* To‘lov modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To‘lovni tasdiqlash</DialogTitle>
          </DialogHeader>
          <Input readOnly value={selectedOrder?.table} className="mb-2" />
          <Input
            readOnly
            value={selectedOrder?.total + " so'm"}
            className="mb-2"
          />
          <Button
            className="bg-[#F7374F] text-white w-full"
            onClick={handleMarkPaid}
          >
            Tasdiqlash
          </Button>
        </DialogContent>
      </Dialog>

      {/* Bekor qilish modal */}
      <Dialog
        open={!!confirmCancelId}
        onOpenChange={() => setConfirmCancelId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Haqiqatan bekor qilmoqchimisiz?</DialogTitle>
          </DialogHeader>
          <Button
            className="bg-[#F7374F] text-white w-full"
            onClick={() => {
              if (confirmCancelId) handleCancelOrder(confirmCancelId);
              setConfirmCancelId(null);
            }}
          >
            Ha, bekor qilish
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
