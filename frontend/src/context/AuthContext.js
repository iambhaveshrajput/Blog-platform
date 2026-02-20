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

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          // Set a basic user immediately from token so page never goes blank
          setUser({ id: decoded.user_id, username: decoded.username || '' });

          // Then try to get full profile in background
          try {
            const response = await authAPI.getProfile();
            setUser(response.data);
          } catch (error) {
            if (error.response && error.response.status === 401) {
              // Truly unauthorized - try refresh token first
              const refreshed = await tryRefreshToken();
              if (!refreshed) {
                clearAuth();
              }
            }
            // For network errors (server sleeping), keep the user logged in
            // The basic user from token is already set above
          }
        } else {
          // Token expired - try refresh
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            clearAuth();
          }
        }
      } catch (error) {
        clearAuth();
      }
    }

    setLoading(false);
  };

  const tryRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const { default: axios } = await import('axios');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('accessToken', access);

      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { access, refresh } = response.data;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    const profileResponse = await authAPI.getProfile();
    setUser(profileResponse.data);

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
