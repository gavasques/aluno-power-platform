import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { AuthService, LoginCredentials, RegisterData } from '@/services/authService';

// Interfaces seguindo Single Responsibility Principle
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

type AuthContextType = AuthState & AuthActions;

// Token management seguindo Single Responsibility
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly LOGOUT_FLAG = 'user_logged_out';

  static getToken(): string | null {
    return localStorage.getItem(TokenManager.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(TokenManager.TOKEN_KEY, token);
    localStorage.removeItem(TokenManager.LOGOUT_FLAG);
  }

  static removeToken(): void {
    localStorage.removeItem(TokenManager.TOKEN_KEY);
    localStorage.setItem(TokenManager.LOGOUT_FLAG, 'true');
  }

  static wasLoggedOut(): boolean {
    return localStorage.getItem(TokenManager.LOGOUT_FLAG) === 'true';
  }
}

// Context seguindo Dependency Inversion Principle
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: TokenManager.getToken(),
    isLoading: true,
    isAuthenticated: false,
  });

  // Authentication check seguindo Open/Closed Principle
  const checkAuthStatus = async (): Promise<void> => {
    console.log('🔥 AuthContext: useEffect triggered, checking authentication state');

    if (TokenManager.wasLoggedOut()) {
      console.log('🔥 AuthContext: User explicitly logged out, staying logged out');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const token = TokenManager.getToken();
    console.log('🔥 AuthContext: Token from storage:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 10) + '...'
    });

    if (!token) {
      console.log('🔥 AuthContext: No token found, setting as logged out');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false
      }));
      return;
    }

    try {
      console.log('🔥 AuthContext: Attempting to get current user with token');
      const user = await AuthService.getCurrentUser();
      
      console.log('🔥 AuthContext: User validation result:', {
        userFound: !!user,
        userId: user?.id,
        userEmail: user?.email
      });

      if (user) {
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        throw new Error('No user returned from API');
      }
    } catch (error) {
      console.log('🔥 AuthContext: Authentication failed, clearing token:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      TokenManager.removeToken();
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Login action seguindo Single Responsibility
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const credentials: LoginCredentials = { email, password };
    const result = await AuthService.login(credentials);

    if (result.success && result.user && result.token) {
      TokenManager.setToken(result.token);
      setState({
        user: result.user,
        token: result.token,
        isLoading: false,
        isAuthenticated: true,
      });
    }

    return result;
  };

  // Register action seguindo Single Responsibility
  const register = async (email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const userData: RegisterData = { email, name, password };
    const result = await AuthService.register(userData);

    if (result.success && result.user && result.token) {
      TokenManager.setToken(result.token);
      setState({
        user: result.user,
        token: result.token,
        isLoading: false,
        isAuthenticated: true,
      });
    }

    return result;
  };

  // Logout action seguindo Single Responsibility
  const logout = (): void => {
    AuthService.logout().catch(console.error);
    TokenManager.removeToken();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook seguindo Interface Segregation Principle
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}