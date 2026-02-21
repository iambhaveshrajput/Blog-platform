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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAuthInBackground();
  }, []);

  const refreshAuthInBackground = async () => {
    const token = localStorage.getItem('accessToken');

    // FIX: Was missing curly braces — only setLoading(false) ran, return never executed.
    // This caused loading to stay true forever (infinite spinner / blank screen) when
    // no token was present (i.e. all logged-out users saw a blank page).
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp <= currentTime) {
        clearAuth();
        setLoading(false);
        return;
      }
    } catch (e) {
      clearAuth();
      setLoading(false);
      return;
    }

    // FIX: Original code had a stray orphaned `.finally()` after a closed block
    // which caused a SyntaxError crashing the entire React app.
    // Rewritten as clean async/await with proper try/catch/finally.
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('userData', JSON.stringify(response.data));
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth(); // Only clear on real auth failure
      }
      // Network/timeout errors: keep user logged in, do nothing
    } finally {
      setLoading(false);
    }
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
