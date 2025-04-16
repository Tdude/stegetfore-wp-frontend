// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api/formTryggveApi';
import { quickDevLogin } from '@/lib/utils/devAuth';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/utils/authToken';
import { setUserInfo as persistUserInfo, getUserInfo as retrieveUserInfo, removeUserInfo } from '@/lib/utils/userInfo';

type UserInfo = {
  id: number;
  username: string;
  display_name: string;
  email: string;
  roles: string[];
  student_id?: number;
  [key: string]: unknown;
};

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (username: string, password: string) => Promise<{ success: boolean; data?: UserInfo; error?: unknown }>;
  devLogin: () => Promise<{ success: boolean; data?: UserInfo; error?: unknown }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          // Try to restore user info from storage for display (optional, not trusted until validated)
          const storedUser = retrieveUserInfo<UserInfo>();
          if (storedUser) setUserInfo(storedUser);
          setLoading(false);
          return;
        }
        
        // Set token from utility
        authApi.setToken(token);
        
        // Validate token
        const isValid = await authApi.validateToken();
        if (isValid) {
          // Get user info if token is valid
          const userData = await authApi.getCurrentUser();
          if (userData) {
            setUserInfo(userData);
            persistUserInfo(userData);
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            removeAuthToken();
            removeUserInfo();
          }
        } else {
          // Clear invalid token
          removeAuthToken();
          removeUserInfo();
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; data?: UserInfo; error?: unknown }> => {
    try {
      // Call the WordPress REST API directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ham/v1/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setAuthToken(data.token);
        setUserInfo(data.user_data || null);
        persistUserInfo(data.user_data || null);
        setIsAuthenticated(true);
        return { success: true, data: data.user_data };
      }
      // Login failed
      return {
        success: false,
        error: data.message || 'Invalid credentials',
      };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Quick developer login using .env.local credentials
  const devLogin = async (): Promise<{ success: boolean; data?: UserInfo; error?: unknown }> => {
    return await quickDevLogin(login);
  };

  const logout = (): void => {
    removeAuthToken();
    removeUserInfo();
    authApi.clearToken();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userInfo, 
      login, 
      devLogin, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
