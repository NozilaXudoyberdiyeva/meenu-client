import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./pages/layout/Layout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import DishesPage from "./pages/owner/DishesPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRole="owner" />}>
        <Route element={<Layout />}>
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/meals" element={<DishesPage />} />
          <Route path="/owner/waiters" element={<div>Ofitsantlar</div>} />
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
