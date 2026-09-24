import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/employee-home" replace />;
};

export default HomeRedirect;