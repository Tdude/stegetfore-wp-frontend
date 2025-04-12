// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api/formTryggveApi';
import { quickDevLogin } from '@/utils/devAuth';

type UserInfo = {
  id: number;
  username: string;
  display_name: string;
  email: string;
  roles: string[];
  student_id?: number;
  [key: string]: any;
};

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (username: string, password: string) => Promise<{ success: boolean; data?: UserInfo; error?: any }>;
  devLogin: () => Promise<{ success: boolean; data?: UserInfo; error?: any }>;
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
        // First check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set token from localStorage
        authApi.setToken(token);
        
        // Validate token
        const isValid = await authApi.validateToken();
        if (isValid) {
          // Get user info if token is valid
          const userData = await authApi.getCurrentUser();
          if (userData) {
            setUserInfo(userData);
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            localStorage.removeItem('auth_token');
          }
        } else {
          // Clear invalid token
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; data?: UserInfo; error?: any }> => {
    try {
      const response = await authApi.login(username, password);
      
      // Check if login was successful (token present)
      if (response && 'token' in response) {
        // Store token in localStorage for persistence
        localStorage.setItem('auth_token', response.token);
        
        // Get user info
        const userData = await authApi.getCurrentUser();
        if (userData) {
          setUserInfo(userData);
          setIsAuthenticated(true);
          return { success: true, data: userData };
        }
      }
      
      // Login failed
      return { 
        success: false, 
        error: (response as any)?.error ? 'Login failed' : 'Invalid credentials' 
      };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Quick developer login using .env.local credentials
  const devLogin = async (): Promise<{ success: boolean; data?: UserInfo; error?: any }> => {
    return await quickDevLogin(login);
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
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
