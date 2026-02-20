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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // loading is false immediately - no API call blocks it
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshAuthInBackground();
  }, []);

  const refreshAuthInBackground = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp <= currentTime) {
        clearAuth();
        return;
      }
    } catch (e) {
      clearAuth();
      return;
    }

    // Token valid - silently refresh profile in background
    authAPI.getProfile()
      .then(response => {
        setUser(response.data);
        localStorage.setItem('userData', JSON.stringify(response.data));
      })
      .catch(error => {
        console.log('Background profile refresh failed, keeping user logged in');
        
        }
        // Network/timeout errors = keep user logged in, do nothing
      });
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

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
