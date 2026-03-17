import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gl_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gl_token');
    if (token) {
      API.get('/auth/me')
        .then(r => { setUser(r.data.user); localStorage.setItem('gl_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.removeItem('gl_token'); localStorage.removeItem('gl_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (identifier, password) => {
    const r = await API.post('/auth/login', { identifier, password });
    localStorage.setItem('gl_token', r.data.token);
    localStorage.setItem('gl_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (username, email, password) => {
    const r = await API.post('/auth/register', { username, email, password });
    localStorage.setItem('gl_token', r.data.token);
    localStorage.setItem('gl_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem('gl_token');
    localStorage.removeItem('gl_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const r = await API.get('/auth/me');
    setUser(r.data.user);
    localStorage.setItem('gl_user', JSON.stringify(r.data.user));
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
