/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [jwtToken, setJwtToken] = useState(
    () => localStorage.getItem("jwtToken") || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(jwtToken)
  );

  // Effect to handle authentication state changes
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("jwtToken");
      setIsAuthenticated(false);
    }
  }, [jwtToken]);

  const setToken = (token) => {
    setJwtToken(token);
  };

  const clearToken = () => {
    setJwtToken("");
  };

  // Memoize headers to prevent unnecessary re-renders
  const headers = {
    Authorization: jwtToken ? `Bearer ${jwtToken}` : "",
  };

  const contextValue = {
    jwtToken,
    isAuthenticated,
    setToken,
    clearToken,
    headers,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
