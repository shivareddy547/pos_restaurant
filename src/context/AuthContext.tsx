// ⚠️ MODIFY existing component - Add localStorage persistence for real API auth
// Preserve all existing imports and code
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mockAuthService, { User } from '../services/mockAuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithMobile: (mobile: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      // Check mock auth first (if using dev mocks)
      const session = mockAuthService.getCurrentSession();
      if (session) {
        setUser(session.user);
      } else {
        // Check for real API token persistence in localStorage
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Failed to parse stored user', e);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');
          }
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await mockAuthService.loginWithEmail(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };
  
  const loginWithMobile = async (mobile: string, otp: string) => {
    const response = await mockAuthService.loginWithMobile(mobile, otp);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };
  
  const signup = async (email: string, password: string, name?: string) => {
    const response = await mockAuthService.signupWithEmail(email, password, name);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };
  
  const logout = () => {
    mockAuthService.logout();
    // Clear API tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      loginWithMobile,
      signup,
      logout,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
