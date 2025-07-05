import crypto from 'crypto';

// Encryption configuration
const algorithm = 'aes-256-gcm';
const saltLength = 32;
const tagLength = 16;
const ivLength = 16;
const iterations = 100000;
const keyLength = 32;

// Get encryption key from environment or generate a default one
const getEncryptionKey = (): string => {
  // In production, this should come from environment variables
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
};

export class EncryptionService {
  private static key = getEncryptionKey();

  /**
   * Encrypts a string using AES-256-GCM
   */
  static encrypt(text: string): string {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(this.key, 'hex'), iv);
      
      // Encrypt data
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV + authTag + encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      // Return base64 encoded string
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts a string encrypted with AES-256-GCM
   */
  static decrypt(encryptedText: string): string {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedText, 'base64');
      
      // Extract IV, auth tag, and encrypted data
      const iv = combined.slice(0, ivLength);
      const authTag = combined.slice(ivLength, ivLength + tagLength);
      const encrypted = combined.slice(ivLength + tagLength);
      
      // Create decipher with explicit auth tag length
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(this.key, 'hex'), iv, { authTagLength: tagLength });
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hashes a string using SHA-256
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generates a cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Derives a key from a password using PBKDF2
   */
  static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  }

  /**
   * Generates a random salt
   */
  static generateSalt(): Buffer {
    return crypto.randomBytes(saltLength);
  }
}