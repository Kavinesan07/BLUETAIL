import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AddProduct from "./pages/AddProduct";
import Address from "./pages/Address";
import Payment from "./pages/payment";

export default function App() {
  return (

    <Routes>
      {/* Anyone can browse the shop, like Amazon */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/address" element={<Address />} />
      <Route path="/payment" element={<Payment />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Only logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<Dashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
}