import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load token from localStorage on mount
    try {
      const t = localStorage.getItem('iafrica-token');
      if (t) setToken(t);
    } catch {
      // ignore
    }

    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await getCurrentUser();
        setUser(u);
        try {
          const id = u && (u._id || u.id);
          if (id) localStorage.setItem('iafrica-user-id', String(id));
        } catch {
          // ignore storage errors
        }
      } catch {
        // token invalid -> clear
        localStorage.removeItem('iafrica-token');
        localStorage.removeItem('iafrica-user-id');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const saveToken = (token) => {
    localStorage.setItem('iafrica-token', token);
    setToken(token);
  };

  const login = async (email, password) => {
    const payload = { email, password };
    const res = await loginUser(payload);
    // API returns token at top-level `token` per docs
    const token = res?.token;
    if (token) saveToken(token);
    const user = await getCurrentUser();
    setUser(user);
    try {
      const id = user && (user._id || user.id);
      if (id) localStorage.setItem('iafrica-user-id', String(id));
    } catch {
      // ignore storage errors
    }
    return { token, user };
  };

  const registerStudent = async ({ name, email, password, phone }) => {
    // Force role to student
    const payload = { name, email, password, phone, role: 'student' };
    const res = await registerUser(payload);
    const token = res?.token || res?.data?.token;
    if (token) saveToken(token);
    // attempt to set user
    const user = await getCurrentUser();
    setUser(user);
    try {
      const id = user && (user._id || user.id);
      if (id) localStorage.setItem('iafrica-user-id', String(id));
    } catch {
      // ignore storage errors
    }
    return res;
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('iafrica-token');
    localStorage.removeItem('iafrica-user-id');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ getCurrentUser, user, token, loading, login, logout, registerStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
