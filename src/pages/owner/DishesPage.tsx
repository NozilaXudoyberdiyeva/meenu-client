import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import type { AxiosError } from "axios";

export default function DishesPage() {
  type Dish = {
    id: string;
    name: string;
    price: number;
    categoryId: string;
  };
  type Category = {
    id: string;
    name: string;
  };

  const [open, setOpen] = useState(false);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", price: "" });
  const queryClient = useQueryClient();
  const { restaurantId } = useAuthStore();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/category")).data,
  });

  const { data: dishes = [] } = useQuery<Dish[]>({
    queryKey: ["dishes"],
    queryFn: async () => (await api.get("/product")).data,
  });

  const filtered = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      categoryId: string;
    }) => {
      if (editDish) {
        return await api.patch(`/product/${editDish.id}`, {
          ...data,
          restaurantId,
        });
      } else {
        return await api.post("/product", {
          ...data,
          restaurantId,
        });
      }
    },
    onSuccess: () => {
      toast.success(`Taom ${editDish ? "tahrirlandi" : "qo'shildi"}`);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      setOpen(false);
      setForm({ name: "", price: "" });
      setSelectedCategory("");
      setEditDish(null);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error?.response?.data?.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/product/${id}`),
    onSuccess: () => {
      toast.success("Taom o‘chirildi");
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });

  useEffect(() => {
    if (editDish) {
      setForm({ name: editDish.name, price: String(editDish.price) });
      setSelectedCategory(editDish.categoryId);
    } else {
      setForm({ name: "", price: "" });
      setSelectedCategory("");
    }
  }, [editDish]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Kategoriya tanlanmagan");
      return;
    }
    mutation.mutate({
      name: form.name,
      price: parseInt(form.price),
      categoryId: selectedCategory,
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Taomlar</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Taom nomi bo‘yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            onClick={() => {
              setEditDish(null);
              setOpen(true);
            }}
            className="bg-[#F7374F] text-white hover:opacity-90"
          >
            + Yangi taom
          </Button>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <motion.h2
            className="text-xl font-semibold mb-2 text-[#F7374F]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {cat.name}
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filtered
              .filter((dish) => dish.categoryId === cat.id)
              .map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border p-4"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Narxi: {dish.price} so'm
                  </p>
                  <div className="flex justify-end mt-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditDish(dish);
                        setOpen(true);
                      }}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(dish.id)}
                      className="text-red-500 border-red-300"
                    >
                      O‘chirish
                    </Button>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDish ? "Taomni tahrirlash" : "Yangi taom qo‘shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Taom nomi</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masalan: Lag'mon"
              />
            </div>
            <div>
              <Label>Narxi</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label>Kategoriya</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#F7374F] text-white hover:opacity-90"
            >
              {editDish ? "Saqlash" : "Qo‘shish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
