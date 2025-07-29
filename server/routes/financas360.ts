import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../middleware/auth';
import {
  fin360Empresas,
  fin360Canais,
  fin360Bancos,
  fin360ContasBancarias,
  fin360FormasPagamento,
  fin360Parceiros,
  fin360CanaisPagamento,
  fin360EstruturaDRE,
  fin360Lancamentos,
  fin360NotasFiscais,
  fin360Devolucoes,
  insertEmpresaSchema,
  insertCanalSchema,
  insertBancoSchema,
  insertContaBancariaSchema,
  insertFormaPagamentoSchema,
  insertParceiroSchema,
  insertCanalPagamentoSchema,
  insertEstruturaDRESchema,
  insertLancamentoSchema,
  insertNotaFiscalSchema,
  insertDevolucaoSchema,
  validateEmpresaData,
  validateParceiroData,
  validateContaBancariaData,
  validateLancamentoData
} from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Extend Request interface for user property
declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: string;
        email: string;
        name: string;
      };
    }
  }
}

// ========== EMPRESAS ==========
router.get('/empresas', async (req, res) => {
  try {
    const empresas = await db.select()
      .from(fin360Empresas)
      .where(eq(fin360Empresas.createdBy, req.user.id))
      .orderBy(desc(fin360Empresas.createdAt));

    res.json({ success: true, data: empresas });
  } catch (error) {
    console.error('Error fetching empresas:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar empresas' });
  }
});

router.post('/empresas', async (req, res) => {
  try {
    const validatedData = validateEmpresaData({
      ...req.body,
      createdBy: req.user.id
    });

    const [empresa] = await db.insert(fin360Empresas)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: empresa });
  } catch (error) {
    console.error('Error creating empresa:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar empresa' });
  }
});

router.put('/empresas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = validateEmpresaData(req.body);

    const [empresa] = await db.update(fin360Empresas)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360Empresas.id, id), eq(fin360Empresas.createdBy, req.user.id)))
      .returning();

    if (!empresa) {
      return res.status(404).json({ success: false, error: 'Empresa não encontrada' });
    }

    res.json({ success: true, data: empresa });
  } catch (error) {
    console.error('Error updating empresa:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar empresa' });
  }
});

router.delete('/empresas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [empresa] = await db.delete(fin360Empresas)
      .where(and(eq(fin360Empresas.id, id), eq(fin360Empresas.createdBy, req.user.id)))
      .returning();

    if (!empresa) {
      return res.status(404).json({ success: false, error: 'Empresa não encontrada' });
    }

    res.json({ success: true, message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting empresa:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir empresa' });
  }
});

// ========== CANAIS ==========
router.get('/canais', async (req, res) => {
  try {
    const canais = await db.select()
      .from(fin360Canais)
      .where(eq(fin360Canais.createdBy, req.user.id))
      .orderBy(desc(fin360Canais.createdAt));

    res.json({ success: true, data: canais });
  } catch (error) {
    console.error('Error fetching canais:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar canais' });
  }
});

router.post('/canais', async (req, res) => {
  try {
    const validatedData = insertCanalSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [canal] = await db.insert(fin360Canais)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: canal });
  } catch (error) {
    console.error('Error creating canal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar canal' });
  }
});

router.put('/canais/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertCanalSchema.omit({ createdBy: true }).parse(req.body);

    const [canal] = await db.update(fin360Canais)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360Canais.id, id), eq(fin360Canais.createdBy, req.user.id)))
      .returning();

    if (!canal) {
      return res.status(404).json({ success: false, error: 'Canal não encontrado' });
    }

    res.json({ success: true, data: canal });
  } catch (error) {
    console.error('Error updating canal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar canal' });
  }
});

router.delete('/canais/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [canal] = await db.delete(fin360Canais)
      .where(and(eq(fin360Canais.id, id), eq(fin360Canais.createdBy, req.user.id)))
      .returning();

    if (!canal) {
      return res.status(404).json({ success: false, error: 'Canal não encontrado' });
    }

    res.json({ success: true, message: 'Canal excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting canal:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir canal' });
  }
});

// ========== BANCOS (Global - todos os usuários) ==========
router.get('/bancos', async (req, res) => {
  try {
    const bancos = await db.select()
      .from(fin360Bancos)
      .where(eq(fin360Bancos.isActive, true))
      .orderBy(fin360Bancos.nome);

    res.json({ success: true, data: bancos });
  } catch (error) {
    console.error('Error fetching bancos:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar bancos' });
  }
});

router.post('/bancos', async (req, res) => {
  try {
    // Only allow admin users to create banks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    const validatedData = insertBancoSchema.parse(req.body);

    const [banco] = await db.insert(fin360Bancos)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: banco });
  } catch (error) {
    console.error('Error creating banco:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar banco' });
  }
});

// ========== CONTAS BANCÁRIAS ==========
router.get('/contas-bancarias', async (req, res) => {
  try {
    const contas = await db.select({
      id: fin360ContasBancarias.id,
      empresaId: fin360ContasBancarias.empresaId,
      bancoId: fin360ContasBancarias.bancoId,
      tipoConta: fin360ContasBancarias.tipoConta,
      agencia: fin360ContasBancarias.agencia,
      conta: fin360ContasBancarias.conta,
      digito: fin360ContasBancarias.digito,
      descricao: fin360ContasBancarias.descricao,
      saldoInicial: fin360ContasBancarias.saldoInicial,
      saldoAtual: fin360ContasBancarias.saldoAtual,
      isActive: fin360ContasBancarias.isActive,
      createdAt: fin360ContasBancarias.createdAt,
      updatedAt: fin360ContasBancarias.updatedAt,
      banco: {
        nome: fin360Bancos.nome,
        codigo: fin360Bancos.codigo
      },
      empresa: {
        razaoSocial: fin360Empresas.razaoSocial,
        nomeFantasia: fin360Empresas.nomeFantasia
      }
    })
      .from(fin360ContasBancarias)
      .leftJoin(fin360Bancos, eq(fin360ContasBancarias.bancoId, fin360Bancos.id))
      .leftJoin(fin360Empresas, eq(fin360ContasBancarias.empresaId, fin360Empresas.id))
      .where(eq(fin360ContasBancarias.createdBy, req.user.id))
      .orderBy(desc(fin360ContasBancarias.createdAt));

    res.json({ success: true, data: contas });
  } catch (error) {
    console.error('Error fetching contas bancarias:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar contas bancárias' });
  }
});

router.post('/contas-bancarias', async (req, res) => {
  try {
    const validatedData = validateContaBancariaData({
      ...req.body,
      createdBy: req.user.id
    });

    const [conta] = await db.insert(fin360ContasBancarias)
      .values([validatedData])
      .returning();

    res.status(201).json({ success: true, data: conta });
  } catch (error) {
    console.error('Error creating conta bancaria:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar conta bancária' });
  }
});

router.put('/contas-bancarias/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = validateContaBancariaData(req.body);

    const [conta] = await db.update(fin360ContasBancarias)
      .set({ 
        ...validatedData, 
        updatedAt: new Date(),
        saldoInicial: validatedData.saldoInicial.toString(),
        saldoAtual: validatedData.saldoAtual.toString()
      })
      .where(and(eq(fin360ContasBancarias.id, id), eq(fin360ContasBancarias.createdBy, req.user.id)))
      .returning();

    if (!conta) {
      return res.status(404).json({ success: false, error: 'Conta bancária não encontrada' });
    }

    res.json({ success: true, data: conta });
  } catch (error) {
    console.error('Error updating conta bancaria:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar conta bancária' });
  }
});

router.delete('/contas-bancarias/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [conta] = await db.delete(fin360ContasBancarias)
      .where(and(eq(fin360ContasBancarias.id, id), eq(fin360ContasBancarias.createdBy, req.user.id)))
      .returning();

    if (!conta) {
      return res.status(404).json({ success: false, error: 'Conta bancária não encontrada' });
    }

    res.json({ success: true, message: 'Conta bancária excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting conta bancaria:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir conta bancária' });
  }
});

// ========== FORMAS DE PAGAMENTO ==========
router.get('/formas-pagamento', async (req, res) => {
  try {
    const formas = await db.select({
      id: fin360FormasPagamento.id,
      nome: fin360FormasPagamento.nome,
      tipo: fin360FormasPagamento.tipo,
      taxaPercentual: fin360FormasPagamento.taxaPercentual,
      taxaFixa: fin360FormasPagamento.taxaFixa,
      prazoRecebimento: fin360FormasPagamento.prazoRecebimento,
      contaBancariaId: fin360FormasPagamento.contaBancariaId,
      isActive: fin360FormasPagamento.isActive,
      createdAt: fin360FormasPagamento.createdAt,
      updatedAt: fin360FormasPagamento.updatedAt,
      contaBancaria: {
        id: fin360ContasBancarias.id,
        descricao: fin360ContasBancarias.descricao,
        banco: fin360Bancos.nome
      }
    })
      .from(fin360FormasPagamento)
      .leftJoin(fin360ContasBancarias, eq(fin360FormasPagamento.contaBancariaId, fin360ContasBancarias.id))
      .leftJoin(fin360Bancos, eq(fin360ContasBancarias.bancoId, fin360Bancos.id))
      .where(eq(fin360FormasPagamento.createdBy, req.user.id))
      .orderBy(desc(fin360FormasPagamento.createdAt));

    res.json({ success: true, data: formas });
  } catch (error) {
    console.error('Error fetching formas pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar formas de pagamento' });
  }
});

router.post('/formas-pagamento', async (req, res) => {
  try {
    const validatedData = insertFormaPagamentoSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [forma] = await db.insert(fin360FormasPagamento)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: forma });
  } catch (error) {
    console.error('Error creating forma pagamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar forma de pagamento' });
  }
});

router.put('/formas-pagamento/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertFormaPagamentoSchema.omit({ createdBy: true }).parse(req.body);

    const [forma] = await db.update(fin360FormasPagamento)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360FormasPagamento.id, id), eq(fin360FormasPagamento.createdBy, req.user.id)))
      .returning();

    if (!forma) {
      return res.status(404).json({ success: false, error: 'Forma de pagamento não encontrada' });
    }

    res.json({ success: true, data: forma });
  } catch (error) {
    console.error('Error updating forma pagamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar forma de pagamento' });
  }
});

router.delete('/formas-pagamento/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [forma] = await db.delete(fin360FormasPagamento)
      .where(and(eq(fin360FormasPagamento.id, id), eq(fin360FormasPagamento.createdBy, req.user.id)))
      .returning();

    if (!forma) {
      return res.status(404).json({ success: false, error: 'Forma de pagamento não encontrada' });
    }

    res.json({ success: true, message: 'Forma de pagamento excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting forma pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir forma de pagamento' });
  }
});

// ========== PARCEIROS ==========
router.get('/parceiros', async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let whereConditions = [eq(fin360Parceiros.createdBy, req.user.id)];
    
    if (tipo && ['cliente', 'fornecedor', 'ambos'].includes(tipo as string)) {
      whereConditions.push(eq(fin360Parceiros.tipo, tipo as any));
    }

    const parceiros = await db.select()
      .from(fin360Parceiros)
      .where(and(...whereConditions))
      .orderBy(desc(fin360Parceiros.createdAt));

    res.json({ success: true, data: parceiros });
  } catch (error) {
    console.error('Error fetching parceiros:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar parceiros' });
  }
});

router.post('/parceiros', async (req, res) => {
  try {
    const validatedData = validateParceiroData({
      ...req.body,
      createdBy: req.user.id
    });

    const [parceiro] = await db.insert(fin360Parceiros)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: parceiro });
  } catch (error) {
    console.error('Error creating parceiro:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar parceiro' });
  }
});

router.put('/parceiros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = validateParceiroData(req.body);

    const [parceiro] = await db.update(fin360Parceiros)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360Parceiros.id, id), eq(fin360Parceiros.createdBy, req.user.id)))
      .returning();

    if (!parceiro) {
      return res.status(404).json({ success: false, error: 'Parceiro não encontrado' });
    }

    res.json({ success: true, data: parceiro });
  } catch (error) {
    console.error('Error updating parceiro:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar parceiro' });
  }
});

router.delete('/parceiros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [parceiro] = await db.delete(fin360Parceiros)
      .where(and(eq(fin360Parceiros.id, id), eq(fin360Parceiros.createdBy, req.user.id)))
      .returning();

    if (!parceiro) {
      return res.status(404).json({ success: false, error: 'Parceiro não encontrado' });
    }

    res.json({ success: true, message: 'Parceiro excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting parceiro:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir parceiro' });
  }
});

export { router as financas360Router };