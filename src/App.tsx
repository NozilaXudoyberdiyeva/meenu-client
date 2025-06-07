import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./pages/layout/Layout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import DishesPage from "./pages/owner/DishesPage";
import EmployeesPage from "./pages/owner/EmployeesPage";
import WaitersPage from "./pages/owner/OfetsantsPage";
import WaiterOrdersPage from "./pages/owner/OfetsantOrderPage";
import CategoriesPage from "./pages/owner/Categories";

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
          <Route path="/owner/waiters/:orders" element={<WaiterOrdersPage />} />
          <Route path="/owner/categories" element={<CategoriesPage />} />
          <Route path="/owner/stats" element={<div>Statistika</div>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="waiter" />}>
        <Route element={<Layout />}>
          {/* <Route path="/waiter/menu" element={<WaiterMenu />} /> */}
          <Route path="/waiter/cart" element={<div>Savat</div>} />
          <Route path="/waiter/salary" element={<div>Maosh</div>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="cashier" />}>
        <Route element={<Layout />}>
          {/* <Route path="/cashier/orders" element={<CashierOrders />} /> */}
          <Route path="/cashier/payments" element={<div>To‘lovlar</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
