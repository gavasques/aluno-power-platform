import { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
      };
      sessionId?: string;
      file?: Express.Multer.File;
    }
  }
}

// Express types extension for proper Request/Response typing
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
    };
    sessionId?: string;
  }
}