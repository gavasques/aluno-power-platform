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
}