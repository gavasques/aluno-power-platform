/**
 * Standardized Authentication Error Handling
 * Provides consistent error responses across all auth-related operations
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  PASSWORD_WEAK = 'PASSWORD_WEAK',
  EMAIL_INVALID = 'EMAIL_INVALID',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AuthErrorResponse {
  success: false;
  error: {
    type: AuthErrorType;
    message: string;
    details?: string[];
    code?: number;
  };
}

export interface AuthSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type AuthResponse<T = any> = AuthSuccessResponse<T> | AuthErrorResponse;

export class AuthError extends Error {
  public readonly type: AuthErrorType;
  public readonly code: number;
  public readonly details?: string[];

  constructor(type: AuthErrorType, message: string, details?: string[], code?: number) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.code = code || this.getDefaultCode(type);
    this.details = details;
  }

  private getDefaultCode(type: AuthErrorType): number {
    switch (type) {
      case AuthErrorType.INVALID_CREDENTIALS:
      case AuthErrorType.TOKEN_INVALID:
      case AuthErrorType.TOKEN_EXPIRED:
        return 401;
      case AuthErrorType.PERMISSION_DENIED:
        return 403;
      case AuthErrorType.USER_NOT_FOUND:
        return 404;
      case AuthErrorType.USER_EXISTS:
      case AuthErrorType.PASSWORD_WEAK:
      case AuthErrorType.EMAIL_INVALID:
        return 400;
      case AuthErrorType.ACCOUNT_LOCKED:
      case AuthErrorType.RATE_LIMITED:
        return 429;
      case AuthErrorType.ACCOUNT_INACTIVE:
        return 423;
      default:
        return 500;
    }
  }

  toResponse(): AuthErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        details: this.details,
        code: this.code
      }
    };
  }

  static createResponse<T>(data: T, message?: string): AuthSuccessResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  // Predefined error factories
  static invalidCredentials(message = 'Invalid email or password'): AuthError {
    return new AuthError(AuthErrorType.INVALID_CREDENTIALS, message);
  }

  static accountLocked(minutesRemaining?: number): AuthError {
    const message = minutesRemaining
      ? `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`
      : 'Account is temporarily locked due to too many failed login attempts.';
    return new AuthError(AuthErrorType.ACCOUNT_LOCKED, message);
  }

  static accountInactive(): AuthError {
    return new AuthError(AuthErrorType.ACCOUNT_INACTIVE, 'Account is inactive or disabled.');
  }

  static tokenExpired(): AuthError {
    return new AuthError(AuthErrorType.TOKEN_EXPIRED, 'Session has expired. Please log in again.');
  }

  static tokenInvalid(): AuthError {
    return new AuthError(AuthErrorType.TOKEN_INVALID, 'Invalid authentication token.');
  }

  static passwordWeak(errors: string[]): AuthError {
    return new AuthError(
      AuthErrorType.PASSWORD_WEAK,
      'Password does not meet security requirements.',
      errors
    );
  }

  static emailInvalid(): AuthError {
    return new AuthError(AuthErrorType.EMAIL_INVALID, 'Invalid email format.');
  }

  static userExists(): AuthError {
    return new AuthError(AuthErrorType.USER_EXISTS, 'User with this email already exists.');
  }

  static userNotFound(): AuthError {
    return new AuthError(AuthErrorType.USER_NOT_FOUND, 'User not found.');
  }

  static permissionDenied(): AuthError {
    return new AuthError(AuthErrorType.PERMISSION_DENIED, 'Insufficient permissions.');
  }

  static rateLimited(): AuthError {
    return new AuthError(AuthErrorType.RATE_LIMITED, 'Too many requests. Please try again later.');
  }

  static internalError(message = 'An internal error occurred.'): AuthError {
    return new AuthError(AuthErrorType.INTERNAL_ERROR, message);
  }
}

/**
 * Middleware error handler for authentication routes
 */
export const handleAuthError = (error: any): AuthErrorResponse => {
  if (error instanceof AuthError) {
    return error.toResponse();
  }

  // Log unexpected errors
  console.error('Unexpected auth error:', error);

  // Return generic error for security
  return AuthError.internalError().toResponse();
};