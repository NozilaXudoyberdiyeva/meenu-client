import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import logo from "../../assets/images/meenulogo.png";

export const Sidebar = () => {
  const { role, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems = {
    owner: [
      { name: "Dashboard", path: "/owner" },
      { name: "Taomlar", path: "/owner/meals" },
      { name: "Ishchilar", path: "/owner/employeers" },
      { name: "Ofitsantlar", path: "/owner/waiters" },
      { name: "Statistika", path: "/owner/stats" },
    ],
    waiter: [
      { name: "Menyu", path: "/waiter/menu" },
      { name: "Savat", path: "/waiter/cart" },
      { name: "Maosh", path: "/waiter/salary" },
    ],
    cashier: [
      { name: "Buyurtmalar", path: "/cashier/orders" },
      { name: "To‘lovlar", path: "/cashier/payments" },
    ],
  }[role || "waiter"];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobil sidebar */}
      <div className="md:hidden p-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="flex flex-col" variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 bg-[#F7374F] text-white p-4"
          >
            <img className="text-white" src={logo} alt="logo" />
            <nav className="space-y-2">
              {menuItems?.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start text-white ${
                    location.pathname === item.path ? "bg-white/20" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </nav>
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={handleLogout}
            >
              Chiqish
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex w-60 flex-col bg-[#F7374F] text-white p-4 min-h-screen space-y-4">
        <img src={logo} alt="" />
        <nav className="space-y-2">
          {menuItems?.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start text-white ${
                location.pathname === item.path ? "bg-white/20" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </Button>
          ))}
        </nav>
        <Button
          variant="secondary"
          className="w-full mt-auto"
          onClick={handleLogout}
        >
          Chiqish
        </Button>
      </aside>
    </>
  );
};
