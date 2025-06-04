import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  phone: z.string().min(9, "Telefon raqami majburiy"),
  password: z.string().min(1, "Parol majburiy"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setToken, setRole, setRestaurantId } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await api.post("/user/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setRole(data.user.role);
      setRestaurantId(data.user.restaurantId);
      toast.success("Muvaffaqiyatli tizimga kirildi!");
      const role = data.user.role.toLowerCase();
      setRole(role);

      if (role === "owner") navigate("/owner");
      else if (role === "waiter") navigate("/waiter");
      else if (role === "cashier") navigate("/cashier");
    },
    onError: () => {
      toast.error("Login yoki parol xato!", {
        style: { backgroundColor: "#F7374F", color: "#fff" },
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-[#F7374F]">
            Tizimga kirish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="Telefon raqamingiz"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Parolingiz"
                {...register("password")}
              />
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#F7374F] text-white hover:opacity-90"
            >
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
