import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    api.get('/api/admin/me')
      .then(({ data }) => setAdmin(data.admin))
      .catch(() => setAdmin(null));
  }, []);

  async function adminLogin(email, password) {
    const { data } = await api.post('/api/admin/login', { email, password });
    setAdmin(data.admin);
    return data.admin;
  }

  async function adminLogout() {
    await api.post('/api/admin/logout');
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
