/**
 * Authentication utility functions
 * 
 * This module provides a centralized interface for authentication token management
 * that can be used across the application consistently.
 */

/**
 * Gets the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Sets the authentication token in localStorage
 * @param token The authentication token to store
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
  localStorage.removeItem('user_logged_out');
}

/**
 * Removes the authentication token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.setItem('user_logged_out', 'true');
}

/**
 * Checks if the user was manually logged out
 * @returns True if user was logged out, false otherwise
 */
export function wasUserLoggedOut(): boolean {
  return localStorage.getItem('user_logged_out') === 'true';
}