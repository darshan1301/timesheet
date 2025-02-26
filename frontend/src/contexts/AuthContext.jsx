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
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || ""
  );

  // Effect to handle authentication state changes
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("username");
      setIsAuthenticated(false);
      setUsername("");
    }
  }, [jwtToken]);

  const setToken = (token, user) => {
    setJwtToken(token);
    if (user?.username) {
      setUsername(user.username);
      localStorage.setItem("username", user.username);
    }
  };

  const clearToken = () => {
    setJwtToken("");
    setUsername("");
  };

  // Memoize headers to prevent unnecessary re-renders
  const headers = {
    Authorization: jwtToken ? `Bearer ${jwtToken}` : "",
  };

  const contextValue = {
    jwtToken,
    isAuthenticated,
    username,
    setToken,
    clearToken,
    setUsername,
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
