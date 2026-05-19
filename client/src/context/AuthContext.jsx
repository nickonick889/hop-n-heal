import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// AuthContext stores the logged-in client object (or null).
// We never store the JWT directly — the cookie is httpOnly so JS can't read it anyway.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out

  // On first load, try to restore the session from the cookie
  useEffect(() => {
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function signup(fields) {
    const { data } = await api.post('/api/auth/signup', fields);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post('/api/auth/logout');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components don't have to import useContext + AuthContext every time
export function useAuth() {
  return useContext(AuthContext);
}
