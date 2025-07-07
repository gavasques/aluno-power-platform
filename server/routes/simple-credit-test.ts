import { Router } from 'express';
import { debitarCreditos, verificarSaldoCreditos, reembolsarCreditos } from '../services/creditService.js';
import { requireAuth } from '../security.js';

const router = Router();

// Test endpoint para debitar créditos
router.post('/test-debit', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { featureKey } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!featureKey) {
      return res.status(400).json({ error: 'Feature key é obrigatória' });
    }
    
    const resultado = await debitarCreditos(userId, featureKey);
    
    return res.json({
      sucesso: resultado.sucesso,
      creditosDebitados: resultado.creditosDebitados,
      saldoRestante: resultado.saldoRestante,
      ehAdmin: resultado.ehAdmin,
      erro: resultado.erro
    });
    
  } catch (error) {
    console.error('Erro no teste de débito:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Test endpoint para verificar saldo
router.get('/test-balance', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const resultado = await verificarSaldoCreditos(userId);
    
    return res.json({
      saldo: resultado.saldo,
      ehAdmin: resultado.ehAdmin
    });
    
  } catch (error) {
    console.error('Erro no teste de saldo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Test endpoint para reembolso
router.post('/test-refund', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, reason } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida para reembolso' });
    }
    
    const resultado = await reembolsarCreditos(userId, amount, reason || 'Teste de reembolso');
    
    return res.json({
      sucesso: resultado,
      message: resultado ? 'Reembolso realizado com sucesso' : 'Erro no reembolso'
    });
    
  } catch (error) {
    console.error('Erro no teste de reembolso:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as simpleCreditTestRoutes };