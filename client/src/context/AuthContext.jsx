import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/axios.js";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  const token = localStorage.getItem("tripgenie_token");
  const user = localStorage.getItem("tripgenie_user");

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => readStoredAuth().token);
  const [user, setUser] = useState(() => readStoredAuth().user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("tripgenie_token", token);
    } else {
      localStorage.removeItem("tripgenie_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("tripgenie_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tripgenie_user");
    }
  }, [user]);

  const persistAuth = (authData) => {
    setToken(authData.token);
    setUser(authData.user);
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/register", formData);
      persistAuth(data.data);
      toast.success(data.message);
      return data.data;
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", formData);
      persistAuth(data.data);
      toast.success(data.message);
      return data.data;
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
