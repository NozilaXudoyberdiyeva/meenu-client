import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

export default function AccountPage() {
  const { user, token } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [newLogin, setNewLogin] = useState(user?.username || "");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Iltimos, eski va yangi parolni kiriting");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Parol muvaffaqiyatli o‘zgartirildi");
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLogin = async () => {
    if (!newLogin.trim()) {
      toast.error("Yangi loginni kiriting");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-login", {
        newLogin,
      });
      toast.success("Login muvaffaqiyatli yangilandi");
      setUsername(newLogin);
      setLoginModalOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Loginni yangilashda xatolik"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">👤 Akkaunt</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">F.I.Sh</label>
          <Input value={name} disabled />
        </div>
        <div className="relative">
          <label className="text-sm text-gray-500">Login</label>
          <Input value={username} disabled />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 mt-6 mr-1"
            onClick={() => setLoginModalOpen(true)}
          >
            <Pencil size={16} />
          </Button>
        </div>
        <div>
          <label className="text-sm text-gray-500">Rol</label>
          <Input value={user?.role} disabled />
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-semibold">🔐 Parolni o‘zgartirish</h3>
        <Input
          type="password"
          placeholder="Eski parol"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Yangi parol"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          className="bg-[#F7374F] text-white w-full"
          onClick={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? "Yuborilmoqda..." : "Parolni yangilash"}
        </Button>
      </div>

      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loginni o‘zgartirish</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Yangi loginni kiriting"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
          />
          <Button
            className="w-full mt-4 bg-[#F7374F] text-white"
            onClick={handleUpdateLogin}
            disabled={loading}
          >
            {loading ? "Yuborilmoqda..." : "Yangilash"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
