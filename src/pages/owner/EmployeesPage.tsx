import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";
import { Pencil, Trash2 } from "lucide-react";
import type { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export default function EmployeesPage() {
  const { restaurantId } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    role: "WAITER",
  });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["employees"],
    queryFn: async () =>
      (await api.get(`/user?restaurantId=${restaurantId}`)).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await api.post("/user", {
        ...form,
        restaurantId,
      });
    },
    onSuccess: () => {
      toast.success("Yangi ishchi qo'shildi");
      setForm({ name: "", phone: "", password: "", role: "WAITER" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setModalOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Create user error:", error);
      console.log(error?.response?.data?.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editUser) return;
      return await api.patch(`/user/${editUser.id}`, {
        name: form.name,
        phone: form.phone,
        password: form.password || undefined,
        role: form.role,
      });
    },
    onSuccess: () => {
      toast.success("Ishchi ma'lumotlari yangilandi");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditUser(null);
      setForm({ name: "", phone: "", password: "", role: "WAITER" });
      setModalOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Update user error:", error);
      toast.error(
        error?.response?.data?.message || "Yangilashda xatolik yuz berdi",
        {
          style: { backgroundColor: "#F7374F", color: "#fff" },
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/user/${id}`);
    },
    onSuccess: () => {
      toast.success("Ishchi o‘chirildi");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Delete user error:", error);
      toast.error(
        error?.response?.data?.message || "O‘chirishda xatolik yuz berdi",
        {
          style: { backgroundColor: "#F7374F", color: "#fff" },
        }
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editUser) updateMutation.mutate();
    else createMutation.mutate();
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name,
        phone: editUser.phone,
        password: "",
        role: editUser.role,
      });
      setModalOpen(true);
    }
  }, [editUser]);

  return (
    <motion.div
      className="p-4 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Ishchilarni boshqarish</h2>

      <Button
        onClick={() => {
          setEditUser(null);
          setForm({ name: "", phone: "", password: "", role: "WAITER" });
          setModalOpen(true);
        }}
        className="mb-4 bg-[#F7374F] text-white"
      >
        + Yangi ishchi
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editUser ? "Ishchini tahrirlash" : "Yangi ishchi qo‘shish"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="F.I.Sh"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Telefon raqam"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Parol"
              value={form.password}
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <Select
              value={form.role}
              onValueChange={(val) => setForm({ ...form, role: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAITER">Afitsant</SelectItem>
                <SelectItem value="CASHIER">Kassir</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full bg-[#F7374F] text-white">
              {editUser ? "Tahrirlash" : "Qo‘shish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Input
        placeholder="Ishchi bo‘yicha qidiruv..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <h3 className="text-xl font-semibold mb-2">Ishchilar ro‘yxati</h3>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#F7374F]" size={32} />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              className="border rounded-lg p-3 flex justify-between items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F7374F]">
                  {user.role}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditUser(user)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(user.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
