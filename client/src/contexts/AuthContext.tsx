import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔥 AuthContext: useEffect triggered, checking authentication state');
      
      const storedToken = localStorage.getItem('authToken');
      const userLoggedOut = localStorage.getItem('userLoggedOut');
      
      if (userLoggedOut === 'true') {
        console.log('🔥 AuthContext: User explicitly logged out, staying logged out');
        setIsLoading(false);
        return;
      }
      
      if (!storedToken) {
        console.log('🔥 AuthContext: No stored token found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔥 AuthContext: Validating stored token');
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔥 AuthContext: Token valid, user authenticated:', data.user);
          setUser(data.user);
          setToken(storedToken);
        } else {
          console.log('🔥 AuthContext: Token invalid, removing from storage');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('🔥 AuthContext: Error validating token:', error);
        localStorage.removeItem('authToken');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setToken(data.sessionToken);
        localStorage.setItem('authToken', data.sessionToken);
        localStorage.removeItem('userLoggedOut'); // Clear logout flag
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setToken(data.sessionToken);
        localStorage.setItem('authToken', data.sessionToken);
        localStorage.removeItem('userLoggedOut'); // Clear logout flag
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear state and storage
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.setItem('userLoggedOut', 'true'); // Set logout flag
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};