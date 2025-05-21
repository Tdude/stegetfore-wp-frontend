// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api/formTryggveApi';
import { quickDevLogin } from '@/lib/utils/devAuth';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/utils/authToken';
import { setUserInfo as persistUserInfo, getUserInfo as retrieveUserInfo, removeUserInfo } from '@/lib/utils/userInfo';
import type { JwtUserInfo } from '@/lib/api/formTryggveApi';
import { jwtToUserInfo } from '@/lib/utils/userInfo';

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
  login: (username: string, password: string, persistent: boolean) => Promise<{ success: boolean; data?: UserInfo; error?: unknown }>;
  devLogin: (persistent: boolean) => Promise<{ success: boolean; data?: UserInfo; error?: unknown }>;
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
            // If userData is a JwtUserInfo (from JWT), adapt it to UserInfo
            const fullUser = (userData && 'user_id' in userData)
              ? jwtToUserInfo(userData as JwtUserInfo)
              : userData;
            setUserInfo(fullUser);
            persistUserInfo(fullUser);
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

  const login = async (username: string, password: string, persistent: boolean) => {
    setLoading(true);
    try {
      const response = await authApi.login(username, password);
      if (response.token) {
        setAuthToken(response.token, persistent);
        authApi.setToken(response.token);
        const userData = await authApi.getCurrentUser();
        if (userData) {
          // If userData is a JwtUserInfo (from JWT), adapt it to UserInfo
          const fullUser = (userData && 'user_id' in userData)
            ? jwtToUserInfo(userData as JwtUserInfo)
            : userData;
          setUserInfo(fullUser);
          persistUserInfo(fullUser);
          setIsAuthenticated(true);
          setLoading(false);
          return { success: true, data: fullUser };
        }
      }
      setLoading(false);
      return { success: false, error: response.error || 'Inloggningen misslyckades.' };
    } catch (error) {
      setLoading(false);
      return { success: false, error };
    }
  };

  const devLogin = async (persistent: boolean) => {
    setLoading(true);
    try {
      const response = await quickDevLogin(login, persistent);
      if (response && typeof response === 'object' && 'token' in response) {
        const { token } = response as { token: string };
        setAuthToken(token, persistent);
        authApi.setToken(token);
        const userData = await authApi.getCurrentUser();
        if (userData) {
          // If userData is a JwtUserInfo (from JWT), adapt it to UserInfo
          const fullUser = (userData && 'user_id' in userData)
            ? jwtToUserInfo(userData as JwtUserInfo)
            : userData;
          setUserInfo(fullUser);
          persistUserInfo(fullUser);
          setIsAuthenticated(true);
          setLoading(false);
          return { success: true, data: fullUser };
        }
      }
      setLoading(false);
      return { success: false, error: (response && typeof response === 'object' && 'error' in response) 
        ? (response as { error: string }).error : 'Dev-inloggning misslyckades.' };
    } catch (error) {
      setLoading(false);
      return { success: false, error };
    }
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
