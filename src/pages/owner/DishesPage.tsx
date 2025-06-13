"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export default function CategoryMenuPage() {
  type Dish = {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    image?: string;
  };

  type Category = {
    id: string;
    name: string;
    image?: string;
  };

  const { restaurantId } = useAuthStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const queryClient = useQueryClient();

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
      image?: string;
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
      toast.success(`Taom ${editDish ? "tahrirlandi" : "qo‘shildi"}`);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      setForm({ name: "", price: "" });
      setSelectedCategory("");
      setImageFile(null);
      setEditDish(null);
      setOpen(false);
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-id"));
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0.1,
      }
    );

    categories.forEach((cat) => {
      const section = sectionRefs.current[cat.id];
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (id: string) => {
    const section = sectionRefs.current[id];
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Kategoriya tanlanmagan");
      return;
    }

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
      price: parseInt(form.price),
      categoryId: selectedCategory,
      image: imageUrl,
    });
  };

  return (
    <div className="p-4 space-y-6 overflow-auto">
      <div className="sticky top-0 z-40 bg-white py-2 space-y-2">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Taom nomi bo‘yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#F7374F] text-white"
          >
            + Yangi taom
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto border-b pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`flex flex-col items-center min-w-[80px] cursor-pointer p-2 rounded-xl transition border font-semibold text-sm ${
                activeCategory === cat.id
                  ? "bg-[#F7374F] text-white shadow"
                  : "bg-white text-black"
              }`}
            >
              {cat.image && (
                <img
                  src={`https://devtools.uz/file/${cat.image}`}
                  alt={cat.name}
                  className="w-10 h-10 object-contain mb-1"
                />
              )}
              <span className="text-xs text-center font-semibold truncate w-full">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <div
            key={cat.id}
            data-id={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
          >
            <h2 className="text-xl font-bold text-[#F7374F] mb-4">
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered
                .filter((dish) => dish.categoryId === cat.id)
                .map((dish) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl bg-[#F7374F] text-white overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    {dish.image && (
                      <img
                        src={`https://devtools.uz/file/${dish.image}`}
                        alt={dish.name}
                        className="w-full h-32 object-cover hover:brightness-110 transition duration-300"
                      />
                    )}
                    <div className="p-3 text-sm">
                      <div className="font-semibold text-base truncate">
                        {dish.name}
                      </div>
                      <div className="text-white/80 mb-3">
                        {dish.price.toLocaleString()} so'm
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-white/20">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-white/10 focus:outline-none focus:ring-0"
                        onClick={() => {
                          setForm({
                            name: dish.name,
                            price: String(dish.price),
                          });
                          setSelectedCategory(dish.categoryId);
                          setEditDish(dish);
                          setOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-white/10 focus:outline-none focus:ring-0"
                        onClick={() => deleteMutation.mutate(dish.id)}
                      >
                        <Trash2 size={16} className="text-white" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editDish ? "Tahrirlash" : "Yangi taom qo‘shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Taom nomi</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className=" selection:bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <Label>Narxi</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="focus:outline-none focus:ring-0"
              />
            </div>
            <div className="space-y-1">
              <Label>Kategoriya</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none"
              >
                <option value="">Tanlang</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Rasm</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
                className="focus:outline-none focus:ring-0"
              />
            </div>
            <Button type="submit" className="bg-[#F7374F] text-white w-full">
              {editDish ? "Saqlash" : "Qo‘shish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
