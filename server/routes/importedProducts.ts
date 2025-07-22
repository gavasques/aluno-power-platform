import { Express, Request, Response } from 'express';
import { db } from '../db';
import { importedProducts, productPackages, productFiles, productNotes, suppliers } from '../../shared/schema';
import { eq, and, desc, asc, ilike, or, sql } from 'drizzle-orm';
import { requireAuth } from '../security';
import { z } from 'zod';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/imported-products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Schemas de validação
const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  internalCode: z.string().min(1, 'Código interno é obrigatório'),
  status: z.enum(['research', 'analysis', 'negotiation', 'ordered', 'shipped', 'arrived', 'cancelled']).default('research'),
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  technicalSpecifications: z.string().optional(),
  hasMultiplePackages: z.boolean().default(false),
  totalPackages: z.number().int().min(1).default(1),
  hsCode: z.string().optional(),
  ipiPercentage: z.number().optional(),
  productEan: z.string().optional(),
  productUpc: z.string().optional(),
  internalBarcode: z.string().optional(),
  customsDescription: z.string().optional(),
  supplierId: z.number().optional(),
  supplierProductCode: z.string().optional(),
  supplierProductName: z.string().optional(),
  supplierDescription: z.string().optional(),
  moq: z.number().int().optional(),
  leadTimeDays: z.number().int().optional(),
  notes: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const createPackageSchema = z.object({
  packageNumber: z.number().int().min(1),
  packageType: z.string().min(1, 'Tipo de embalagem é obrigatório'),
  contentsDescription: z.string().optional(),
  packageEan: z.string().optional(),
  dimensionsLength: z.number().optional(),
  dimensionsWidth: z.number().optional(),
  dimensionsHeight: z.number().optional(),
  weightGross: z.number().optional(),
  weightNet: z.number().optional(),
  volumeCbm: z.number().optional(),
  unitsInPackage: z.number().int().min(1).default(1),
  packagingMaterial: z.string().optional(),
  specialHandling: z.string().optional(),
});

const createNoteSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  isImportant: z.boolean().default(false),
});

export function registerImportedProductsRoutes(app: Express) {
  
  // =====================================================
  // ROTAS DE PRODUTOS IMPORTADOS
  // =====================================================

  // Listar produtos do usuário
  app.get('/api/imported-products', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { 
        page = '1', 
        limit = '10', 
        search = '', 
        status = '', 
        category = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Construir filtros
      const filters = [eq(importedProducts.userId, userId)];
      
      if (search) {
        filters.push(
          or(
            ilike(importedProducts.name, `%${search}%`),
            ilike(importedProducts.internalCode, `%${search}%`),
            ilike(importedProducts.description, `%${search}%`)
          )!
        );
      }
      
      if (status) {
        filters.push(eq(importedProducts.status, status as string));
      }
      
      if (category) {
        filters.push(eq(importedProducts.category, category as string));
      }

      // Definir ordenação
      const orderBy = sortOrder === 'asc' 
        ? asc(importedProducts[sortBy as keyof typeof importedProducts] as any)
        : desc(importedProducts[sortBy as keyof typeof importedProducts] as any);

      // Buscar produtos com fornecedor
      const products = await db
        .select({
          id: importedProducts.id,
          name: importedProducts.name,
          internalCode: importedProducts.internalCode,
          status: importedProducts.status,
          description: importedProducts.description,
          category: importedProducts.category,
          brand: importedProducts.brand,
          model: importedProducts.model,
          hasMultiplePackages: importedProducts.hasMultiplePackages,
          totalPackages: importedProducts.totalPackages,
          supplierId: importedProducts.supplierId,
          supplierName: suppliers.name,
          supplierProductCode: importedProducts.supplierProductCode,
          moq: importedProducts.moq,
          leadTimeDays: importedProducts.leadTimeDays,
          createdAt: importedProducts.createdAt,
          updatedAt: importedProducts.updatedAt,
        })
        .from(importedProducts)
        .leftJoin(suppliers, eq(importedProducts.supplierId, suppliers.id))
        .where(and(...filters))
        .orderBy(orderBy)
        .limit(parseInt(limit as string))
        .offset(offset);

      // Contar total para paginação
      const [{ count }] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(importedProducts)
        .where(and(...filters));

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar produtos importados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Buscar produto específico
  app.get('/api/imported-products/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Buscar produto com fornecedor, embalagens, arquivos e notas
      const [product] = await db
        .select()
        .from(importedProducts)
        .leftJoin(suppliers, eq(importedProducts.supplierId, suppliers.id))
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      // Buscar embalagens
      const packages = await db
        .select()
        .from(productPackages)
        .where(eq(productPackages.productId, id))
        .orderBy(asc(productPackages.packageNumber));

      // Buscar arquivos
      const files = await db
        .select()
        .from(productFiles)
        .where(eq(productFiles.productId, id))
        .orderBy(desc(productFiles.isMainImage), asc(productFiles.sortOrder));

      // Buscar notas
      const notes = await db
        .select()
        .from(productNotes)
        .where(eq(productNotes.productId, id))
        .orderBy(desc(productNotes.isImportant), desc(productNotes.createdAt));

      res.json({
        success: true,
        data: {
          ...product.imported_products,
          supplier: product.suppliers,
          packages,
          files,
          notes
        }
      });

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Criar novo produto
  app.post('/api/imported-products', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const validatedData = createProductSchema.parse(req.body);

      const [newProduct] = await db
        .insert(importedProducts)
        .values({
          ...validatedData,
          userId,
          id: uuidv4(),
        })
        .returning();

      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Produto criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Atualizar produto
  app.put('/api/imported-products/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      // Verificar se o produto existe e pertence ao usuário
      const [existingProduct] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const [updatedProduct] = await db
        .update(importedProducts)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(importedProducts.id, id))
        .returning();

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Produto atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Deletar produto
  app.delete('/api/imported-products/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Verificar se o produto existe e pertence ao usuário
      const [existingProduct] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      // Deletar registros relacionados primeiro
      await db.delete(productNotes).where(eq(productNotes.productId, id));
      await db.delete(productFiles).where(eq(productFiles.productId, id));
      await db.delete(productPackages).where(eq(productPackages.productId, id));
      
      // Deletar o produto
      await db.delete(importedProducts).where(eq(importedProducts.id, id));

      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // ROTAS DE EMBALAGENS
  // =====================================================

  // Listar embalagens do produto
  app.get('/api/imported-products/:id/packages', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Verificar se o produto pertence ao usuário
      const [product] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const packages = await db
        .select()
        .from(productPackages)
        .where(eq(productPackages.productId, id))
        .orderBy(asc(productPackages.packageNumber));

      res.json({
        success: true,
        data: packages
      });

    } catch (error) {
      console.error('Erro ao buscar embalagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Criar nova embalagem
  app.post('/api/imported-products/:id/packages', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const validatedData = createPackageSchema.parse(req.body);

      // Verificar se o produto pertence ao usuário
      const [product] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const [newPackage] = await db
        .insert(productPackages)
        .values({
          ...validatedData,
          productId: id,
          id: uuidv4(),
        })
        .returning();

      res.status(201).json({
        success: true,
        data: newPackage,
        message: 'Embalagem criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar embalagem:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Atualizar embalagem
  app.put('/api/packages/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const validatedData = createPackageSchema.partial().parse(req.body);

      // Verificar se a embalagem pertence a um produto do usuário
      const [packageWithProduct] = await db
        .select({
          package: productPackages,
          product: importedProducts
        })
        .from(productPackages)
        .innerJoin(importedProducts, eq(productPackages.productId, importedProducts.id))
        .where(and(
          eq(productPackages.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!packageWithProduct) {
        return res.status(404).json({
          success: false,
          error: 'Embalagem não encontrada'
        });
      }

      const [updatedPackage] = await db
        .update(productPackages)
        .set(validatedData)
        .where(eq(productPackages.id, id))
        .returning();

      res.json({
        success: true,
        data: updatedPackage,
        message: 'Embalagem atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar embalagem:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Deletar embalagem
  app.delete('/api/packages/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Verificar se a embalagem pertence a um produto do usuário
      const [packageWithProduct] = await db
        .select({
          package: productPackages,
          product: importedProducts
        })
        .from(productPackages)
        .innerJoin(importedProducts, eq(productPackages.productId, importedProducts.id))
        .where(and(
          eq(productPackages.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!packageWithProduct) {
        return res.status(404).json({
          success: false,
          error: 'Embalagem não encontrada'
        });
      }

      await db.delete(productPackages).where(eq(productPackages.id, id));

      res.json({
        success: true,
        message: 'Embalagem deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar embalagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // ROTAS DE ARQUIVOS
  // =====================================================

  // Upload de arquivos
  app.post('/api/imported-products/:id/files', requireAuth, upload.array('files', 10), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
      }

      // Verificar se o produto pertence ao usuário
      const [product] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      // Processar cada arquivo
      const uploadedFiles = [];
      for (const file of files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'document';
        
        const [newFile] = await db
          .insert(productFiles)
          .values({
            id: uuidv4(),
            productId: id,
            fileType,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            description: req.body.description || '',
            isMainImage: fileType === 'image' && req.body.isMainImage === 'true',
            sortOrder: 0,
          })
          .returning();

        uploadedFiles.push(newFile);
      }

      res.status(201).json({
        success: true,
        data: uploadedFiles,
        message: `${files.length} arquivo(s) enviado(s) com sucesso`
      });

    } catch (error) {
      console.error('Erro ao fazer upload de arquivos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // ROTAS DE NOTAS
  // =====================================================

  // Criar nova nota
  app.post('/api/imported-products/:id/notes', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const validatedData = createNoteSchema.parse(req.body);

      // Verificar se o produto pertence ao usuário
      const [product] = await db
        .select()
        .from(importedProducts)
        .where(and(
          eq(importedProducts.id, id),
          eq(importedProducts.userId, userId)
        ));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const [newNote] = await db
        .insert(productNotes)
        .values({
          ...validatedData,
          productId: id,
          id: uuidv4(),
        })
        .returning();

      res.status(201).json({
        success: true,
        data: newNote,
        message: 'Nota criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar nota:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // ROTAS DE INTEGRAÇÃO
  // =====================================================

  // Buscar fornecedores para vinculação
  app.get('/api/suppliers/search', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { search = '', limit = '10' } = req.query;

      const searchFilters = [eq(suppliers.userId, userId)];
      
      if (search) {
        searchFilters.push(
          or(
            ilike(suppliers.name, `%${search}%`),
            ilike(suppliers.companyName, `%${search}%`)
          )!
        );
      }

      const foundSuppliers = await db
        .select({
          id: suppliers.id,
          name: suppliers.name,
          companyName: suppliers.companyName,
          country: suppliers.country,
          email: suppliers.email,
        })
        .from(suppliers)
        .where(and(...searchFilters))
        .limit(parseInt(limit as string))
        .orderBy(asc(suppliers.name));

      res.json({
        success: true,
        data: foundSuppliers
      });

    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });
}