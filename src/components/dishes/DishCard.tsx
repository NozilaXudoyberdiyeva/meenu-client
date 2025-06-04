import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{dish.name}</h3>
        <p className="text-sm text-gray-600">Narxi: {dish.price} so'm</p>

        <div className="flex justify-end mt-3 gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="border-gray-300"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="border-red-300 text-red-500"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
