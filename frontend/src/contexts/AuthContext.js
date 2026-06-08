import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await auth.getProfile();
      console.log('Profile loaded:', response.data);
      console.log('Username:', response.data.username);
      setUser(response.data);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await auth.register(userData);
      console.log('Register success:', response.data);
      return response.data;
    } catch (err) {
      console.error('Register error:', err.response?.data);
      setError(err.response?.data?.password?.[0] || err.response?.data?.detail || 'Ошибка регистрации');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await auth.login(credentials);
      const { access, refresh } = response.data;
      console.log('Login success, tokens received');
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      await loadProfile();
      return response.data;
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.detail || 'Ошибка входа');
      throw err;
    }
  };

  const logout = () => {
    console.log('Logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await auth.updateProfile(data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка обновления профиля');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};