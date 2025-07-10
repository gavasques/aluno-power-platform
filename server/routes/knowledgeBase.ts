import express from 'express';
import { z } from 'zod';
import { KnowledgeBaseService } from '../services/KnowledgeBaseService.js';
import { requireAuth } from '../middleware/auth';

const router = express.Router();
const knowledgeBaseService = new KnowledgeBaseService();

// Apply auth middleware to all routes
router.use(requireAuth);

// Upload document
router.post('/documents/upload', knowledgeBaseService.getMulterConfig().single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, tags } = req.body;
    const userId = req.user!.id;

    const parsedTags = tags ? JSON.parse(tags) : [];
    
    const doc = await knowledgeBaseService.uploadDocument(
      userId,
      req.file,
      title || req.file.originalname,
      parsedTags
    );

    res.json(doc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/documents', async (req, res) => {
  try {
    const userId = req.user!.id;
    const docs = await knowledgeBaseService.getUserDocuments(userId);
    res.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/documents/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const docId = parseInt(req.params.id);
    
    const doc = await knowledgeBaseService.getDocument(userId, docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(doc);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const updateSchema = z.object({
      title: z.string().optional(),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    const updates = updateSchema.parse(req.body);
    const userId = req.user!.id;
    const docId = parseInt(req.params.id);
    
    const doc = await knowledgeBaseService.updateDocument(userId, docId, updates);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(doc);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const docId = parseInt(req.params.id);
    
    const success = await knowledgeBaseService.deleteDocument(userId, docId);
    if (!success) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Search documents
router.get('/documents/search/:query', async (req, res) => {
  try {
    const userId = req.user!.id;
    const query = req.params.query;
    
    const docs = await knowledgeBaseService.searchDocuments(userId, query);
    res.json(docs);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// Create collection
router.post('/collections', async (req, res) => {
  try {
    const collectionSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    });

    const data = collectionSchema.parse(req.body);
    const userId = req.user!.id;
    
    const collection = await knowledgeBaseService.createCollection(userId, data.name, data.description);
    res.json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get user collections
router.get('/collections', async (req, res) => {
  try {
    const userId = req.user!.id;
    const collections = await knowledgeBaseService.getUserCollections(userId);
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Add document to collection
router.post('/collections/:collectionId/documents/:docId', async (req, res) => {
  try {
    const userId = req.user!.id;
    const collectionId = parseInt(req.params.collectionId);
    const docId = parseInt(req.params.docId);
    
    const success = await knowledgeBaseService.addDocumentToCollection(userId, docId, collectionId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to add document to collection' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding document to collection:', error);
    res.status(500).json({ error: 'Failed to add document to collection' });
  }
});

// Remove document from collection
router.delete('/collections/:collectionId/documents/:docId', async (req, res) => {
  try {
    const userId = req.user!.id;
    const collectionId = parseInt(req.params.collectionId);
    const docId = parseInt(req.params.docId);
    
    const success = await knowledgeBaseService.removeDocumentFromCollection(userId, docId, collectionId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove document from collection' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing document from collection:', error);
    res.status(500).json({ error: 'Failed to remove document from collection' });
  }
});

export default router;