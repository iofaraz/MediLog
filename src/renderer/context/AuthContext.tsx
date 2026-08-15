import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage on app start
    const stored = sessionStorage.getItem('medilog_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('medilog_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Guard: window.api is only available inside Electron (not plain browser)
    if (!window.api?.auth?.login) {
      return { success: false, error: 'API bridge unavailable. Please restart the app.' };
    }
    const result = await window.api.auth.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      sessionStorage.setItem('medilog_user', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('medilog_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
