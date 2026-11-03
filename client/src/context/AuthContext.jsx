import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check the cookie

  // When the site opens, ask the backend: "who is logged in?"
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null)) // 401 means nobody is logged in (this is normal)
      .finally(() => setLoading(false));
  }, []);

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    setUser(res.data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data);
    return res.data;
  };

  const googleLogin = async (idToken) => {
    const res = await api.post("/auth/google", { idToken });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend clears the cookie
    } catch (error) {
      // even if this fails we still clear the browser below
    }
    setUser(null);
    // Remove the cart and any saved data from this browser
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use this in any component: const { user, login } = useAuth();
export const useAuth = () => useContext(AuthContext);