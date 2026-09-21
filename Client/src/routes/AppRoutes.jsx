import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Categories from "../pages/categories/Categories";
import Suppliers from "../pages/suppliers/Suppliers";
import Products from "../pages/products/Products";
import ProductDetails from "../pages/products/ProductDetails";
import Inventory from "../pages/inventory/Inventory";
import InventoryHistory from "../pages/inventory/InventoryHistory";
import Orders from "../pages/orders/Orders";
import Customers from "../pages/customers/Customers";
import Logistics from "../pages/logistics/Logistics";
import OrderDetails from "../pages/orders/OrderDetails";
import Users from "../pages/users/Users";
import SalesReport from "../pages/reports/SalesReport";
import InventoryReport from "../pages/reports/InventoryReport";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route
          path="/inventory/:productId/history"
          element={<InventoryHistory />}
        />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={["admin"]} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/reports/sales" element={<SalesReport />} />
        <Route path="/reports/inventory" element={<InventoryReport />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Route>

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
