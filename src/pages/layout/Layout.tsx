import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import useAuthStore from "@/store/authStore";

const Layout = () => {
  const { role } = useAuthStore();
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-50 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
