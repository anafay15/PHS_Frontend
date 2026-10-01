import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getStoredToken } from '../api/axios';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem('studio_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setUser(readStoredUser());
  }, []);

  const persistSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    if (authToken) {
      localStorage.setItem('studio_token', authToken);
    } else {
      localStorage.removeItem('studio_token');
      localStorage.removeItem('token');
    }
    if (authUser) {
      localStorage.setItem('studio_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('studio_user');
    }
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const authToken = data?.token;
      const authUser = data?.user || null;
      if (!authToken) {
        throw new Error('Login did not return a token');
      }
      persistSession(authToken, authUser);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password });
      const authToken = data?.token;
      const authUser = data?.user || null;
      if (!authToken) {
        throw new Error('Registration did not return a token');
      }
      persistSession(authToken, authUser);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
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
