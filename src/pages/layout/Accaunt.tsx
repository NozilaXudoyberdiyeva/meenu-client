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
import { Pencil, Eye, EyeOff } from "lucide-react";

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editField, setEditField] = useState<"name" | "phone" | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleUpdateField = async () => {
    if (!user?.id || !editField) return;

    setLoading(true);
    try {
      const res = await api.patch(`/user/${user.id}`, {
        [editField]: editValue,
      });
      toast.success("Ma'lumot yangilandi");
      setUser(res.data);
      if (editField === "name") setName(editValue);
      if (editField === "phone") setPhone(editValue);
      setEditField(null);
      setEditValue("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.id || !oldPassword || !newPassword) {
      toast.error("Iltimos, barcha parol maydonlarini to‘ldiring");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`/user/${user.id}`, {
        oldPassword,
        newPassword,
      });
      toast.success("Parol muvaffaqiyatli yangilandi");
      setUser(res.data);
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">👤 Akkaunt</h2>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-sm text-gray-500">F.I.Sh</label>
          <Input value={name} disabled />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 mt-6 mr-1"
            onClick={() => {
              setEditField("name");
              setEditValue(name);
            }}
          >
            <Pencil size={16} />
          </Button>
        </div>
        <div className="relative">
          <label className="text-sm text-gray-500">Telefon raqam</label>
          <Input value={phone} disabled />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 mt-6 mr-1"
            onClick={() => {
              setEditField("phone");
              setEditValue(phone);
            }}
          >
            <Pencil size={16} />
          </Button>
        </div>
        <div>
          <label className="text-sm text-gray-500">Rol</label>
          <Input value={user?.role || ""} disabled />
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-semibold">🔐 Parolni o‘zgartirish</h3>
        <div className="relative">
          <Input
            type={showOldPassword ? "text" : "password"}
            placeholder="Eski parol"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <div
            onClick={() => setShowOldPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>
        <div className="relative">
          <Input
            type={showNewPassword ? "text" : "password"}
            placeholder="Yangi parol"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>
        <Button
          className="bg-[#F7374F] text-white w-full"
          onClick={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? "Yuborilmoqda..." : "Parolni yangilash"}
        </Button>
      </div>

      <Dialog open={!!editField} onOpenChange={() => setEditField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editField === "name" ? "F.I.Sh" : "Telefon raqam"}ni o‘zgartirish
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <Button
            className="w-full mt-4 bg-[#F7374F] text-white"
            onClick={handleUpdateField}
            disabled={loading}
          >
            {loading ? "Yuborilmoqda..." : "Yangilash"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
