import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const storedToken = localStorage.getItem('swasthyasetu_token');
    const storedUser = localStorage.getItem('swasthyasetu_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('swasthyasetu_token');
        localStorage.removeItem('swasthyasetu_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifierOrEmail, password) => {
    const response = await authAPI.login({
      identifier: identifierOrEmail,
      email: identifierOrEmail,
      password,
    });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('swasthyasetu_token', receivedToken);
      localStorage.setItem('swasthyasetu_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swasthyasetu_token');
    localStorage.removeItem('swasthyasetu_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('swasthyasetu_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
