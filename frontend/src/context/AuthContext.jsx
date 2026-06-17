import React, { createContext, useContext, useState } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("examfort_token"));
  const [role, setRole] = useState(localStorage.getItem("examfort_role"));
  const [userId, setUserId] = useState(localStorage.getItem("examfort_user_id"));
  const [name, setName] = useState(localStorage.getItem("examfort_name"));

  const login = async ({ email, password, private_code }) => {
    const response = await client.post("/auth/login", { email, password, private_code });
    const data = response.data;

    localStorage.setItem("examfort_token", data.access_token);
    localStorage.setItem("examfort_role", data.role);
    localStorage.setItem("examfort_user_id", data.user_id);
    if (data.name) localStorage.setItem("examfort_name", data.name);

    setToken(data.access_token);
    setRole(data.role);
    setUserId(data.user_id);
    setName(data.name);

    return data;
  };

  const registerAdmin = async (payload) => {
    const response = await client.post("/auth/register-admin", payload);
    const data = response.data;

    localStorage.setItem("examfort_token", data.access_token);
    localStorage.setItem("examfort_role", data.role);
    localStorage.setItem("examfort_user_id", data.user_id);
    if (data.name) localStorage.setItem("examfort_name", data.name);

    setToken(data.access_token);
    setRole(data.role);
    setUserId(data.user_id);
    setName(data.name);

    return data;
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUserId(null);
    setName(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, name, login, registerAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}