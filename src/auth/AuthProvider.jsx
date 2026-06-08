import { useState } from "react";
import AuthContext from "./AuthContext";
import {
  clearAuth,
  getCurrentUser,
  safeUser,
  setCurrentUser,
  setToken,
} from "./auth.utils";
import { fetchJson } from "../api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = async ({ email, password }) => {
    const response = await fetchJson("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setToken(response.token);
    const nextUser = safeUser(response.user);
    setCurrentUser(nextUser);
    setUser(nextUser);
    return nextUser;
  };

  const signup = async ({ name, email, password }) => {
    const response = await fetchJson("/api/auth/signup", {
      method: "POST",
      body: { name, email, password },
    });

    setToken(response.token);
    const nextUser = safeUser(response.user);
    setCurrentUser(nextUser);
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (updates) => {
    const response = await fetchJson("/api/auth/profile", {
      method: "PATCH",
      body: updates,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("splitwise_token")}`,
      },
    });

    const updatedUser = safeUser(response.user);
    setCurrentUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;