import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

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
  phone: string;
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

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const data = await apiRequest<{ user: User; token: string }>(AuthService.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no login',
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const data = await apiRequest<{ user: User; token: string }>(AuthService.ENDPOINTS.REGISTER, {
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
    await apiRequest(AuthService.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const data = await apiRequest<{ user: User }>(AuthService.ENDPOINTS.ME);
      return data.user;
    } catch (error) {
      return null;
    }
  }

  static async forgotPassword(emailData: EmailRequest): Promise<AuthResponse> {
    try {
      await apiRequest(AuthService.ENDPOINTS.FORGOT_PASSWORD, {
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
      await apiRequest(AuthService.ENDPOINTS.MAGIC_LINK, {
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