import { Express, Request, Response } from 'express';
import { requireAuth } from '../security';
import { couponService } from '../services/couponService';
import { trialService } from '../services/trialService';
import { abandonedCartService } from '../services/abandonedCartService';
import { analyticsService } from '../services/analyticsService';

export function registerAdvancedRoutes(app: Express) {
  // =====================================================
  // CUPONS E DESCONTOS
  // =====================================================

  // Validar cupom
  app.post('/api/coupons/validate', requireAuth, async (req: Request, res: Response) => {
    try {
      const { code, planId, amount } = req.body;
      const userId = (req as any).user.id;

      const validation = await couponService.validateCoupon(code, userId, planId, amount);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Aplicar cupom
  app.post('/api/coupons/apply', requireAuth, async (req: Request, res: Response) => {
    try {
      const { code, sessionId } = req.body;
      const userId = (req as any).user.id;

      const applied = await couponService.applyCoupon(code, userId);
      
      if (applied) {
        res.json({
          success: true,
          message: 'Cupom aplicado com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Erro ao aplicar cupom'
        });
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Listar cupons ativos
  app.get('/api/coupons/active', requireAuth, async (req: Request, res: Response) => {
    try {
      const coupons = await couponService.getActiveCoupons();
      
      res.json({
        success: true,
        data: coupons
      });
    } catch (error) {
      console.error('Erro ao listar cupons ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Estatísticas de cupons
  app.get('/api/coupons/:couponId/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const { couponId } = req.params;
      const stats = await couponService.getCouponStats(couponId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do cupom:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // SISTEMA DE TRIAL GRATUITO
  // =====================================================

  // Iniciar trial
  app.post('/api/trial/start', requireAuth, async (req: Request, res: Response) => {
    try {
      const { planId, durationDays = 7, creditsLimit = 100 } = req.body;
      const userId = (req as any).user.id;

      const result = await trialService.startTrial(userId, planId, durationDays, creditsLimit);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.trial,
          message: 'Trial iniciado com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Verificar status do trial
  app.get('/api/trial/status', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      const isActive = await trialService.isTrialActive(userId);
      const trialData = await trialService.getUserTrial(userId);
      
      res.json({
        success: true,
        data: {
          isActive,
          trial: trialData
        }
      });
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Estender trial
  app.post('/api/trial/extend', requireAuth, async (req: Request, res: Response) => {
    try {
      const { extensionDays, couponCode } = req.body;
      const userId = (req as any).user.id;

      const extended = await trialService.extendTrial(userId, extensionDays, couponCode);
      
      if (extended) {
        res.json({
          success: true,
          message: 'Trial estendido com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Erro ao estender trial'
        });
      }
    } catch (error) {
      console.error('Erro ao estender trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Converter trial
  app.post('/api/trial/convert', requireAuth, async (req: Request, res: Response) => {
    try {
      const { subscriptionId } = req.body;
      const userId = (req as any).user.id;

      const converted = await trialService.convertTrial(userId, subscriptionId);
      
      if (converted) {
        res.json({
          success: true,
          message: 'Trial convertido com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Erro ao converter trial'
        });
      }
    } catch (error) {
      console.error('Erro ao converter trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Cancelar trial
  app.post('/api/trial/cancel', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const cancelled = await trialService.cancelTrial(userId);
      
      if (cancelled) {
        res.json({
          success: true,
          message: 'Trial cancelado com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Erro ao cancelar trial'
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Estatísticas de trials
  app.get('/api/trial/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await trialService.getTrialStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de trial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // RECUPERAÇÃO DE CARRINHO ABANDONADO
  // =====================================================

  // Criar carrinho abandonado
  app.post('/api/abandoned-cart/track', requireAuth, async (req: Request, res: Response) => {
    try {
      const cartData = req.body;
      const userId = (req as any).user.id;

      const cart = await abandonedCartService.createAbandonedCart({
        ...cartData,
        userId
      });
      
      res.json({
        success: true,
        data: cart,
        message: 'Carrinho abandonado registrado'
      });
    } catch (error) {
      console.error('Erro ao registrar carrinho abandonado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Atualizar atividade do carrinho
  app.post('/api/abandoned-cart/:sessionId/activity', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      await abandonedCartService.updateLastActivity(sessionId);
      
      res.json({
        success: true,
        message: 'Atividade atualizada'
      });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Recuperar dados do carrinho
  app.get('/api/abandoned-cart/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const cart = await abandonedCartService.getCartBySession(sessionId);
      
      if (cart) {
        res.json({
          success: true,
          data: cart
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Carrinho não encontrado'
        });
      }
    } catch (error) {
      console.error('Erro ao recuperar dados do carrinho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Marcar carrinho como convertido
  app.post('/api/abandoned-cart/:sessionId/convert', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { conversionAmount } = req.body;

      await abandonedCartService.markAsConverted(sessionId, conversionAmount);
      
      res.json({
        success: true,
        message: 'Carrinho marcado como convertido'
      });
    } catch (error) {
      console.error('Erro ao marcar conversão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Obter carrinhos do usuário
  app.get('/api/abandoned-cart/user', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const carts = await abandonedCartService.getUserCarts(userId);
      
      res.json({
        success: true,
        data: carts
      });
    } catch (error) {
      console.error('Erro ao obter carrinhos do usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Estatísticas de carrinhos abandonados
  app.get('/api/abandoned-cart/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const stats = await abandonedCartService.getAbandonedCartStats(Number(days));
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de carrinhos abandonados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Top planos abandonados
  app.get('/api/abandoned-cart/top-plans', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const topPlans = await abandonedCartService.getTopAbandonedPlans(Number(days));
      
      res.json({
        success: true,
        data: topPlans
      });
    } catch (error) {
      console.error('Erro ao obter top planos abandonados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // =====================================================
  // ANALYTICS DE CONVERSÃO
  // =====================================================

  // Registrar evento
  app.post('/api/analytics/track', async (req: Request, res: Response) => {
    try {
      const eventData = req.body;
      const userId = (req as any).user?.id;

      const event = await analyticsService.trackEvent({
        ...eventData,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Funil de conversão
  app.get('/api/analytics/funnel', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const funnel = await analyticsService.getConversionFunnel(Number(days));
      
      res.json({
        success: true,
        data: funnel
      });
    } catch (error) {
      console.error('Erro ao obter funil de conversão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Eventos do usuário
  app.get('/api/analytics/user/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { days = 30 } = req.query;

      const events = await analyticsService.getUserEvents(userId, Number(days));
      
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Erro ao obter eventos do usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Eventos da sessão
  app.get('/api/analytics/session/:sessionId/events', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const events = await analyticsService.getSessionEvents(sessionId);
      
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Erro ao obter eventos da sessão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Origens de tráfego
  app.get('/api/analytics/traffic-sources', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const sources = await analyticsService.getTrafficSources(Number(days));
      
      res.json({
        success: true,
        data: sources
      });
    } catch (error) {
      console.error('Erro ao obter origens de tráfego:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Páginas mais visitadas
  app.get('/api/analytics/top-pages', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const pages = await analyticsService.getTopPages(Number(days));
      
      res.json({
        success: true,
        data: pages
      });
    } catch (error) {
      console.error('Erro ao obter páginas mais visitadas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Conversão por origem
  app.get('/api/analytics/conversion-by-source', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const conversion = await analyticsService.getConversionBySource(Number(days));
      
      res.json({
        success: true,
        data: conversion
      });
    } catch (error) {
      console.error('Erro ao obter conversão por origem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Análise de coorte
  app.get('/api/analytics/cohort', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 90 } = req.query;

      const cohort = await analyticsService.getCohortAnalysis(Number(days));
      
      res.json({
        success: true,
        data: cohort
      });
    } catch (error) {
      console.error('Erro ao obter análise de coorte:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Relatório de abandono de checkout
  app.get('/api/analytics/checkout-abandonment', requireAuth, async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const report = await analyticsService.getCheckoutAbandonmentReport(Number(days));
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Erro ao obter relatório de abandono:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });
}