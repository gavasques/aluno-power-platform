import { Router } from 'express';
import { checkFeaturePermission, checkFeatureAccess, refundCreditsOnError } from '../middleware/permissionMiddleware';
import { requireAuth } from '../security';

const router = Router();

// Exemplo 1: Rota que verifica permissão E debita créditos
router.post('/api/test/feature-with-credits', 
  requireAuth, 
  checkFeaturePermission('amazon-listing-optimizer'), 
  async (req: any, res) => {
    try {
      const { inputData } = req.body;
      const userId = req.user.id;
      const creditInfo = req.creditInfo;
      
      // Simular processamento que pode falhar
      if (!inputData || inputData.trim() === '') {
        throw new Error('Input data is required');
      }
      
      // Processamento bem-sucedido
      const result = {
        message: 'Funcionalidade executada com sucesso',
        processedData: inputData.toUpperCase(),
        creditInfo: {
          creditsUsados: creditInfo.creditsDebited,
          saldoRestante: creditInfo.remainingCredits,
          grupo: creditInfo.userGroup
        }
      };
      
      console.log(`✅ Sucesso: Usuário ${userId} executou amazon-listing-optimizer. Créditos debitados: ${creditInfo.creditsDebited}`);
      
      res.json(result);
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      
      // Reembolsar créditos em caso de erro
      await refundCreditsOnError(req, req.user.id);
      
      res.status(500).json({
        error: 'Erro no processamento',
        code: 'PROCESSING_ERROR',
        message: error.message
      });
    }
  }
);

// Exemplo 2: Rota que apenas verifica permissão (sem debitar créditos)
router.get('/api/test/feature-check-only', 
  requireAuth, 
  checkFeatureAccess('amazon-listing-optimizer'), 
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const creditInfo = req.creditInfo;
      
      res.json({
        message: 'Acesso autorizado à funcionalidade',
        hasAccess: true,
        userGroup: creditInfo.userGroup,
        featureKey: 'amazon-listing-optimizer'
      });
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      res.status(500).json({
        error: 'Erro interno do sistema',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Exemplo 3: Rota para testar diferentes funcionalidades
router.post('/api/test/feature/:featureKey', 
  requireAuth, 
  async (req: any, res, next) => {
    // Middleware dinâmico baseado no parâmetro da rota
    const featureKey = req.params.featureKey;
    const middleware = checkFeaturePermission(featureKey);
    middleware(req, res, next);
  },
  async (req: any, res) => {
    try {
      const { featureKey } = req.params;
      const { testData } = req.body;
      const userId = req.user.id;
      const creditInfo = req.creditInfo;
      
      // Simular processamento específico por funcionalidade
      let result;
      switch (featureKey) {
        case 'ai-image-upscale':
          result = { message: 'Imagem processada', size: '2048x2048' };
          break;
        case 'ai-text-generation':
          result = { message: 'Texto gerado', words: 500 };
          break;
        case 'amazon-listing-optimizer':
          result = { message: 'Listing otimizado', improvements: ['título', 'bullet points'] };
          break;
        default:
          result = { message: 'Funcionalidade processada', feature: featureKey };
      }
      
      res.json({
        ...result,
        creditInfo: {
          creditsUsados: creditInfo.creditsDebited,
          saldoRestante: creditInfo.remainingCredits,
          grupo: creditInfo.userGroup
        },
        testData
      });
      
    } catch (error) {
      console.error('Erro no processamento dinâmico:', error);
      await refundCreditsOnError(req, req.user.id);
      
      res.status(500).json({
        error: 'Erro no processamento',
        code: 'PROCESSING_ERROR'
      });
    }
  }
);

export default router;