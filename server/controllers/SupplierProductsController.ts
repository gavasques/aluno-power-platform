import { Request, Response } from 'express';
import { db } from '../db';
import { supplierProducts, products } from '../../shared/schema';
import { eq, and, like, or, isNull, isNotNull, desc, count, ilike } from 'drizzle-orm';
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
  cost: z.number().positive().nullable().optional(),
  leadTime: z.number().int().positive().nullable().optional(),
  minimumOrderQuantity: z.number().int().positive().nullable().optional(),
  masterBox: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).nullable().optional(),
});

// Schema para importação Excel
const excelRowSchema = z.object({
  supplierSku: z.string().min(1),
  productName: z.string().min(1),
  cost: z.string().transform(val => val ? parseFloat(val) : null),
  leadTime: z.string().transform(val => val ? parseInt(val) : null),
  minimumOrderQuantity: z.string().transform(val => val ? parseInt(val) : null),
  masterBox: z.string().transform(val => val ? parseInt(val) : null),
  stock: z.string().transform(val => val ? parseInt(val) : null),
});

export class SupplierProductsController {
  // Listar todos os produtos de um fornecedor com paginação
  static async getSupplierProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { supplierId } = req.params;
      const userId = req.user?.id;
      const { search, status, page = '1', limit = '50' } = req.query;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      // Construir query com filtros otimizada
      let whereConditions = and(
        eq(supplierProducts.supplierId, parseInt(supplierId)),
        eq(supplierProducts.userId, userId),
        eq(supplierProducts.active, true)
      );

      // Filtro por status
      if (status && typeof status === 'string') {
        whereConditions = and(whereConditions, eq(supplierProducts.linkStatus, status));
      }

      // Filtro de busca otimizado no banco (ILIKE para performance)
      if (search && typeof search === 'string') {
        const searchTerm = `%${search}%`;
        whereConditions = and(
          whereConditions,
          or(
            ilike(supplierProducts.supplierSku, searchTerm),
            ilike(supplierProducts.productName, searchTerm)
          )
        );
      }

      // Calcular total primeiro (query otimizada)
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(supplierProducts)
        .where(whereConditions);

      const totalItems = Number(totalCount);
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const totalPages = Math.ceil(totalItems / limitNum);
      
      // Aplicar paginação no banco (MUITO mais eficiente)
      const offset = (pageNum - 1) * limitNum;

      const results = await db
        .select({
          id: supplierProducts.id,
          supplierSku: supplierProducts.supplierSku,
          productName: supplierProducts.productName,
          cost: supplierProducts.cost,
          leadTime: supplierProducts.leadTime,
          minimumOrderQuantity: supplierProducts.minimumOrderQuantity,
          masterBox: supplierProducts.masterBox,
          stock: supplierProducts.stock,
          linkStatus: supplierProducts.linkStatus,
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
        .where(whereConditions)
        .orderBy(desc(supplierProducts.updatedAt))
        .limit(limitNum)
        .offset(offset);

      const paginatedResults = results;

      // Calcular estatísticas em paralelo com a query principal (SUPER OTIMIZADO)
      const statsPromise = db
        .select({
          linkStatus: supplierProducts.linkStatus,
          count: count()
        })
        .from(supplierProducts)
        .where(and(
          eq(supplierProducts.supplierId, parseInt(supplierId)),
          eq(supplierProducts.userId, userId),
          eq(supplierProducts.active, true)
        ))
        .groupBy(supplierProducts.linkStatus);

      // Executar stats em paralelo enquanto processa paginação
      const [statsResults] = await Promise.all([statsPromise]);
      
      const stats = {
        total: totalItems,
        linked: Number(statsResults.find(s => s.linkStatus === 'linked')?.count || 0),
        pending: Number(statsResults.find(s => s.linkStatus === 'pending')?.count || 0),
        notFound: Number(statsResults.find(s => s.linkStatus === 'not_found')?.count || 0),
      };

      // Metadados de paginação
      const pagination = {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      };

      res.json({
        success: true,
        message: 'Produtos do fornecedor listados com sucesso',
        data: paginatedResults,
        stats,
        pagination
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
          message: 'Já existe um produto com este código para este fornecedor',
        });
      }

      const newProduct = await db
        .insert(supplierProducts)
        .values({
          supplierId: parseInt(supplierId),
          userId,
          productId: null,
          linkStatus: 'pending',
          supplierSku: validatedData.supplierSku,
          productName: validatedData.productName,
          cost: validatedData.cost,
          leadTime: validatedData.leadTime,
          minimumOrderQuantity: validatedData.minimumOrderQuantity,
          masterBox: validatedData.masterBox,
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

      // Atualizar produto mantendo status atual de link
      let updateData = { 
        ...validatedData, 
        updatedAt: new Date(),
        // Manter linkStatus atual se não foi especificado
        linkStatus: existing[0].linkStatus || 'pending'
      };

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
          // Mapear campos do Excel (aceitar tanto formato antigo quanto novo)
          const supplierSku = row.cod_prod_fornecedor || row.supplierSku;
          const productName = row.nome || row.productName;
          const cost = row.custo || row.cost;
          const leadTime = row.lead_time || row.leadTime;
          const minimumOrderQuantity = row.quantidade_minima || row.minimumOrderQuantity;
          const masterBox = row.caixa_master || row.masterBox;
          const stock = row.estoque || row.stock;
          const linkedSku = row.sku_vinculado || row.linkedSku; // NOVO CAMPO para vinculação automática

          // Validar campos obrigatórios
          if (!supplierSku || !productName) {
            results.errors.push(`Linha ignorada: Código ou Nome do produto em branco`);
            continue;
          }

          // Verificar se já existe um produto com este código para este fornecedor
          const existingProduct = await db
            .select()
            .from(supplierProducts)
            .where(
              and(
                eq(supplierProducts.supplierId, parseInt(supplierId)),
                eq(supplierProducts.supplierSku, supplierSku),
                eq(supplierProducts.active, true)
              )
            )
            .limit(1);

          // VINCULAÇÃO AUTOMÁTICA BASEADA EM sku_vinculado do Excel
          let systemProduct = null;
          let linkStatusResult = 'pending';
          let productIdResult = null;

          if (linkedSku && linkedSku.trim()) {
            // 1. PRIORIDADE: Se fornecido sku_vinculado, buscar exatamente por esse SKU
            systemProduct = await db
              .select()
              .from(products)
              .where(
                and(
                  eq(products.userId, userId),
                  eq(products.sku, linkedSku.trim())
                )
              )
              .limit(1);

            if (systemProduct.length > 0) {
              linkStatusResult = 'linked';
              productIdResult = systemProduct[0].id;
              results.linked++;
            } else {
              // SKU fornecido mas não encontrado no sistema
              results.errors.push(`SKU vinculado '${linkedSku}' não encontrado no sistema para produto '${supplierSku}'`);
              linkStatusResult = 'not_found';
            }
          } else {
            // 2. FALLBACK: Tentar vinculação automática por SKU ou nome similar
            systemProduct = await db
              .select()
              .from(products)
              .where(
                and(
                  eq(products.userId, userId),
                  or(
                    eq(products.sku, supplierSku),
                    like(products.name, `%${productName}%`)
                  )
                )
              )
              .limit(1);

            if (systemProduct.length > 0) {
              linkStatusResult = 'linked';
              productIdResult = systemProduct[0].id;
              results.linked++;
            }
          }

          // Preparar dados do produto com resultado da vinculação
          const productData = {
            supplierId: parseInt(supplierId),
            userId,
            supplierSku,
            productName,
            cost,
            leadTime,
            minimumOrderQuantity,
            masterBox,
            stock,
            linkStatus: linkStatusResult,
            productId: productIdResult,
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