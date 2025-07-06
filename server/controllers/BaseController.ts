import { Request, Response, NextFunction } from 'express';

/**
 * Base Controller Interface - Dependency Inversion Principle (DIP)
 * Provides common abstractions for all controllers
 */
export interface IBaseController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Base Response Handler - DRY Principle
 * Eliminates repeated response patterns across controllers
 */
export class ResponseHandler {
  static success(res: Response, data: any, status: number = 200) {
    res.status(status).json(data);
  }

  static error(res: Response, message: string, status: number = 500) {
    res.status(status).json({ error: message });
  }

  static created(res: Response, data: any) {
    res.status(201).json(data);
  }

  static noContent(res: Response) {
    res.status(204).send();
  }
}

/**
 * Base Error Handler - KISS Principle
 * Simplified, consistent error handling
 */
export class ErrorHandler {
  static handle(error: unknown, res: Response, defaultMessage: string) {
    console.error('Controller Error:', error);
    
    if (error instanceof Error) {
      ResponseHandler.error(res, error.message, 400);
      return;
    }
    
    ResponseHandler.error(res, defaultMessage, 500);
  }
}

/**
 * Base Validation Helper - DRY Principle
 * Reusable validation patterns
 */
export class ValidationHelper {
  static parseId(idParam: string): number {
    const id = parseInt(idParam);
    if (isNaN(id)) {
      throw new Error('Invalid ID parameter');
    }
    return id;
  }

  static validateRequired(data: any, fields: string[]): void {
    for (const field of fields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }
}

/**
 * Abstract Base Controller - Template Method Pattern
 * Provides common functionality while allowing specialization
 */
export abstract class BaseController implements IBaseController {
  protected abstract serviceName: string;

  abstract getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract create(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract update(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract delete(req: Request, res: Response, next: NextFunction): Promise<void>;

  protected logOperation(operation: string, data?: any) {
    console.log(`[${this.serviceName}] ${operation}`, data ? JSON.stringify(data, null, 2) : '');
  }

  protected handleError(error: unknown, res: Response, operation: string) {
    this.logOperation(`${operation} - ERROR`, error);
    ErrorHandler.handle(error, res, `Failed to ${operation.toLowerCase()}`);
  }
}