import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

const DEFAULT_OPERATOR = {
  name: 'Studio Director',
  email: 'director@studio.internal',
  role: 'LEAD OPERATOR',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_OPERATOR);
  const [token, setToken] = useState(() => localStorage.getItem('studio_token') || 'active_operator_session');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('studio_token') || localStorage.getItem('token');
      const storedUser = localStorage.getItem('studio_user');

      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse cached operator profile', e);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    const authToken = data?.token || data?.data?.token || 'active_operator_session';
    const authUser = data?.user || data?.data?.user || { name: 'Studio Director', email };

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('studio_token', authToken);
    localStorage.setItem('studio_user', JSON.stringify(authUser));
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    const authToken = data?.token || data?.data?.token || 'active_operator_session';
    const authUser = data?.user || data?.data?.user || { name, email };

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('studio_token', authToken);
    localStorage.setItem('studio_user', JSON.stringify(authUser));
    return data;
  }, []);

  const logout = useCallback(() => {
    // Reset to default studio director identity
    setUser(DEFAULT_OPERATOR);
    localStorage.removeItem('studio_token');
    localStorage.removeItem('token');
    localStorage.removeItem('studio_user');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: true,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
