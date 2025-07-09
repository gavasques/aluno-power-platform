/**
 * BaseController - Foundation class for all enterprise controllers
 * 
 * Features:
 * - Standardized error handling and logging
 * - Performance monitoring capabilities
 * - Consistent validation patterns
 * - Security best practices
 */

import { Response } from 'express';

export abstract class BaseController {
  protected serviceName: string = 'BaseController';

  /**
   * Log operation with context
   */
  protected logOperation(operation: string, context?: any): void {
    console.log(`🔧 [${this.serviceName}] ${operation}`, context || '');
  }

  /**
   * Log error with context
   */
  protected logError(error: any, operation: string, context?: any): void {
    console.error(`❌ [${this.serviceName}] Error in ${operation}:`, {
      error: error.message || error,
      context: context || null,
      stack: error.stack || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate and parse numeric ID from request parameters
   */
  protected validateId(idParam: string): number {
    const id = parseInt(idParam);
    
    if (isNaN(id) || id <= 0) {
      throw new Error(`Invalid ID parameter: ${idParam}`);
    }
    
    return id;
  }

  /**
   * Validate and parse pagination parameters
   */
  protected validatePagination(page?: string, limit?: string): { page: number; limit: number } {
    const parsedPage = Math.max(1, parseInt(page || '1') || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit || '50') || 50));
    
    return {
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  /**
   * Validate search query parameters
   */
  protected validateSearchQuery(query?: string): string {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string');
    }
    
    const trimmed = query.trim();
    
    if (trimmed.length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }
    
    if (trimmed.length > 100) {
      throw new Error('Search query must not exceed 100 characters');
    }
    
    return trimmed;
  }

  /**
   * Sanitize string input for security
   */
  protected sanitizeString(input?: string): string | undefined {
    if (!input || typeof input !== 'string') {
      return undefined;
    }
    
    // Basic sanitization - remove potentially dangerous characters
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection characters
      .substring(0, 255); // Limit length
  }

  /**
   * Validate sort parameters
   */
  protected validateSort(
    sortBy?: string, 
    sortOrder?: string, 
    allowedFields: string[] = ['name', 'createdAt']
  ): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    const validSortBy = allowedFields.includes(sortBy || '') ? sortBy! : allowedFields[0];
    const validSortOrder = ['asc', 'desc'].includes(sortOrder || '') ? sortOrder as 'asc' | 'desc' : 'asc';
    
    return {
      sortBy: validSortBy,
      sortOrder: validSortOrder,
    };
  }

  /**
   * Handle async operation with standardized error response
   */
  protected async handleAsync<T>(
    operation: () => Promise<T>,
    res: Response,
    operationName: string,
    successMessage?: string
  ): Promise<T | null> {
    try {
      const startTime = Date.now();
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.logOperation(`${operationName} completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      this.logError(error, operationName);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
      
      return null;
    }
  }

  /**
   * Extract user ID from authenticated request
   */
  protected getUserId(req: any): number {
    const userId = req.user?.id;
    
    if (!userId || typeof userId !== 'number') {
      throw new Error('User authentication required');
    }
    
    return userId;
  }

  /**
   * Extract user context from authenticated request
   */
  protected getUserContext(req: any): { id: number; email?: string; name?: string } {
    const user = req.user;
    
    if (!user || !user.id) {
      throw new Error('User authentication required');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Validate request body against required fields
   */
  protected validateRequiredFields(body: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate array parameter
   */
  protected validateArray(value: any, fieldName: string, maxLength: number = 100): any[] {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }
    
    if (value.length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }
    
    if (value.length > maxLength) {
      throw new Error(`${fieldName} cannot exceed ${maxLength} items`);
    }
    
    return value;
  }

  /**
   * Generate cache key for operations
   */
  protected generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Log performance metrics
   */
  protected logPerformanceMetric(operation: string, duration: number, details?: any): void {
    const message = `⚡ [${this.serviceName}] ${operation} took ${duration.toFixed(2)}ms`;
    
    if (duration > 1000) {
      console.warn(`${message} (SLOW)`, details || '');
    } else {
      console.log(message, details || '');
    }
  }
}