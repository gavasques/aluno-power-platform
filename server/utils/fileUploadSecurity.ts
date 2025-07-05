import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

// File upload security configuration
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Allowed file types with their MIME types and magic numbers
const ALLOWED_FILE_TYPES = {
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    magicNumbers: ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2']
  },
  'image/png': {
    extensions: ['.png'],
    magicNumbers: ['89504e47']
  },
  'image/webp': {
    extensions: ['.webp'],
    magicNumbers: ['52494646']
  },
  'image/gif': {
    extensions: ['.gif'],
    magicNumbers: ['47494638']
  },
  'application/pdf': {
    extensions: ['.pdf'],
    magicNumbers: ['25504446']
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['.docx'],
    magicNumbers: ['504b0304']
  },
  'application/msword': {
    extensions: ['.doc'],
    magicNumbers: ['d0cf11e0']
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extensions: ['.xlsx'],
    magicNumbers: ['504b0304']
  },
  'application/vnd.ms-excel': {
    extensions: ['.xls'],
    magicNumbers: ['d0cf11e0']
  },
  'text/plain': {
    extensions: ['.txt'],
    magicNumbers: null // Text files don't have magic numbers
  }
};

// Generate secure filename
export const generateSecureFilename = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomStr}${ext}`;
};

// Validate file extension
const validateFileExtension = (filename: string, mimeType: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  const allowedType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  
  if (!allowedType) return false;
  return allowedType.extensions.includes(ext);
};

// Validate file magic number (file signature)
const validateFileMagicNumber = async (buffer: Buffer, mimeType: string): Promise<boolean> => {
  const allowedType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  
  if (!allowedType || !allowedType.magicNumbers) {
    // For text files, we don't check magic numbers
    return mimeType === 'text/plain';
  }
  
  // Read first 8 bytes of the file
  const fileSignature = buffer.slice(0, 8).toString('hex');
  
  // Check if file signature matches any of the allowed magic numbers
  return allowedType.magicNumbers.some((magic: string) => fileSignature.startsWith(magic));
};

// Scan file for malicious content (basic implementation)
const scanFileContent = async (buffer: Buffer, mimeType: string): Promise<boolean> => {
  try {
    // For images, use sharp to validate and potentially re-encode
    if (mimeType.startsWith('image/')) {
      // Try to process the image with sharp - if it fails, the image is likely corrupted or malicious
      const metadata = await sharp(buffer).metadata();
      
      // Check for reasonable image dimensions
      if (metadata.width && metadata.height) {
        if (metadata.width > 10000 || metadata.height > 10000) {
          console.error('Image dimensions too large:', metadata.width, 'x', metadata.height);
          return false;
        }
      }
    }
    
    // Check for common script patterns in the file
    const fileContent = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const suspiciousPatterns = [
      /<script[\s>]/i,
      /javascript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fileContent)) {
        console.error('Suspicious pattern detected in file:', pattern);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error scanning file content:', error);
    return false;
  }
};

// Create secure multer configuration
export const createSecureMulterConfig = (options: {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
}) => {
  const {
    maxFileSize = MAX_FILE_SIZE,
    allowedMimeTypes = Object.keys(ALLOWED_FILE_TYPES),
    destination = 'uploads'
  } = options;

  return multer({
    storage: multer.memoryStorage(), // Use memory storage for security scanning
    limits: {
      fileSize: maxFileSize,
      files: 1 // Limit to single file upload for security
    },
    fileFilter: (req, file, cb) => {
      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
      }
      
      // Check file extension
      if (!validateFileExtension(file.originalname, file.mimetype)) {
        return cb(new Error('File extension does not match MIME type'));
      }
      
      cb(null, true);
    }
  });
};

// Middleware to validate uploaded file
export const validateUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next();
    }
    
    const file = req.file;
    
    // Validate magic number
    const isValidMagicNumber = await validateFileMagicNumber(file.buffer, file.mimetype);
    if (!isValidMagicNumber) {
      return res.status(400).json({ error: 'Invalid file format detected' });
    }
    
    // Scan file content for malicious patterns
    const isSafe = await scanFileContent(file.buffer, file.mimetype);
    if (!isSafe) {
      return res.status(400).json({ error: 'File contains potentially malicious content' });
    }
    
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname);
    
    // Add secure filename to request
    req.file.secureFilename = secureFilename;
    
    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ error: 'File validation failed' });
  }
};

// Save uploaded file securely
export const saveUploadedFile = async (
  file: Express.Multer.File,
  destination: string
): Promise<string> => {
  try {
    // Ensure destination directory exists
    await fs.mkdir(destination, { recursive: true });
    
    // Use secure filename
    const filename = file.secureFilename || generateSecureFilename(file.originalname);
    const filepath = path.join(destination, filename);
    
    // If it's an image, process it with sharp for additional security
    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .rotate() // Auto-rotate based on EXIF data
        .toFile(filepath);
    } else {
      // For non-images, save directly
      await fs.writeFile(filepath, file.buffer);
    }
    
    return filepath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
};

// Clean filename for display (remove special characters)
export const sanitizeFilename = (filename: string): string => {
  // Remove any path components
  const basename = path.basename(filename);
  
  // Replace special characters with underscores
  return basename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Add to Express Request type
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        secureFilename?: string;
      }
    }
  }
}