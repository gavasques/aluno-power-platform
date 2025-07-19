import { Request, Response } from 'express';
import { db } from '../db';
import { supplierProducts, products } from '../../shared/schema';
import { eq, and, like, or, isNull, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
    username: string;
  };
}

// Schema de validação para criação/atualização de produto do fornecedor
const supplierProductSchema = z.object({
  supplierSku: z.string().min(1, 'SKU é obrigatório'),
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  description: z.string().optional(),
  cost: z.number().positive().optional(),
  leadTime: z.number().int().positive().optional(),
  minimumOrderQuantity: z.number().int().positive().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para importação CSV
const csvRowSchema = z.object({
  supplierSku: z.string().min(1),
  productName: z.string().min(1),
  description: z.string().optional(),
  cost: z.string().transform(val => val ? parseFloat(val) : undefined),
  leadTime: z.string().transform(val => val ? parseInt(val) : undefined),
  minimumOrderQuantity: z.string().transform(val => val ? parseInt(val) : undefined),
  category: z.string().optional(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export class SupplierProductsController {
  // Listar todos os produtos de um fornecedor
  static async getSupplierProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId } = req.params;
      const userId = req.user?.id;
      const { search, status } = req.query;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      // Construir query com filtros
      let whereConditions = and(
        eq(supplierProducts.supplierId, parseInt(supplierId)),
        eq(supplierProducts.userId, userId),
        eq(supplierProducts.active, true)
      );

      // Filtro por status
      if (status && typeof status === 'string') {
        whereConditions = and(whereConditions, eq(supplierProducts.linkStatus, status));
      }

      let query = db
        .select({
          id: supplierProducts.id,
          supplierSku: supplierProducts.supplierSku,
          productName: supplierProducts.productName,
          description: supplierProducts.description,
          cost: supplierProducts.cost,
          leadTime: supplierProducts.leadTime,
          minimumOrderQuantity: supplierProducts.minimumOrderQuantity,
          category: supplierProducts.category,
          brand: supplierProducts.brand,
          linkStatus: supplierProducts.linkStatus,
          notes: supplierProducts.notes,
          createdAt: supplierProducts.createdAt,
          updatedAt: supplierProducts.updatedAt,
          // Dados do produto vinculado (se existir)
          linkedProduct: {
            id: products.id,
            name: products.name,
            sku: products.sku,
          }
        })
        .from(supplierProducts)
        .leftJoin(products, eq(supplierProducts.productId, products.id))
        .where(whereConditions);

      let results = await query;

      // Filtro de busca por texto (aplicado após a query)
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        results = results.filter(item => 
          item.supplierSku.toLowerCase().includes(searchTerm) ||
          item.productName.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm)) ||
          (item.brand && item.brand.toLowerCase().includes(searchTerm))
        );
      }

      // Separar por status para estatísticas
      const stats = {
        total: results.length,
        linked: results.filter(p => p.linkStatus === 'linked').length,
        pending: results.filter(p => p.linkStatus === 'pending').length,
        notFound: results.filter(p => p.linkStatus === 'not_found').length,
      };

      res.json({
        success: true,
        message: 'Produtos do fornecedor listados com sucesso',
        data: results,
        stats,
      });
    } catch (error) {
      console.error('Erro ao listar produtos do fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Criar produto do fornecedor
  static async createSupplierProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const validatedData = supplierProductSchema.parse(req.body);

      // Verificar se já existe produto com esse SKU para este fornecedor
      const existing = await db
        .select()
        .from(supplierProducts)
        .where(
          and(
            eq(supplierProducts.supplierId, parseInt(supplierId)),
            eq(supplierProducts.supplierSku, validatedData.supplierSku),
            eq(supplierProducts.active, true)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um produto com este SKU para este fornecedor',
        });
      }

      // Tentar encontrar produto existente no sistema
      const linkedProduct = await this.findLinkedProduct(validatedData);

      const newProduct = await db
        .insert(supplierProducts)
        .values({
          supplierId: parseInt(supplierId),
          userId,
          productId: linkedProduct?.id || null,
          linkStatus: linkedProduct ? 'linked' : 'pending',
          ...validatedData,
        })
        .returning();

      res.status(201).json({
        success: true,
        message: 'Produto do fornecedor criado com sucesso',
        data: newProduct[0],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
        });
      }

      console.error('Erro ao criar produto do fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Atualizar produto do fornecedor
  static async updateSupplierProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId, productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const validatedData = supplierProductSchema.partial().parse(req.body);

      // Verificar se o produto existe e pertence ao usuário
      const existing = await db
        .select()
        .from(supplierProducts)
        .where(
          and(
            eq(supplierProducts.id, parseInt(productId)),
            eq(supplierProducts.supplierId, parseInt(supplierId)),
            eq(supplierProducts.userId, userId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado',
        });
      }

      // Se mudou o SKU, verificar duplicatas
      if (validatedData.supplierSku && validatedData.supplierSku !== existing[0].supplierSku) {
        const duplicate = await db
          .select()
          .from(supplierProducts)
          .where(
            and(
              eq(supplierProducts.supplierId, parseInt(supplierId)),
              eq(supplierProducts.supplierSku, validatedData.supplierSku),
              eq(supplierProducts.active, true)
            )
          )
          .limit(1);

        if (duplicate.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um produto com este SKU para este fornecedor',
          });
        }
      }

      // Tentar encontrar produto vinculado se dados mudaram
      let updateData = { ...validatedData, updatedAt: new Date() };
      if (validatedData.supplierSku || validatedData.productName) {
        const linkedProduct = await this.findLinkedProduct({
          ...existing[0],
          ...validatedData,
        });
        
        updateData.productId = linkedProduct?.id || null;
        updateData.linkStatus = linkedProduct ? 'linked' : 'pending';
      }

      const updated = await db
        .update(supplierProducts)
        .set(updateData)
        .where(eq(supplierProducts.id, parseInt(productId)))
        .returning();

      res.json({
        success: true,
        message: 'Produto do fornecedor atualizado com sucesso',
        data: updated[0],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
        });
      }

      console.error('Erro ao atualizar produto do fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Deletar produto do fornecedor
  static async deleteSupplierProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId, productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      await db
        .update(supplierProducts)
        .set({ active: false, updatedAt: new Date() })
        .where(
          and(
            eq(supplierProducts.id, parseInt(productId)),
            eq(supplierProducts.supplierId, parseInt(supplierId)),
            eq(supplierProducts.userId, userId)
          )
        );

      res.json({
        success: true,
        message: 'Produto do fornecedor removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar produto do fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Importar produtos via Excel
  static async importProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo Excel é obrigatório',
        });
      }

      // Ler arquivo Excel
      const workbook = XLSX.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Arquivo Excel vazio ou formato inválido' 
        });
      }

      const results = {
        created: 0,
        updated: 0,
        linked: 0,
        errors: [] as string[]
      };

      for (const row of data as any[]) {
        try {
          // Validar campos obrigatórios
          if (!row.supplierSku || !row.productName) {
            results.errors.push(`Linha ignorada: SKU ou Nome do produto em branco`);
            continue;
          }

          // Verificar se já existe um produto com este SKU para este fornecedor
          const existingProduct = await db
            .select()
            .from(supplierProducts)
            .where(
              and(
                eq(supplierProducts.supplierId, parseInt(supplierId)),
                eq(supplierProducts.supplierSku, row.supplierSku),
                eq(supplierProducts.active, true)
              )
            )
            .limit(1);

          const productData = {
            supplierId: parseInt(supplierId),
            userId,
            supplierSku: row.supplierSku,
            productName: row.productName,
            cost: row.cost ? parseFloat(row.cost.toString()) : null,
            leadTime: row.leadTime ? parseInt(row.leadTime.toString()) : null,
            minimumOrderQuantity: row.minimumOrderQuantity ? parseInt(row.minimumOrderQuantity.toString()) : null,
            masterBox: row.masterBox ? parseInt(row.masterBox.toString()) : null,
            linkStatus: 'pending' as const,
            active: true
          };

          if (existingProduct.length > 0) {
            // Atualizar produto existente
            await db
              .update(supplierProducts)
              .set({
                ...productData,
                updatedAt: new Date()
              })
              .where(eq(supplierProducts.id, existingProduct[0].id));
            results.updated++;
          } else {
            // Criar novo produto
            await db.insert(supplierProducts).values(productData);
            results.created++;
          }

          // Tentar vincular com produto existente no sistema
          const systemProduct = await db
            .select()
            .from(products)
            .where(
              and(
                eq(products.userId, userId),
                or(
                  eq(products.sku, row.supplierSku),
                  like(products.name, `%${row.productName}%`)
                )
              )
            )
            .limit(1);

          if (systemProduct.length > 0) {
            // Vincular produto
            await db
              .update(supplierProducts)
              .set({
                productId: systemProduct[0].id,
                linkStatus: 'linked'
              })
              .where(
                and(
                  eq(supplierProducts.supplierId, parseInt(supplierId)),
                  eq(supplierProducts.supplierSku, row.supplierSku)
                )
              );
            results.linked++;
          }

        } catch (rowError) {
          console.error('Error processing row:', rowError);
          results.errors.push(`Erro na linha com SKU ${row.supplierSku}: ${(rowError as Error).message}`);
        }
      }

      res.json({
        success: true,
        message: 'Importação concluída com sucesso',
        data: results,
      });
    } catch (error) {
      console.error('Erro na importação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Sincronizar produtos existentes
  static async syncProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      // Buscar produtos pendentes
      const pendingProducts = await db
        .select()
        .from(supplierProducts)
        .where(
          and(
            eq(supplierProducts.supplierId, parseInt(supplierId)),
            eq(supplierProducts.userId, userId),
            eq(supplierProducts.linkStatus, 'pending'),
            eq(supplierProducts.active, true)
          )
        );

      let linkedCount = 0;

      for (const supplierProduct of pendingProducts) {
        const linkedProduct = await this.findLinkedProduct(supplierProduct);
        
        if (linkedProduct) {
          await db
            .update(supplierProducts)
            .set({
              productId: linkedProduct.id,
              linkStatus: 'linked',
              updatedAt: new Date(),
            })
            .where(eq(supplierProducts.id, supplierProduct.id));
          
          linkedCount++;
        }
      }

      res.json({
        success: true,
        message: `Sincronização concluída. ${linkedCount} produtos foram vinculados.`,
        data: { linkedCount, totalPending: pendingProducts.length },
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Método auxiliar para encontrar produto vinculado
  private static async findLinkedProduct(supplierProduct: any) {
    try {
      // Buscar por SKU exato
      let linkedProduct = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.sku, supplierProduct.supplierSku),
            eq(products.active, true)
          )
        )
        .limit(1);

      if (linkedProduct.length > 0) {
        return linkedProduct[0];
      }

      // Buscar por nome similar
      linkedProduct = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.name, `%${supplierProduct.productName}%`),
            eq(products.active, true)
          )
        )
        .limit(1);

      return linkedProduct.length > 0 ? linkedProduct[0] : null;
    } catch (error) {
      console.error('Erro ao buscar produto vinculado:', error);
      return null;
    }
  }
}