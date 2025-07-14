import { User } from '@shared/schema';
import { logger } from '@/lib/logger';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface EmailRequest {
  email: string;
}

export class AuthService {
  private static readonly API_BASE = '/api/auth';
  private static readonly ENDPOINTS = {
    LOGIN: `${AuthService.API_BASE}/login`,
    REGISTER: `${AuthService.API_BASE}/register`,
    LOGOUT: `${AuthService.API_BASE}/logout`,
    ME: `${AuthService.API_BASE}/me`,
    FORGOT_PASSWORD: `${AuthService.API_BASE}/forgot-password`,
    MAGIC_LINK: `${AuthService.API_BASE}/magic-link`,
  } as const;

  // Cache for user data to reduce API calls
  private static userCache: { user: User | null; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static async makeRequest<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const defaultOptions: RequestInit = {
      headers: defaultHeaders,
      credentials: 'include',
    };

    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.debug('Frontend login request started', {
        email: credentials.email,
        passwordLength: credentials.password.length
      });

      const data = await AuthService.makeRequest(AuthService.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      logger.debug('Frontend login success', {
        hasUser: !!data.user,
        hasToken: !!data.token,
        userId: data.user?.id
      });

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      logger.debug('Frontend login error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no login',
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const data = await AuthService.makeRequest(AuthService.ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no cadastro',
      };
    }
  }

  static async logout(): Promise<void> {
    await AuthService.makeRequest(AuthService.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      logger.debug('Getting current user');
      const data = await AuthService.makeRequest(AuthService.ENDPOINTS.ME);
      logger.debug('Current user response', {
        hasUser: !!data.user,
        userId: data.user?.id
      });
      return data.user;
    } catch (error) {
      logger.debug('Get current user failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  static async forgotPassword(emailData: EmailRequest): Promise<AuthResponse> {
    try {
      await AuthService.makeRequest(AuthService.ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar email',
      };
    }
  }

  static async sendMagicLink(emailData: EmailRequest): Promise<AuthResponse> {
    try {
      await AuthService.makeRequest(AuthService.ENDPOINTS.MAGIC_LINK, {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar magic link',
      };
    }
  }
}