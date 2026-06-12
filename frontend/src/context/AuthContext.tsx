'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPublic } from '@/types';
import { refresh as apiRefresh, logout as apiLogout } from '@/lib/api';

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  login: (user: UserPublic, token: string) => void;
  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: UserPublic | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((user: UserPublic, token: string) => {
    setUser(user);
    setToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiRefresh();
      if (response.success && response.data.token) {
        setToken(response.data.token);
        // After getting token, we need to get the user info
        // We can either include it in refresh response or fetch /me
        const { getMe } = await import('@/lib/api');
        const meRes = await getMe(response.data.token);
        if (meRes.success) {
          setUser(meRes.data.user);
        }
      }
    } catch (error) {
      console.error('Initial auth refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccessToken();
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout, 
      setToken,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
