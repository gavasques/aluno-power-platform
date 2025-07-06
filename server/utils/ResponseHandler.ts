/**
 * Response Handler Utility
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for handling API responses
 * - OCP: Open for extension, closed for modification
 * - DRY: Centralized response handling logic
 */

import { Response } from 'express';

export class ResponseHandler {
  /**
   * Send success response with data
   */
  static success(res: Response, data: any, statusCode: number = 200): void {
    res.status(statusCode).json(data);
  }

  /**
   * Send error response
   */
  static error(res: Response, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({ error: message });
  }

  /**
   * Send validation error response
   */
  static validationError(res: Response, message: string = 'Invalid data'): void {
    res.status(400).json({ error: message });
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    res.status(404).json({ error: message });
  }

  /**
   * Send created response
   */
  static created(res: Response, data: any): void {
    res.status(201).json(data);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send bad request response with details
   */
  static badRequest(res: Response, message: string = 'Bad request', details?: any): void {
    res.status(400).json({ 
      error: message,
      details
    });
  }

  /**
   * Send conflict response
   */
  static conflict(res: Response, message: string = 'Resource conflict'): void {
    res.status(409).json({ error: message });
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    res.status(403).json({ error: message });
  }

  /**
   * Send service unavailable response
   */
  static serviceUnavailable(res: Response, message: string = 'Service unavailable', details?: string): void {
    res.status(503).json({ 
      error: message,
      details
    });
  }

  /**
   * Handle error response with automatic status code detection
   */
  static handleError(res: Response, error: any, defaultMessage: string = 'Internal server error'): void {
    console.error('Error details:', error);
    
    let statusCode = 500;
    let message = defaultMessage;
    
    // Extract status code and message from error if available
    if (error?.statusCode) {
      statusCode = error.statusCode;
    }
    
    if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    res.status(statusCode).json({ error: message });
  }
}