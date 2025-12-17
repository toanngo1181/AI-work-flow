import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { callSheetAPI } from '../services/googleSheetAPI';
import { initializeDB, getSession } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  register: (u: string, p: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to handle session storage
const SESSION_KEY = 'pm_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDB();
    const session = getSession();
    if (session) setUser(session);
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string) => {
    try {
      // Call API directly as requested
      const result = await callSheetAPI('login', { username: u, password: p });
      
      if (result.success && result.user) {
        // Save to state and local storage
        setUser(result.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login Error", e);
      return false;
    }
  };

  const register = async (u: string, p: string, name: string) => {
    try {
      // Call API directly as requested
      const result = await callSheetAPI('register', { username: u, password: p, fullName: name });
      
      if (result.success && result.user) {
        // Save to state and local storage
        setUser(result.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Register Error", e);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const refreshUser = () => {
      const session = getSession();
      if (session) setUser(session);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};