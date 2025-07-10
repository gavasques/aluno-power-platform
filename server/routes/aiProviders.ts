import { Router } from 'express';
import { aiProviderService } from '../services/aiProviderService';
import { requireAuth } from '../security';
import { z } from 'zod';

const router = Router();

// Test AI Provider Connection
const testRequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'deepseek', 'xai']),
  model: z.string(),
  prompt: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(300000).optional(),
  imageData: z.string().optional(),
  referenceImages: z.array(z.object({
    data: z.string(),
    filename: z.string()
  })).optional(),
  // Grok-specific features
  reasoningLevel: z.enum(['disabled', 'low', 'high']).optional(),
  enableSearch: z.boolean().optional(),
  enableImageUnderstanding: z.boolean().optional()
});

router.post('/test', requireAuth, async (req, res) => {
  try {
    const validatedData = testRequestSchema.parse(req.body);
    
    console.log(`🧪 [AI_PROVIDER_TEST] Testing ${validatedData.provider} with model ${validatedData.model}`);
    
    // Check if provider is configured
    if (!aiProviderService.isProviderConfigured(validatedData.provider)) {
      return res.status(400).json({
        error: `Provedor ${validatedData.provider} não está configurado. Verifique as variáveis de ambiente.`
      });
    }

    // Prepare AI request with Grok features
    const aiRequest = {
      provider: validatedData.provider,
      model: validatedData.model,
      messages: [
        {
          role: 'user' as const,
          content: validatedData.prompt
        }
      ],
      temperature: validatedData.temperature || 0.7,
      maxTokens: validatedData.maxTokens || 1000,
      referenceImages: validatedData.referenceImages?.map(img => img.data),
      // Grok-specific features
      reasoningLevel: validatedData.reasoningLevel,
      enableSearch: validatedData.enableSearch,
    };

    console.log('🚀 [AI_PROVIDER_TEST] Request prepared:', {
      provider: aiRequest.provider,
      model: aiRequest.model,
      hasImages: !!aiRequest.referenceImages?.length,
      grokFeatures: {
        reasoningLevel: aiRequest.reasoningLevel,
        enableSearch: aiRequest.enableSearch
      }
    });

    // Generate response
    const response = await aiProviderService.generateResponse(aiRequest);

    console.log('✅ [AI_PROVIDER_TEST] Response generated successfully');

    res.json({
      success: true,
      response: response.content,
      usage: response.usage,
      cost: response.cost,
      requestSent: JSON.stringify(aiRequest, null, 2),
      responseReceived: JSON.stringify(response, null, 2)
    });

  } catch (error) {
    console.error('❌ [AI_PROVIDER_TEST] Test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no teste';
    
    res.status(500).json({
      error: `Falha no teste de conexão: ${errorMessage}`,
      success: false
    });
  }
});

// Get Provider Status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = aiProviderService.getProviderStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ [AI_PROVIDER_STATUS] Failed to get status:', error);
    res.status(500).json({ error: 'Falha ao obter status dos provedores' });
  }
});

// Get All Available Models
router.get('/models', requireAuth, async (req, res) => {
  try {
    const models = aiProviderService.getAllModels();
    res.json(models);
  } catch (error) {
    console.error('❌ [AI_PROVIDER_MODELS] Failed to get models:', error);
    res.status(500).json({ error: 'Falha ao obter modelos disponíveis' });
  }
});

// Get Models by Provider
router.get('/models/:provider', requireAuth, async (req, res) => {
  try {
    const { provider } = req.params;
    const models = aiProviderService.getModelsByProvider(provider);
    res.json(models);
  } catch (error) {
    console.error('❌ [AI_PROVIDER_MODELS] Failed to get models for provider:', error);
    res.status(500).json({ error: 'Falha ao obter modelos do provedor' });
  }
});

export default router;