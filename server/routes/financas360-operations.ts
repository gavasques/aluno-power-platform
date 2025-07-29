import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../middleware/auth';
import {
  fin360CanaisPagamento,
  fin360EstruturaDRE,
  fin360Lancamentos,
  fin360NotasFiscais,
  fin360Devolucoes,
  fin360Empresas,
  fin360Parceiros,
  fin360ContasBancarias,
  fin360FormasPagamento,
  fin360Canais,
  fin360Bancos,
  insertCanalPagamentoSchema,
  insertEstruturaDRESchema,
  insertLancamentoSchema,
  insertNotaFiscalSchema,
  insertDevolucaoSchema,
  validateLancamentoData
} from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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

// ========== CANAIS DE PAGAMENTO ==========
router.get('/canais-pagamento', async (req, res) => {
  try {
    const canais = await db.select()
      .from(fin360CanaisPagamento)
      .where(eq(fin360CanaisPagamento.createdBy, req.user.id))
      .orderBy(desc(fin360CanaisPagamento.createdAt));

    res.json({ success: true, data: canais });
  } catch (error) {
    console.error('Error fetching canais pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar canais de pagamento' });
  }
});

router.post('/canais-pagamento', async (req, res) => {
  try {
    const validatedData = insertCanalPagamentoSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [canal] = await db.insert(fin360CanaisPagamento)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: canal });
  } catch (error) {
    console.error('Error creating canal pagamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar canal de pagamento' });
  }
});

router.put('/canais-pagamento/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertCanalPagamentoSchema.omit({ createdBy: true }).parse(req.body);

    const [canal] = await db.update(fin360CanaisPagamento)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360CanaisPagamento.id, id), eq(fin360CanaisPagamento.createdBy, req.user.id)))
      .returning();

    if (!canal) {
      return res.status(404).json({ success: false, error: 'Canal de pagamento não encontrado' });
    }

    res.json({ success: true, data: canal });
  } catch (error) {
    console.error('Error updating canal pagamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar canal de pagamento' });
  }
});

router.delete('/canais-pagamento/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [canal] = await db.delete(fin360CanaisPagamento)
      .where(and(eq(fin360CanaisPagamento.id, id), eq(fin360CanaisPagamento.createdBy, req.user.id)))
      .returning();

    if (!canal) {
      return res.status(404).json({ success: false, error: 'Canal de pagamento não encontrado' });
    }

    res.json({ success: true, message: 'Canal de pagamento excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting canal pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir canal de pagamento' });
  }
});

// ========== ESTRUTURA DRE ==========
router.get('/estrutura-dre', async (req, res) => {
  try {
    const estrutura = await db.select()
      .from(fin360EstruturaDRE)
      .where(eq(fin360EstruturaDRE.createdBy, req.user.id))
      .orderBy(fin360EstruturaDRE.nivel, fin360EstruturaDRE.ordem);

    res.json({ success: true, data: estrutura });
  } catch (error) {
    console.error('Error fetching estrutura DRE:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar estrutura DRE' });
  }
});

router.post('/estrutura-dre', async (req, res) => {
  try {
    const validatedData = insertEstruturaDRESchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [estrutura] = await db.insert(fin360EstruturaDRE)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: estrutura });
  } catch (error) {
    console.error('Error creating estrutura DRE:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar estrutura DRE' });
  }
});

router.put('/estrutura-dre/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertEstruturaDRESchema.omit({ createdBy: true }).parse(req.body);

    const [estrutura] = await db.update(fin360EstruturaDRE)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360EstruturaDRE.id, id), eq(fin360EstruturaDRE.createdBy, req.user.id)))
      .returning();

    if (!estrutura) {
      return res.status(404).json({ success: false, error: 'Estrutura DRE não encontrada' });
    }

    res.json({ success: true, data: estrutura });
  } catch (error) {
    console.error('Error updating estrutura DRE:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar estrutura DRE' });
  }
});

router.delete('/estrutura-dre/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [estrutura] = await db.delete(fin360EstruturaDRE)
      .where(and(eq(fin360EstruturaDRE.id, id), eq(fin360EstruturaDRE.createdBy, req.user.id)))
      .returning();

    if (!estrutura) {
      return res.status(404).json({ success: false, error: 'Estrutura DRE não encontrada' });
    }

    res.json({ success: true, message: 'Estrutura DRE excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting estrutura DRE:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir estrutura DRE' });
  }
});

// ========== LANÇAMENTOS ==========
router.get('/lancamentos', async (req, res) => {
  try {
    const { status, tipo, empresaId, dataInicio, dataFim } = req.query;
    
    let whereConditions = [eq(fin360Lancamentos.createdBy, req.user.id)];
    
    if (status) {
      whereConditions.push(eq(fin360Lancamentos.status, status as any));
    }
    
    if (tipo) {
      whereConditions.push(eq(fin360Lancamentos.tipo, tipo as any));
    }
    
    if (empresaId) {
      whereConditions.push(eq(fin360Lancamentos.empresaId, parseInt(empresaId as string)));
    }

    // Date filters would require additional SQL construction
    const lancamentos = await db.select({
      id: fin360Lancamentos.id,
      empresaId: fin360Lancamentos.empresaId,
      tipo: fin360Lancamentos.tipo,
      dataLancamento: fin360Lancamentos.dataLancamento,
      dataVencimento: fin360Lancamentos.dataVencimento,
      dataPagamento: fin360Lancamentos.dataPagamento,
      parceiroId: fin360Lancamentos.parceiroId,
      contaBancariaId: fin360Lancamentos.contaBancariaId,
      formaPagamentoId: fin360Lancamentos.formaPagamentoId,
      canalId: fin360Lancamentos.canalId,
      estruturaDreId: fin360Lancamentos.estruturaDreId,
      descricao: fin360Lancamentos.descricao,
      valor: fin360Lancamentos.valor,
      valorPago: fin360Lancamentos.valorPago,
      juros: fin360Lancamentos.juros,
      multa: fin360Lancamentos.multa,
      desconto: fin360Lancamentos.desconto,
      status: fin360Lancamentos.status,
      observacoes: fin360Lancamentos.observacoes,
      anexos: fin360Lancamentos.anexos,
      createdAt: fin360Lancamentos.createdAt,
      updatedAt: fin360Lancamentos.updatedAt,
      empresa: {
        razaoSocial: fin360Empresas.razaoSocial,
        nomeFantasia: fin360Empresas.nomeFantasia
      },
      parceiro: {
        id: fin360Parceiros.id,
        razaoSocial: fin360Parceiros.razaoSocial,
        nomeFantasia: fin360Parceiros.nomeFantasia,
        tipo: fin360Parceiros.tipo
      },
      contaBancaria: {
        id: fin360ContasBancarias.id,
        descricao: fin360ContasBancarias.descricao,
        banco: fin360Bancos.nome
      },
      formaPagamento: {
        id: fin360FormasPagamento.id,
        nome: fin360FormasPagamento.nome,
        tipo: fin360FormasPagamento.tipo
      },
      canal: {
        id: fin360Canais.id,
        nome: fin360Canais.nome,
        tipo: fin360Canais.tipo
      },
      estruturaDre: {
        id: fin360EstruturaDRE.id,
        codigo: fin360EstruturaDRE.codigo,
        descricao: fin360EstruturaDRE.descricao,
        tipo: fin360EstruturaDRE.tipo
      }
    })
      .from(fin360Lancamentos)
      .leftJoin(fin360Empresas, eq(fin360Lancamentos.empresaId, fin360Empresas.id))
      .leftJoin(fin360Parceiros, eq(fin360Lancamentos.parceiroId, fin360Parceiros.id))
      .leftJoin(fin360ContasBancarias, eq(fin360Lancamentos.contaBancariaId, fin360ContasBancarias.id))
      .leftJoin(fin360Bancos, eq(fin360ContasBancarias.bancoId, fin360Bancos.id))
      .leftJoin(fin360FormasPagamento, eq(fin360Lancamentos.formaPagamentoId, fin360FormasPagamento.id))
      .leftJoin(fin360Canais, eq(fin360Lancamentos.canalId, fin360Canais.id))
      .leftJoin(fin360EstruturaDRE, eq(fin360Lancamentos.estruturaDreId, fin360EstruturaDRE.id))
      .where(and(...whereConditions))
      .orderBy(desc(fin360Lancamentos.dataVencimento));

    res.json({ success: true, data: lancamentos });
  } catch (error) {
    console.error('Error fetching lancamentos:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar lançamentos' });
  }
});

router.post('/lancamentos', async (req, res) => {
  try {
    const validatedData = validateLancamentoData({
      ...req.body,
      createdBy: req.user.id
    });

    const [lancamento] = await db.insert(fin360Lancamentos)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: lancamento });
  } catch (error) {
    console.error('Error creating lancamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar lançamento' });
  }
});

router.put('/lancamentos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = validateLancamentoData(req.body);

    const [lancamento] = await db.update(fin360Lancamentos)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360Lancamentos.id, id), eq(fin360Lancamentos.createdBy, req.user.id)))
      .returning();

    if (!lancamento) {
      return res.status(404).json({ success: false, error: 'Lançamento não encontrado' });
    }

    res.json({ success: true, data: lancamento });
  } catch (error) {
    console.error('Error updating lancamento:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar lançamento' });
  }
});

router.delete('/lancamentos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [lancamento] = await db.delete(fin360Lancamentos)
      .where(and(eq(fin360Lancamentos.id, id), eq(fin360Lancamentos.createdBy, req.user.id)))
      .returning();

    if (!lancamento) {
      return res.status(404).json({ success: false, error: 'Lançamento não encontrado' });
    }

    res.json({ success: true, message: 'Lançamento excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting lancamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir lançamento' });
  }
});

// ========== NOTAS FISCAIS ==========
router.get('/notas-fiscais', async (req, res) => {
  try {
    const { status, tipo, empresaId } = req.query;
    
    let whereConditions = [eq(fin360NotasFiscais.createdBy, req.user.id)];
    
    if (status) {
      whereConditions.push(eq(fin360NotasFiscais.status, status as any));
    }
    
    if (tipo) {
      whereConditions.push(eq(fin360NotasFiscais.tipo, tipo as any));
    }
    
    if (empresaId) {
      whereConditions.push(eq(fin360NotasFiscais.empresaId, parseInt(empresaId as string)));
    }

    const notas = await db.select({
      id: fin360NotasFiscais.id,
      empresaId: fin360NotasFiscais.empresaId,
      numero: fin360NotasFiscais.numero,
      serie: fin360NotasFiscais.serie,
      chaveAcesso: fin360NotasFiscais.chaveAcesso,
      tipo: fin360NotasFiscais.tipo,
      dataEmissao: fin360NotasFiscais.dataEmissao,
      dataEntrada: fin360NotasFiscais.dataEntrada,
      parceiroId: fin360NotasFiscais.parceiroId,
      valorProdutos: fin360NotasFiscais.valorProdutos,
      valorDesconto: fin360NotasFiscais.valorDesconto,
      valorFrete: fin360NotasFiscais.valorFrete,
      valorSeguro: fin360NotasFiscais.valorSeguro,
      outrasDespesas: fin360NotasFiscais.outrasDespesas,
      valorTotal: fin360NotasFiscais.valorTotal,
      observacoes: fin360NotasFiscais.observacoes,
      xmlUrl: fin360NotasFiscais.xmlUrl,
      pdfUrl: fin360NotasFiscais.pdfUrl,
      status: fin360NotasFiscais.status,
      lancamentos: fin360NotasFiscais.lancamentos,
      createdAt: fin360NotasFiscais.createdAt,
      updatedAt: fin360NotasFiscais.updatedAt,
      empresa: {
        razaoSocial: fin360Empresas.razaoSocial,
        nomeFantasia: fin360Empresas.nomeFantasia
      },
      parceiro: {
        id: fin360Parceiros.id,
        razaoSocial: fin360Parceiros.razaoSocial,
        nomeFantasia: fin360Parceiros.nomeFantasia,
        tipo: fin360Parceiros.tipo
      }
    })
      .from(fin360NotasFiscais)
      .leftJoin(fin360Empresas, eq(fin360NotasFiscais.empresaId, fin360Empresas.id))
      .leftJoin(fin360Parceiros, eq(fin360NotasFiscais.parceiroId, fin360Parceiros.id))
      .where(and(...whereConditions))
      .orderBy(desc(fin360NotasFiscais.dataEmissao));

    res.json({ success: true, data: notas });
  } catch (error) {
    console.error('Error fetching notas fiscais:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar notas fiscais' });
  }
});

router.post('/notas-fiscais', async (req, res) => {
  try {
    const validatedData = insertNotaFiscalSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [nota] = await db.insert(fin360NotasFiscais)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: nota });
  } catch (error) {
    console.error('Error creating nota fiscal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar nota fiscal' });
  }
});

router.put('/notas-fiscais/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertNotaFiscalSchema.omit({ createdBy: true }).parse(req.body);

    const [nota] = await db.update(fin360NotasFiscais)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360NotasFiscais.id, id), eq(fin360NotasFiscais.createdBy, req.user.id)))
      .returning();

    if (!nota) {
      return res.status(404).json({ success: false, error: 'Nota fiscal não encontrada' });
    }

    res.json({ success: true, data: nota });
  } catch (error) {
    console.error('Error updating nota fiscal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar nota fiscal' });
  }
});

router.delete('/notas-fiscais/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [nota] = await db.delete(fin360NotasFiscais)
      .where(and(eq(fin360NotasFiscais.id, id), eq(fin360NotasFiscais.createdBy, req.user.id)))
      .returning();

    if (!nota) {
      return res.status(404).json({ success: false, error: 'Nota fiscal não encontrada' });
    }

    res.json({ success: true, message: 'Nota fiscal excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting nota fiscal:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir nota fiscal' });
  }
});

// ========== DEVOLUÇÕES ==========
router.get('/devolucoes', async (req, res) => {
  try {
    const { status, tipo, empresaId } = req.query;
    
    let whereConditions = [eq(fin360Devolucoes.createdBy, req.user.id)];
    
    if (status) {
      whereConditions.push(eq(fin360Devolucoes.status, status as any));
    }
    
    if (tipo) {
      whereConditions.push(eq(fin360Devolucoes.tipo, tipo as any));
    }
    
    if (empresaId) {
      whereConditions.push(eq(fin360Devolucoes.empresaId, parseInt(empresaId as string)));
    }

    const devolucoes = await db.select({
      id: fin360Devolucoes.id,
      empresaId: fin360Devolucoes.empresaId,
      tipo: fin360Devolucoes.tipo,
      data: fin360Devolucoes.data,
      parceiroId: fin360Devolucoes.parceiroId,
      notaFiscalId: fin360Devolucoes.notaFiscalId,
      motivo: fin360Devolucoes.motivo,
      valor: fin360Devolucoes.valor,
      status: fin360Devolucoes.status,
      lancamentoId: fin360Devolucoes.lancamentoId,
      observacoes: fin360Devolucoes.observacoes,
      createdAt: fin360Devolucoes.createdAt,
      updatedAt: fin360Devolucoes.updatedAt,
      empresa: {
        razaoSocial: fin360Empresas.razaoSocial,
        nomeFantasia: fin360Empresas.nomeFantasia
      },
      parceiro: {
        id: fin360Parceiros.id,
        razaoSocial: fin360Parceiros.razaoSocial,
        nomeFantasia: fin360Parceiros.nomeFantasia,
        tipo: fin360Parceiros.tipo
      },
      notaFiscal: {
        id: fin360NotasFiscais.id,
        numero: fin360NotasFiscais.numero,
        serie: fin360NotasFiscais.serie
      },
      lancamento: {
        id: fin360Lancamentos.id,
        descricao: fin360Lancamentos.descricao,
        valor: fin360Lancamentos.valor
      }
    })
      .from(fin360Devolucoes)
      .leftJoin(fin360Empresas, eq(fin360Devolucoes.empresaId, fin360Empresas.id))
      .leftJoin(fin360Parceiros, eq(fin360Devolucoes.parceiroId, fin360Parceiros.id))
      .leftJoin(fin360NotasFiscais, eq(fin360Devolucoes.notaFiscalId, fin360NotasFiscais.id))
      .leftJoin(fin360Lancamentos, eq(fin360Devolucoes.lancamentoId, fin360Lancamentos.id))
      .where(and(...whereConditions))
      .orderBy(desc(fin360Devolucoes.data));

    res.json({ success: true, data: devolucoes });
  } catch (error) {
    console.error('Error fetching devolucoes:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar devoluções' });
  }
});

router.post('/devolucoes', async (req, res) => {
  try {
    const validatedData = insertDevolucaoSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });

    const [devolucao] = await db.insert(fin360Devolucoes)
      .values(validatedData)
      .returning();

    res.status(201).json({ success: true, data: devolucao });
  } catch (error) {
    console.error('Error creating devolucao:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao criar devolução' });
  }
});

router.put('/devolucoes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertDevolucaoSchema.omit({ createdBy: true }).parse(req.body);

    const [devolucao] = await db.update(fin360Devolucoes)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(fin360Devolucoes.id, id), eq(fin360Devolucoes.createdBy, req.user.id)))
      .returning();

    if (!devolucao) {
      return res.status(404).json({ success: false, error: 'Devolução não encontrada' });
    }

    res.json({ success: true, data: devolucao });
  } catch (error) {
    console.error('Error updating devolucao:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Erro ao atualizar devolução' });
  }
});

router.delete('/devolucoes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [devolucao] = await db.delete(fin360Devolucoes)
      .where(and(eq(fin360Devolucoes.id, id), eq(fin360Devolucoes.createdBy, req.user.id)))
      .returning();

    if (!devolucao) {
      return res.status(404).json({ success: false, error: 'Devolução não encontrada' });
    }

    res.json({ success: true, message: 'Devolução excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting devolucao:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir devolução' });
  }
});

export { router as financas360OperationsRouter };