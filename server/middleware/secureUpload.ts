import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { sanitizeFilename } from '../security';

// Allowed file types with MIME type validation
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  
  // Text
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  
  // Archives (careful with these)
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
};

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB for images
  document: 25 * 1024 * 1024, // 25MB for documents
  archive: 50 * 1024 * 1024, // 50MB for archives
  default: 5 * 1024 * 1024 // 5MB default
};

// Get file type category
function getFileCategory(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('document') || mimetype.includes('pdf') || mimetype.includes('sheet')) return 'document';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'archive';
  return 'default';
}

// Validate file extension matches MIME type
function validateFileExtension(filename: string, mimetype: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allowedExts = ALLOWED_FILE_TYPES[mimetype as keyof typeof ALLOWED_FILE_TYPES];
  return allowedExts ? allowedExts.includes(ext) : false;
}

// Generate secure filename
function generateSecureFilename(originalname: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext);
  const sanitizedBase = sanitizeFilename(baseName);
  return `${sanitizedBase}-${timestamp}-${randomString}${ext}`;
}

// Create secure multer configuration
export function createSecureUpload(options: {
  destination?: string;
  allowedTypes?: string[];
  maxFileSize?: number;
  fieldName?: string;
  maxFiles?: number;
} = {}) {
  const {
    destination = 'uploads/',
    allowedTypes = Object.keys(ALLOWED_FILE_TYPES),
    maxFileSize = MAX_FILE_SIZES.default,
    fieldName = 'file',
    maxFiles = 1
  } = options;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    }
  });

  const fileFilter = function (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // Check if MIME type is allowed
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File type '${file.mimetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }

    // Validate file extension matches MIME type
    if (!validateFileExtension(file.originalname, file.mimetype)) {
      return cb(new Error('File extension does not match file type'));
    }

    // Check file size based on category
    const category = getFileCategory(file.mimetype);
    const categoryMaxSize = MAX_FILE_SIZES[category as keyof typeof MAX_FILE_SIZES] || maxFileSize;
    
    // Note: Size check happens after upload in multer, this is just for the category lookup
    (req as any).maxFileSize = Math.min(categoryMaxSize, maxFileSize);

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
      fields: 10, // Limit number of non-file fields
      fieldNameSize: 100, // Limit field name size
      fieldSize: 1024 * 1024, // 1MB limit for non-file fields
      headerPairs: 100 // Limit header pairs to prevent header bombing
    },
    preservePath: false // Don't preserve file paths from client
  });

  // Return appropriate upload middleware
  if (maxFiles === 1) {
    return upload.single(fieldName);
  } else {
    return upload.array(fieldName, maxFiles);
  }
}

// Specific upload configurations for different use cases
export const imageUpload = createSecureUpload({
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: MAX_FILE_SIZES.image,
  fieldName: 'image'
});

export const documentUpload = createSecureUpload({
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'text/markdown'
  ],
  maxFileSize: MAX_FILE_SIZES.document,
  fieldName: 'document'
});

export const supplierFileUpload = createSecureUpload({
  destination: 'uploads/suppliers/',
  maxFileSize: MAX_FILE_SIZES.document,
  fieldName: 'file',
  maxFiles: 10
});

// Generic secure upload with all allowed types
export const genericUpload = createSecureUpload();