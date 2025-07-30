/**
 * UserContext Consolidado
 * Merge entre AuthContext e PermissionContext para eliminar redundância
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@shared/schema';
import { AuthService, LoginCredentials, RegisterData } from '@/services/authService';
import { apiRequest } from '@/lib/queryClient';
import { logger } from '@/utils/logger';

// Interfaces consolidadas
interface UserState {
  // Auth state
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Permission state
  features: string[];
  permissionsLoading: boolean;
}

interface UserActions {
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Permission actions
  hasAccess: (featureCode: string) => boolean;
  checkAccess: (featureCode: string) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
}

type UserContextType = UserState & UserActions;

// Token management otimizado
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

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, setState] = useState<UserState>({
    user: null,
    token: TokenManager.getToken(),
    isLoading: true,
    isAuthenticated: false,
    features: [],
    permissionsLoading: true,
  });

  // Cache para verificações de permissão
  const [permissionCache, setPermissionCache] = useState<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Verificação de autenticação
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    if (TokenManager.wasLoggedOut()) {
      setState(prev => ({ ...prev, isLoading: false, permissionsLoading: false }));
      return;
    }

    const token = TokenManager.getToken();
    if (!token) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        permissionsLoading: false,
        user: null,
        isAuthenticated: false,
        features: []
      }));
      return;
    }

    try {
      const user = await AuthService.getCurrentUser();
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));

      // Fetch permissions after successful auth
      await fetchUserFeatures(user);
    } catch (error) {
      logger.error('Auth check failed:', error);
      TokenManager.removeToken();
      setState(prev => ({
        ...prev,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        features: [],
        permissionsLoading: false,
      }));
    }
  }, []);

  // Fetch user permissions
  const fetchUserFeatures = useCallback(async (user?: User | null) => {
    const currentUser = user || state.user;
    if (!currentUser) {
      setState(prev => ({ ...prev, features: [], permissionsLoading: false }));
      return;
    }

    try {
      const response = await apiRequest('/api/permissions/user-features', {
        method: 'GET',
      }) as { features: string[] };
      
      setState(prev => ({
        ...prev,
        features: response.features || [],
        permissionsLoading: false,
      }));
      
      // Clear cache when features are refreshed
      setPermissionCache(new Map());
    } catch (error) {
      logger.error('Failed to fetch user features:', error);
      setState(prev => ({
        ...prev,
        features: [],
        permissionsLoading: false,
      }));
    }
  }, [state.user]);

  // Initial check
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Actions
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.token && result.user) {
        TokenManager.setToken(result.token);
        setState(prev => ({
          ...prev,
          user: result.user!,
          token: result.token!,
          isAuthenticated: true,
          isLoading: false,
        }));
        
        // Fetch permissions after login
        await fetchUserFeatures(result.user);
        
        return { success: true };
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Network error' };
    }
  }, [fetchUserFeatures]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await AuthService.register(userData);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    TokenManager.removeToken();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      features: [],
      permissionsLoading: false,
    });
    setPermissionCache(new Map());
  }, []);

  const hasAccess = useCallback((featureCode: string): boolean => {
    return state.features.includes(featureCode);
  }, [state.features]);

  const checkAccess = useCallback(async (featureCode: string): Promise<boolean> => {
    if (!state.user) return false;
    
    // Check cache first
    const cached = permissionCache.get(featureCode);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    try {
      const response = await apiRequest(`/api/permissions/check/${featureCode}`, {
        method: 'GET',
      }) as { hasAccess: boolean };
      
      const result = response.hasAccess || false;
      
      // Cache the result
      setPermissionCache(prev => new Map(prev).set(featureCode, {
        result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (error) {
      logger.error('Permission check failed:', error);
      return false;
    }
  }, [state.user, permissionCache]);

  const refreshPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, permissionsLoading: true }));
    await fetchUserFeatures();
  }, [fetchUserFeatures]);

  const contextValue: UserContextType = {
    ...state,
    login,
    register,
    logout,
    hasAccess,
    checkAccess,
    refreshPermissions,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Backwards compatibility aliases
export const useAuth = useUser;
export const usePermissions = () => {
  const { features, hasAccess, checkAccess, refreshPermissions, permissionsLoading } = useUser();
  return { features, hasAccess, checkAccess, refreshPermissions, isLoading: permissionsLoading };
};