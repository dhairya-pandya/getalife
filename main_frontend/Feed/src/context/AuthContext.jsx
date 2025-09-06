// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(apiService.getCurrentUser());
  const navigate = useNavigate();

  const login = async (email, password) => {
    const data = await apiService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    navigate('/login'); // Redirect to login after logout
  };

  const value = { user, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};