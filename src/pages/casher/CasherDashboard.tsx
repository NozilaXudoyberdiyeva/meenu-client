import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Restaurant {
  income: number;
  outcome: number;
  balance: number;
}

interface Withdraw {
  id: string;
  amount: number;
  createdAt: string;
}

export default function CashierDashboard() {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [summary, setSummary] = useState<Restaurant | null>(null);
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [restaurantRes, withdrawRes] = await Promise.all([
        api.get(`/restaurant/${restaurantId}`),
        api.get(`/withdraw?restaurantId=${restaurantId}`),
      ]);
      setSummary(restaurantRes.data);
      setWithdraws(withdrawRes.data);
    } catch (err) {
      console.error("Dashboard xatosi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithdraw = async () => {
    try {
      if (editingId) {
        await api.patch(`/withdraw/${editingId}`, {
          amount: parseInt(amount),
        });
      } else {
        await api.post("/withdraw", {
          amount: parseInt(amount),
          restaurantId,
          type: "EXPENSE",
        });
      }
      toast.success("Chiqim muvaffaqiyatli saqlandi");
      setAmount("");
      setEditingId(null);
      setModalOpen(false);
      fetchDashboard();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Xatolik yuz berdi";
      console.error("Chiqim saqlashda xatolik:", message);
      toast.error(message);
    }
  };

  const openEditModal = (withdraw: Withdraw) => {
    setEditingId(withdraw.id);
    setAmount(String(withdraw.amount));
    setModalOpen(true);
  };

  useEffect(() => {
    if (restaurantId) fetchDashboard();
  }, [restaurantId]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📊 Bugungi Dashboard</h2>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow border">
                <p className="text-gray-500">Kirim</p>
                <p className="text-xl font-bold text-green-600">
                  {summary.income.toLocaleString()} so'm
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <p className="text-gray-500">Chiqim</p>
                <p className="text-xl font-bold text-red-500">
                  {summary.outcome.toLocaleString()} so'm
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <p className="text-gray-500">Balans</p>
                <p className="text-xl font-bold">
                  {summary.balance.toLocaleString()} so'm
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <h3 className="text-xl font-semibold">💸 Chiqimlar (Withdraw)</h3>
            <Button
              onClick={() => {
                setModalOpen(true);
                setEditingId(null);
                setAmount("");
              }}
              className="bg-[#F7374F] text-white"
            >
              + Chiqim qo‘shish
            </Button>
          </div>

          <div className="space-y-4">
            {withdraws.map((w) => (
              <div
                key={w.id}
                className="flex justify-between items-center border p-4 rounded-xl shadow-sm bg-white"
              >
                <div>
                  <p className="font-semibold">
                    {w.amount.toLocaleString()} so'm
                  </p>
                  <p className="text-gray-500 text-sm">
                    {format(new Date(w.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                <Button variant="outline" onClick={() => openEditModal(w)}>
                  Tahrirlash
                </Button>
              </div>
            ))}
            {withdraws.length === 0 && (
              <p className="text-gray-400">Bugungi chiqimlar mavjud emas.</p>
            )}
          </div>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Chiqimni tahrirlash" : "Chiqim qo‘shish"}
                </DialogTitle>
              </DialogHeader>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Chiqim summasi"
              />
              <Button
                className="mt-4 w-full bg-[#F7374F] text-white"
                onClick={handleSubmitWithdraw}
              >
                Saqlash
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
