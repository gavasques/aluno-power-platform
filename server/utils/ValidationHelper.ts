/**
 * Validation Helper Utility
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for validation logic
 * - OCP: Open for extension, closed for modification
 * - DRY: Centralized validation helpers
 */

export class ValidationHelper {
  /**
   * Validate if ID is a positive integer
   */
  static validateId(id: any): boolean {
    const parsedId = parseInt(id);
    return !isNaN(parsedId) && parsedId > 0;
  }

  /**
   * Parse and validate ID parameter
   */
  static parseId(id: any): number {
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new Error('Invalid ID parameter');
    }
    return parsedId;
  }

  /**
   * Validate required fields
   */
  static validateRequired(data: any, fields: string[]): void {
    for (const field of fields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, 1000); // Limit length
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate request parameters (used by controllers)
   */
  static validateParams(params: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!params[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}