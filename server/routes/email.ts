/**
 * Email Management Routes - SMTP Integration
 * Handles email notifications and administrative email functions
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../security.js';
import emailService from '../services/emailService.js';

const router = Router();

// Email notification schema
const sendNotificationSchema = z.object({
  to: z.string().email('Email inválido').optional(),
  toAll: z.boolean().optional(),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  userIds: z.array(z.number()).optional()
});

// Test email schema
const testEmailSchema = z.object({
  email: z.string().email('Email inválido')
});

// GET /api/email/status - Check email service status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const isConfigured = emailService.isServiceConfigured();
    
    res.json({
      success: true,
      configured: isConfigured,
      message: isConfigured 
        ? 'Serviço de email configurado e operacional' 
        : 'Serviço de email não configurado'
    });
  } catch (error) {
    console.error('[EMAIL_ROUTES] Error checking email status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do email'
    });
  }
});

// POST /api/email/test - Send test email (Admin only)
router.post('/test', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { email } = testEmailSchema.parse(req.body);

    if (!emailService.isServiceConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Serviço de email não configurado'
      });
    }

    const testSubject = 'Teste de Configuração SMTP - Core Guilherme Vasques';
    const testMessage = `
      <h2>✅ Teste de Email Realizado com Sucesso!</h2>
      <p>Este é um email de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
      <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      <p><strong>Servidor:</strong> ${process.env.SMTP_HOST}</p>
      <p>Se você recebeu este email, significa que o sistema está enviando emails corretamente!</p>
    `;

    const success = await emailService.sendNotificationEmail(
      email,
      testSubject,
      testMessage,
      req.user?.name
    );

    if (success) {
      res.json({
        success: true,
        message: `Email de teste enviado com sucesso para ${email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Falha ao enviar email de teste'
      });
    }

  } catch (error) {
    console.error('[EMAIL_ROUTES] Error sending test email:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/email/send-notification - Send notification email (Admin only)
router.post('/send-notification', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { to, toAll, subject, message, userIds } = sendNotificationSchema.parse(req.body);

    if (!emailService.isServiceConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Serviço de email não configurado'
      });
    }

    let recipients: Array<{ email: string; name: string }> = [];

    if (to) {
      // Send to specific email
      recipients = [{ email: to, name: 'Usuário' }];
    } else if (toAll) {
      // Send to all users - implement this based on your user model
      // For now, we'll just return an error as this would require database integration
      return res.status(400).json({
        success: false,
        message: 'Envio para todos os usuários não implementado ainda'
      });
    } else if (userIds && userIds.length > 0) {
      // Send to specific user IDs - implement this based on your user model
      return res.status(400).json({
        success: false,
        message: 'Envio para IDs específicos não implementado ainda'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Especifique os destinatários (to, toAll ou userIds)'
      });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      const success = await emailService.sendNotificationEmail(
        recipient.email,
        subject,
        message,
        recipient.name
      );

      results.push({
        email: recipient.email,
        success
      });

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    res.json({
      success: true,
      message: `Emails processados: ${successCount} enviados, ${failureCount} falharam`,
      results: {
        total: recipients.length,
        success: successCount,
        failures: failureCount,
        details: results
      }
    });

  } catch (error) {
    console.error('[EMAIL_ROUTES] Error sending notification:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/email/send-welcome - Send welcome email to new user
router.post('/send-welcome', requireAuth, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios'
      });
    }

    if (!emailService.isServiceConfigured()) {
      console.warn('[EMAIL_ROUTES] Welcome email not sent - service not configured');
      return res.json({
        success: true,
        message: 'Usuário criado com sucesso (email de boas-vindas não configurado)'
      });
    }

    const success = await emailService.sendWelcomeEmail(email, name);

    if (success) {
      res.json({
        success: true,
        message: 'Email de boas-vindas enviado com sucesso'
      });
    } else {
      res.json({
        success: true,
        message: 'Usuário criado com sucesso (falha ao enviar email de boas-vindas)'
      });
    }

  } catch (error) {
    console.error('[EMAIL_ROUTES] Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;