import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./pages/layout/Layout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import DishesPage from "./pages/owner/DishesPage";
import EmployeesPage from "./pages/owner/EmployeesPage";
import WaitersPage from "./pages/owner/OfetsantsPage";
import CategoriesPage from "./pages/owner/Categories";
import MenuPage from "./pages/waiter/MenuPage";
import CartPage from "./pages/waiter/CartPage";
import CashierDashboard from "./pages/casher/CasherDashboard";
import CashierOrders from "./pages/casher/CasherOrder";
import WaiterSalaryPage from "./pages/waiter/WaiterSalary";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRole="owner" />}>
        <Route element={<Layout />}>
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/meals" element={<DishesPage />} />
          <Route path="/owner/employeers" element={<EmployeesPage />} />
          <Route path="/owner/waiters" element={<WaitersPage />} />
          <Route path="/owner/waiters/:orders" element={<h1>Orders</h1>} />
          <Route path="/owner/categories" element={<CategoriesPage />} />
          <Route path="/owner/stats" element={<div>Statistika</div>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="waiter" />}>
        <Route element={<Layout />}>
          <Route path="/waiter" element={<MenuPage />} />
          <Route path="/waiter/cart" element={<CartPage />} />
          <Route path="/waiter/salary" element={<WaiterSalaryPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="casher" />}>
        <Route element={<Layout />}>
          <Route path="/cashier" element={<CashierDashboard />} />
          <Route path="/cashier/payments" element={<div>To‘lovlar</div>} />
          <Route path="/cashier/orders" element={<CashierOrders />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
