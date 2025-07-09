/**
 * Response Handler
 * Standardized API response formatting
 */

import { Response } from 'express';

export class ResponseHandler {
  static success(res: Response, data?: any, message?: string): void {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }

  static created(res: Response, data?: any, message?: string): void {
    res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static badRequest(res: Response, message: string, errors?: any): void {
    res.status(400).json({
      success: false,
      message,
      errors
    });
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    res.status(401).json({
      success: false,
      message
    });
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    res.status(403).json({
      success: false,
      message
    });
  }

  static notFound(res: Response, message: string = 'Not found'): void {
    res.status(404).json({
      success: false,
      message
    });
  }

  static error(res: Response, message: string = 'Internal server error'): void {
    res.status(500).json({
      success: false,
      message
    });
  }
}