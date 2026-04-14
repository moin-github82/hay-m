import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { saveSession, clearSession, getStoredUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount — validate token against backend
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid
    api.get('/auth/me')
      .then(res => setUser(res.user ?? res.data?.user ?? stored))
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // Token expired or invalid — force re-login
          clearSession();
          setUser(null);
        } else {
          // Network error / backend sleeping — trust the stored user so the
          // app remains usable while the server wakes up (Render free tier)
          setUser(stored);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.token, res.user);
    setUser(res.user);
  };

  const signup = async (fullName, email, password) => {
    const res = await api.post('/auth/signup', { fullName, email, password });
    saveSession(res.token, res.user);
    setUser(res.user);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('haym_web_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
