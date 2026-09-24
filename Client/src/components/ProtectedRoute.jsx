import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ roles }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

   if (roles && !roles.includes(user?.role)) {
    if (user?.role === "employee") {
      return <Navigate to="/employee-home" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
