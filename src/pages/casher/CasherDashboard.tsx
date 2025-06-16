import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";

interface Restaurant {
  income: number;
  outcome: number;
  balance: number;
}

export default function CashierDashboard() {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [summary, setSummary] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [restaurantRes] = await Promise.all([
        api.get(`/restaurant/${restaurantId}`),
        api.get(`/withdraw?restaurantId=${restaurantId}`),
      ]);
      setSummary(restaurantRes.data);
    } catch (err) {
      console.error("Dashboard xatosi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchDashboard();
  }, [restaurantId]);

  return (
    <div className="p-6 space-y-6">
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
        </>
      )}
    </div>
  );
}
