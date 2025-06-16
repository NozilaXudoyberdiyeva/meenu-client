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
import { format } from "date-fns";

interface Entry {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  createdAt: string;
}

export default function CashierFinancePage() {
  const { restaurantId } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    type: "EXPENSE",
  });
  const [date, setDate] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = date
        ? `?restaurantId=${restaurantId}&date=${date}`
        : `?restaurantId=${restaurantId}`;
      const res = await api.get(`/withdraw${query}`);
      setEntries(
        res.data.sort(
          (a: Entry, b: Entry) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (e) {
      toast.error("Ma'lumotlarni olishda xatolik yuz berdi");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    try {
      await api.post("/withdraw", {
        ...form,
        amount: Number(form.amount),
        restaurantId,
      });
      toast.success("Kirim/chiqim qo‘shildi");
      setOpen(false);
      setForm({ amount: "", description: "", type: "EXPENSE" });
      fetchData();
    } catch (e) {
      toast.error("Qo‘shishda xatolik yuz berdi");
      console.log(e);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchData();
  }, [restaurantId, date]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">💰 Kirim / Chiqim</h2>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#F7374F] text-white"
        >
          + Yangi
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-fit"
        />
        <Button variant="outline" onClick={() => setDate("")}>
          Bugungi
        </Button>
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-400">Ma'lumotlar mavjud emas.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => (
            <div
              key={e.id}
              className={`p-4 rounded-xl border shadow-sm flex justify-between items-center ${
                e.type === "INCOME" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div>
                <p className="font-semibold">{e.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(e.createdAt), "yyyy-MM-dd HH:mm")}
                </p>
              </div>
              <p className="text-lg font-bold">
                {e.type === "INCOME" ? "+" : "-"}
                {e.amount.toLocaleString()} so‘m
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi kirim / chiqim</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            placeholder="Summa"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            placeholder="Izoh (masalan: mahsulot xaridi)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })
            }
            className="border p-2 rounded-lg"
          >
            <option value="INCOME">Kirim</option>
            <option value="EXPENSE">Chiqim</option>
          </select>
          <Button
            className="bg-[#F7374F] text-white w-full"
            onClick={handleAddEntry}
          >
            Saqlash
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
