import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage, setCsrfToken } from '../services/api';
import { dashboardPathForRole } from '../utils/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      const csrf = await api.get('/auth/csrf');
      setCsrfToken(csrf.data.data.csrfToken);
      return data.data.user;
    } catch {
      setUser(null);
      setCsrfToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const loggedInUser = data.data.user;
    setCsrfToken(data.data.csrfToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setCsrfToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshMe,
      dashboardPath: user ? dashboardPathForRole(user.role) : '/login',
    }),
    [user, loading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getErrorMessage };
