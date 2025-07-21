import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { internationalSupplierContracts } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/contracts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Contract form validation schema
const contractSchema = z.object({
  supplierId: z.number(),
  contractNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  contractType: z.string().min(1),
  status: z.enum(['draft', 'active', 'expired', 'terminated']).default('draft'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().default('USD'),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  incoterms: z.string().optional(),
  notes: z.string().optional(),
});

// Get contracts for a supplier
router.get("/supplier/:supplierId", requireAuth, async (req: Request, res: Response) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const userId = (req as any).user.id;

    const contracts = await db
      .select()
      .from(internationalSupplierContracts)
      .where(
        and(
          eq(internationalSupplierContracts.supplierId, supplierId),
          eq(internationalSupplierContracts.userId, userId)
        )
      )
      .orderBy(internationalSupplierContracts.createdAt);

    res.json({ success: true, contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// Create new contract
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const validatedData = contractSchema.parse({...req.body, userId});

    const [contract] = await db
      .insert(internationalSupplierContracts)
      .values({
        ...validatedData,
        userId,
        documents: []
      })
      .returning();

    res.status(201).json({ success: true, contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Dados inválidos", details: error.errors });
    }
    console.error("Error creating contract:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// Update contract
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const validatedData = contractSchema.partial().parse(req.body);

    const [contract] = await db
      .update(internationalSupplierContracts)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(internationalSupplierContracts.id, contractId),
          eq(internationalSupplierContracts.userId, userId)
        )
      )
      .returning();

    if (!contract) {
      return res.status(404).json({ success: false, error: "Contrato não encontrado" });
    }

    res.json({ success: true, contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Dados inválidos", details: error.errors });
    }
    console.error("Error updating contract:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// Delete contract
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    const [contract] = await db
      .delete(internationalSupplierContracts)
      .where(
        and(
          eq(internationalSupplierContracts.id, contractId),
          eq(internationalSupplierContracts.userId, userId)
        )
      )
      .returning();

    if (!contract) {
      return res.status(404).json({ success: false, error: "Contrato não encontrado" });
    }

    res.json({ success: true, message: "Contrato excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// Upload document to contract
router.post("/:id/documents", requireAuth, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado" });
    }

    // Get current contract
    const [contract] = await db
      .select()
      .from(internationalSupplierContracts)
      .where(
        and(
          eq(internationalSupplierContracts.id, contractId),
          eq(internationalSupplierContracts.userId, userId)
        )
      );

    if (!contract) {
      return res.status(404).json({ success: false, error: "Contrato não encontrado" });
    }

    // Add document to contract
    const newDocument = {
      id: Date.now().toString(),
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: `/uploads/contracts/${file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    const updatedDocuments = [...(contract.documents as any[] || []), newDocument];

    const [updatedContract] = await db
      .update(internationalSupplierContracts)
      .set({
        documents: updatedDocuments,
        updatedAt: new Date()
      })
      .where(eq(internationalSupplierContracts.id, contractId))
      .returning();

    res.json({ success: true, document: newDocument, contract: updatedContract });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ success: false, error: "Erro ao fazer upload do documento" });
  }
});

// Remove document from contract
router.delete("/:id/documents/:documentId", requireAuth, async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id);
    const documentId = req.params.documentId;
    const userId = (req as any).user.id;

    // Get current contract
    const [contract] = await db
      .select()
      .from(internationalSupplierContracts)
      .where(
        and(
          eq(internationalSupplierContracts.id, contractId),
          eq(internationalSupplierContracts.userId, userId)
        )
      );

    if (!contract) {
      return res.status(404).json({ success: false, error: "Contrato não encontrado" });
    }

    // Remove document from contract
    const updatedDocuments = (contract.documents as any[] || []).filter(
      (doc: any) => doc.id !== documentId
    );

    const [updatedContract] = await db
      .update(internationalSupplierContracts)
      .set({
        documents: updatedDocuments,
        updatedAt: new Date()
      })
      .where(eq(internationalSupplierContracts.id, contractId))
      .returning();

    res.json({ success: true, contract: updatedContract });
  } catch (error) {
    console.error("Error removing document:", error);
    res.status(500).json({ success: false, error: "Erro ao remover documento" });
  }
});

export default router;