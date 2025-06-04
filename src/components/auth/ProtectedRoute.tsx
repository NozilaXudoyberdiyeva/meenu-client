import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";

export default function ProtectedRoute({
  allowedRole,
}: {
  allowedRole: string;
}) {
  const { token, role } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to="/login" replace />;

  return <Outlet />;
}
