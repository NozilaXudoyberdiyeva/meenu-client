import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";

const OwnerDashboard = () => {
  const { restaurantId } = useAuthStore();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurant"],
    queryFn: async () => (await api.get("/restaurant")).data,
    enabled: !!restaurantId,
  });

  const restaurant = restaurants.find((r: any) => r.id === restaurantId);

  const format = (value?: number) =>
    value ? value.toLocaleString("uz-UZ") + " so‘m" : "0 so‘m";

  if (isLoading) return <p>Yuklanmoqda...</p>;

  return (
    <div className="p-4">
      <motion.div
        className="relative overflow-hidden text-center rounded-2xl bg-gradient-to-r from-[#F7374F] to-pink-500 text-white shadow-lg p-6 space-y-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="absolute top-2 right-4 text-[120px] font-extrabold opacity-10 select-none leading-none">
          ₩
        </div>

        <h2 className="text-sm uppercase tracking-wider font-medium">
          Umumiy balans
        </h2>
        <p className="text-4xl font-bold">{format(restaurant?.balance)}</p>

        <div className="mt-4 text-sm flex justify-center flex-wrap gap-x-6 gap-y-2">
          <span>
            Kirim: <strong>{format(restaurant?.income)}</strong>
          </span>
          <span>
            Chiqim: <strong>{format(restaurant?.outcome)}</strong>
          </span>
          <span>
            Foyda: <strong>{format(restaurant?.balance)}</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerDashboard;
