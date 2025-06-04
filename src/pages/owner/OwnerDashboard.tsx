import { useFinanceStats } from "@/hooks/useFinanceStats";
import { motion } from "framer-motion";

const OwnerDashboard = () => {
  const { data, isLoading } = useFinanceStats();

  if (isLoading) return <p>Yuklanmoqda...</p>;

  const format = (value?: number) =>
    value ? value.toLocaleString("uz-UZ") + " so‘m" : "0 so‘m";

  return (
    <div className="p-4">
      <motion.div
        className="relative overflow-hidden text-center rounded-2xl bg-gradient-to-r from-[#F7374F] to-pink-500 text-white shadow-lg p-6 space-y-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Blurli orqa fonlar */}
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="absolute top-2 right-4 text-[120px] font-extrabold opacity-10 select-none leading-none">
          ₩
        </div>

        {/* Asosiy kontent */}
        <h2 className="text-sm uppercase tracking-wider font-medium">
          Umumiy balans
        </h2>
        <p className="text-4xl font-bold">{format(data?.profit)}</p>

        {/* Kirim | Chiqim | Foyda — bitta qatorda */}
        <div className="mt-4 text-sm flex justify-center flex-wrap gap-x-6 gap-y-2">
          <span>
            Kirim: <strong>{format(data?.income)}</strong>
          </span>
          <span>
            Chiqim: <strong>{format(data?.expense)}</strong>
          </span>
          <span>
            Foyda: <strong>{format(data?.profit)}</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerDashboard;
