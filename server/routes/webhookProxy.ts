import { Router } from 'express';
import fetch from 'node-fetch';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Proxy para webhook n8n do gerador HTML
router.post('/gerar-html-agente', requireAuth, async (req, res) => {
  try {
    const { text, userId, userName } = req.body;

    if (!text || !userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: text, userId, userName'
      });
    }

    console.log('🌐 [WEBHOOK_PROXY] Sending to n8n:', { text, userId, userName });

    const response = await fetch('https://n8n.guivasques.app/webhook-test/gerar-html-agente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        userId,
        userName
      })
    });

    if (!response.ok) {
      console.error('🚨 [WEBHOOK_PROXY] n8n error:', response.status, response.statusText);
      return res.status(response.status).json({
        success: false,
        message: `Webhook n8n retornou erro ${response.status}: ${response.statusText}`
      });
    }

    const data = await response.json();
    console.log('✅ [WEBHOOK_PROXY] n8n response:', data);

    // Padronizar resposta
    const responseText = data.response || data.text || data.result || data.content || data.texto_limpo || '';
    
    res.json({
      success: true,
      response: responseText,
      text: responseText,
      inputTokens: data.inputTokens || 0,
      outputTokens: data.outputTokens || 0,
      totalTokens: data.totalTokens || 0,
      cost: data.cost || 0,
      originalResponse: data // Para debug
    });

  } catch (error) {
    console.error('🚨 [WEBHOOK_PROXY] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no proxy do webhook',
      error: error.message
    });
  }
});

export default router;