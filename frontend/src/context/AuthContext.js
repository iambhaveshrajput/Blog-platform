import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('userData');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp <= currentTime) {
        // Token expired - clear everything
        clearAuth();
        setLoading(false);
        return;
      }

      // Token is valid - immediately restore user from localStorage
      // This prevents blank page on refresh
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Fetch fresh profile in background (don't block the page)
      authAPI.getProfile()
        .then(response => {
          setUser(response.data);
          localStorage.setItem('userData', JSON.stringify(response.data));
        })
        .catch(error => {
          // 401 = actually logged out
          if (error.response && error.response.status === 401) {
            clearAuth();
          }
          // Network error / server sleeping = keep existing user, don't logout
        });

    } catch (error) {
      clearAuth();
    }

    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { access, refresh } = response.data;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    const profileResponse = await authAPI.getProfile();
    setUser(profileResponse.data);
    localStorage.setItem('userData', JSON.stringify(profileResponse.data));

    return profileResponse.data;
  };

  const register = async (userData) => {
    await authAPI.register(userData);
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = async (data) => {
    const response = await authAPI.updateProfile(data);
    setUser(response.data);
    localStorage.setItem('userData', JSON.stringify(response.data));
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
