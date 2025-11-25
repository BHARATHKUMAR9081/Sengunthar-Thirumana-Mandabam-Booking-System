import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admin from localStorage on refresh
  useEffect(() => {
    const saved = localStorage.getItem("adminAuth");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAdmin(parsed.admin);
      setToken(parsed.token);

      // Set axios auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const login = (adminData, tokenData = null) => {
    setAdmin(adminData);
    setToken(tokenData);

    localStorage.setItem(
      "adminAuth",
      JSON.stringify({ admin: adminData, token: tokenData })
    );

    if (tokenData) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminAuth");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AdminContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
