import { Request } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { 
  knowledgeBaseDocs, 
  knowledgeBaseCollections,
  knowledgeBaseDocCollections,
  insertKnowledgeBaseDocSchema,
  insertKnowledgeBaseCollectionSchema,
  insertKnowledgeBaseDocCollectionSchema,
  KnowledgeBaseDoc,
  KnowledgeBaseCollection,
  InsertKnowledgeBaseDoc,
  InsertKnowledgeBaseCollection
} from '../../shared/schema';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export class KnowledgeBaseService {
  private uploadsDir = 'uploads/knowledge-base';

  constructor() {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  // File upload configuration
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        await this.ensureUploadsDir();
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, TXT, MD, and DOCX files are allowed'));
        }
      }
    });
  }

  // Extract text content from uploaded file
  async extractTextContent(filePath: string, fileType: string): Promise<string> {
    try {
      if (fileType === 'text/plain' || fileType === 'text/markdown') {
        return await fs.readFile(filePath, 'utf-8');
      }
      
      if (fileType === 'application/pdf') {
        // For now, return placeholder - in production you'd use a PDF parser
        return 'PDF content extraction placeholder - implement with pdf-parse library';
      }
      
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For now, return placeholder - in production you'd use a DOCX parser
        return 'DOCX content extraction placeholder - implement with mammoth library';
      }
      
      return 'Unable to extract content from this file type';
    } catch (error) {
      console.error('Error extracting text content:', error);
      return 'Error extracting content from file';
    }
  }

  // Generate AI summary of document content
  async generateSummary(content: string): Promise<string> {
    // Placeholder for AI summary generation
    // In production, you'd call your AI provider here
    const preview = content.substring(0, 200);
    return `Summary: ${preview}${content.length > 200 ? '...' : ''}`;
  }

  // Document CRUD operations
  async uploadDocument(
    userId: number,
    file: Express.Multer.File,
    title: string,
    tags: string[] = []
  ): Promise<KnowledgeBaseDoc> {
    const content = await this.extractTextContent(file.path, file.mimetype);
    const summary = await this.generateSummary(content);

    const docData: InsertKnowledgeBaseDoc = {
      userId,
      title,
      filename: file.filename,
      originalFilename: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      content,
      summary,
      tags: tags,
    };

    const [doc] = await db.insert(knowledgeBaseDocs).values(docData).returning();
    return doc;
  }

  async getUserDocuments(userId: number): Promise<KnowledgeBaseDoc[]> {
    return await db
      .select()
      .from(knowledgeBaseDocs)
      .where(and(eq(knowledgeBaseDocs.userId, userId), eq(knowledgeBaseDocs.isActive, true)))
      .orderBy(desc(knowledgeBaseDocs.createdAt));
  }

  async getDocument(userId: number, docId: number): Promise<KnowledgeBaseDoc | null> {
    const [doc] = await db
      .select()
      .from(knowledgeBaseDocs)
      .where(and(
        eq(knowledgeBaseDocs.id, docId),
        eq(knowledgeBaseDocs.userId, userId),
        eq(knowledgeBaseDocs.isActive, true)
      ));
    
    return doc || null;
  }

  async updateDocument(
    userId: number,
    docId: number,
    updates: Partial<Pick<KnowledgeBaseDoc, 'title' | 'summary' | 'tags'>>
  ): Promise<KnowledgeBaseDoc | null> {
    const [doc] = await db
      .update(knowledgeBaseDocs)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(knowledgeBaseDocs.id, docId),
        eq(knowledgeBaseDocs.userId, userId)
      ))
      .returning();
    
    return doc || null;
  }

  async deleteDocument(userId: number, docId: number): Promise<boolean> {
    const doc = await this.getDocument(userId, docId);
    if (!doc) return false;

    // Delete file from filesystem
    try {
      await fs.unlink(doc.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Soft delete from database
    await db
      .update(knowledgeBaseDocs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(knowledgeBaseDocs.id, docId),
        eq(knowledgeBaseDocs.userId, userId)
      ));

    return true;
  }

  // Collection CRUD operations
  async createCollection(userId: number, name: string, description?: string): Promise<KnowledgeBaseCollection> {
    const collectionData: InsertKnowledgeBaseCollection = {
      userId,
      name,
      description,
    };

    const [collection] = await db.insert(knowledgeBaseCollections).values(collectionData).returning();
    return collection;
  }

  async getUserCollections(userId: number): Promise<KnowledgeBaseCollection[]> {
    return await db
      .select()
      .from(knowledgeBaseCollections)
      .where(eq(knowledgeBaseCollections.userId, userId))
      .orderBy(desc(knowledgeBaseCollections.createdAt));
  }

  async addDocumentToCollection(userId: number, docId: number, collectionId: number): Promise<boolean> {
    // Verify ownership
    const doc = await this.getDocument(userId, docId);
    if (!doc) return false;

    const [collection] = await db
      .select()
      .from(knowledgeBaseCollections)
      .where(and(
        eq(knowledgeBaseCollections.id, collectionId),
        eq(knowledgeBaseCollections.userId, userId)
      ));
    
    if (!collection) return false;

    try {
      await db.insert(knowledgeBaseDocCollections).values({
        docId,
        collectionId,
      });
      return true;
    } catch (error) {
      // Handle duplicate constraint
      return false;
    }
  }

  async removeDocumentFromCollection(userId: number, docId: number, collectionId: number): Promise<boolean> {
    // Verify ownership
    const doc = await this.getDocument(userId, docId);
    if (!doc) return false;

    await db
      .delete(knowledgeBaseDocCollections)
      .where(and(
        eq(knowledgeBaseDocCollections.docId, docId),
        eq(knowledgeBaseDocCollections.collectionId, collectionId)
      ));

    return true;
  }

  // Search functionality
  async searchDocuments(userId: number, query: string): Promise<KnowledgeBaseDoc[]> {
    // Simple text search - in production you'd use full-text search
    return await db
      .select()
      .from(knowledgeBaseDocs)
      .where(and(
        eq(knowledgeBaseDocs.userId, userId),
        eq(knowledgeBaseDocs.isActive, true),
        // Add text search condition here when implementing full-text search
      ))
      .orderBy(desc(knowledgeBaseDocs.createdAt));
  }
}