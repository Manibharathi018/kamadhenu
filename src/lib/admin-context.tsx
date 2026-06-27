'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminEmail: null,
  login: () => false,
  logout: () => {},
});

// Hard-coded admin credentials
const ADMIN_EMAIL = 'admin@kamadhenu.com';
const ADMIN_PASSWORD = 'admin123456';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminEmail(email);
      localStorage.setItem('adminAuth', JSON.stringify({ email, timestamp: Date.now() }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    localStorage.removeItem('adminAuth');
  };

  // Check for existing admin session
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const { email } = JSON.parse(adminAuth);
        setIsAdmin(true);
        setAdminEmail(email);
      } catch (err) {
        localStorage.removeItem('adminAuth');
      }
    }
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, adminEmail, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
