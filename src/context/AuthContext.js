import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!authService.getToken());
  // Vous pouvez aussi stocker les infos de l'utilisateur (ex: son rôle)

  const login = async (username, password) => {
    await authService.login(username, password);
    setIsLoggedIn(true);
  };

  const logout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  const value = { isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour un accès facile
export const useAuth = () => {
  return useContext(AuthContext);
};