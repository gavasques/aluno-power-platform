/**
 * ResponseHandler - Standardized response utility for enterprise APIs
 * 
 * Features:
 * - Consistent response formats across all endpoints
 * - Proper HTTP status codes
 * - Performance metadata
 * - Error handling with proper structure
 */

import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ResponseMeta {
  duration?: string;
  stats?: any;
  query?: string;
  count?: number;
  [key: string]: any;
}

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Request successful',
    meta?: ResponseMeta
  ): void {
    res.json({
      success: true,
      message,
    
      data,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Data retrieved successfully',
    meta?: ResponseMeta
  ): void {
    res.json({
      success: true,
      message,
      data,
      pagination,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Internal server error',
    statusCode: number = 500,
    details?: any
  ): void {
    res.status(statusCode).json({
      success: false,
      error: message,
      details: details || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: any[],
    message: string = 'Validation failed'
  ): void {
    res.status(400).json({
      success: false,
      error: message,
      details: {
        validationErrors: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    res.status(401).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden access'
  ): void {
    res.status(403).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    res.status(404).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: any
  ): void {
    res.status(400).json({
      success: false,
      error: message,
      details: details || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    details?: any
  ): void {
    res.status(409).json({
      success: false,
      error: message,
      details: details || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
    meta?: ResponseMeta
  ): void {
    res.status(201).json({
      success: true,
      message,
      data,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send accepted response
   */
  static accepted<T>(
    res: Response,
    data: T,
    message: string = 'Request accepted for processing',
    meta?: ResponseMeta
  ): void {
    res.status(202).json({
      success: true,
      message,
      data,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send custom status response
   */
  static custom<T>(
    res: Response,
    statusCode: number,
    data: T,
    message: string,
    meta?: ResponseMeta
  ): void {
    res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  }
}