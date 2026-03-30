import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi, teacher as teacherApi, setAccessToken, clearAccessToken, getAccessToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session
    const token = getAccessToken();
    if (token) {
      teacherApi.getMe()
        .then(data => setUser(data))
        .catch(() => { clearAccessToken(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.teacher);
    return data;
  };

  const registerDirect = async (name, email, password) => {
    const data = await authApi.registerDirect({ name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.teacher);
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearAccessToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerDirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
