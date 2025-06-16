import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import type { AxiosError } from "axios";
import { Pencil, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  image?: string;
};

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const { restaurantId } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/category")).data,
  });

  const mutation = useMutation({
    mutationFn: async (data: { name: string; image?: string }) => {
      if (editCategory) {
        return await api.patch(`/category/${editCategory.id}`, {
          ...data,
          restaurantId,
        });
      } else {
        return await api.post("/category", {
          ...data,
          restaurantId,
        });
      }
    },
    onSuccess: () => {
      toast.success(`Kategoriya ${editCategory ? "yangilandi" : "qo‘shildi"}`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ name: "" });
      setImageFile(null);
      setEditCategory(null);
      setOpen(false);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/category/${id}`),
    onSuccess: () => {
      toast.success("Kategoriya o‘chirildi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  useEffect(() => {
    if (editCategory) {
      setForm({ name: editCategory.name });
    } else {
      setForm({ name: "" });
    }
  }, [editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await api.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      imageUrl = res.data.filename;
    }

    mutation.mutate({
      name: form.name,
      image: imageUrl,
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Taomlar turlari</h2>
        <Button
          className="bg-[#F7374F] text-white"
          onClick={() => {
            setEditCategory(null);
            setOpen(true);
          }}
        >
          + Yangi kategoriya
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border p-4 rounded-xl shadow-sm bg-white space-y-2 flex flex-col"
          >
            {cat.image && (
              <div className="w-full aspect-[4/3] overflow-hidden rounded max-w-[250px] mx-auto sm:max-w-full">
                <img
                  src={`https://devtools.uz/file/${cat.image}`}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="text-lg font-medium">{cat.name}</h3>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditCategory(cat);
                  setOpen(true);
                }}
                className="hover:bg-[#F7374F]/10"
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-100"
                onClick={() => deleteMutation.mutate(cat.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nomi</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Rasm</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#F7374F] text-white hover:opacity-90"
            >
              {editCategory ? "Saqlash" : "Qo‘shish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
