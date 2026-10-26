import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
