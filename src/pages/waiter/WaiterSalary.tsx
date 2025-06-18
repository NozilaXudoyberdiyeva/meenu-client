import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { motion } from "framer-motion";
import api from "@/services/api";

interface User {
  id: string;
  phone: string;
  balance: number;
}

export default function WaiterSalaryPage() {
  const { user } = useAuthStore(); // ✅ phone emas, user.phone ishlatiladi

  useEffect(() => {
    if (user?.phone) {
      localStorage.setItem("phone", user.phone);
    }
  }, [user]);

  const savedPhone = localStorage.getItem("phone") || "";

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/user")).data,
    enabled: !!savedPhone,
  });

  const currentUser = users.find((user) => user.phone === savedPhone);
  const balance = currentUser?.balance || 0;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Ofitsant maoshi</h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="font-bold mt-4 text-right">
          Joriy balans: {balance.toLocaleString()} so'm
        </div>
      </motion.div>
    </div>
  );
}
