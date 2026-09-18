import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await getMe();
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    setUser(response.data);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.data));
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token: localStorage.getItem("token"),
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        isEmployee: user?.role === "employee",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
