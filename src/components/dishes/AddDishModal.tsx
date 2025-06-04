// src/components/dishes/AddDishModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";

interface AddDishModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  categories: { id: string; name: string }[];
}

export default function AddDishModal({
  open,
  setOpen,
  categories,
}: AddDishModalProps) {
  const { register, handleSubmit, reset } = useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const queryClient = useQueryClient();
  const { restaurantId } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: string;
      categoryId: string;
    }) => {
      return await api.post("/product", {
        ...data,
        restaurantId,
      });
    },
    onSuccess: () => {
      toast.success("Taom muvaffaqiyatli qo'shildi", {
        style: { backgroundColor: "#F7374F", color: "#fff" },
      });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      setOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Xatolik yuz berdi", {
        style: { backgroundColor: "#F7374F", color: "#fff" },
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!selectedCategory) {
      toast.error("Iltimos, kategoriya tanlang");
      return;
    }

    mutation.mutate({
      name: data.name,
      price: data.price,
      categoryId: selectedCategory,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi taom qo'shish</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Taom nomi</Label>
            <Input {...register("name")} placeholder="Masalan: Lag'mon" />
          </div>

          <div>
            <Label>Narxi</Label>
            <Input type="number" {...register("price")} placeholder="10000" />
          </div>

          <div>
            <Label>Kategoriya</Label>
            <Select onValueChange={(val) => setSelectedCategory(val)}>
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
            Qo‘shish
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
