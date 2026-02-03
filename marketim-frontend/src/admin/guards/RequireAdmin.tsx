import { Navigate, Outlet } from "react-router-dom";
import { isAdminFromToken } from "../../utils/jwt";

const AdminGuard = () => {
  const token = localStorage.getItem("token"); // 🔴 EN KRİTİK SATIR

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = isAdminFromToken(token);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
