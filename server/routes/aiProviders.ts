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
  enableImageUnderstanding: z.boolean().optional(),
  // OpenAI-specific features
  enableReasoning: z.boolean().optional(),
  reasoning_effort: z.enum(['low', 'medium', 'high']).optional(),
  response_format: z.object({
    type: z.enum(['text', 'json_object', 'json_schema'])
  }).optional(),
  seed: z.number().optional(),
  top_p: z.number().optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
  tools: z.array(z.object({
    type: z.string()
  })).optional(),
  fineTuneModel: z.string().optional(),
  selectedCollections: z.array(z.number()).optional()
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

    // Prepare AI request with all provider features
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
      // OpenAI-specific features
      enableReasoning: validatedData.enableReasoning,
      reasoning_effort: validatedData.reasoning_effort,
      response_format: validatedData.response_format,
      seed: validatedData.seed,
      top_p: validatedData.top_p,
      frequency_penalty: validatedData.frequency_penalty,
      presence_penalty: validatedData.presence_penalty,
      tools: validatedData.tools,
      fineTuneModel: validatedData.fineTuneModel,
      selectedCollections: validatedData.selectedCollections,
    };

    console.log('🚀 [AI_PROVIDER_TEST] Request prepared:', {
      provider: aiRequest.provider,
      model: aiRequest.model,
      hasImages: !!aiRequest.referenceImages?.length,
      grokFeatures: {
        reasoningLevel: aiRequest.reasoningLevel,
        enableSearch: aiRequest.enableSearch
      },
      openaiAdvanced: {
        enableReasoning: aiRequest.enableReasoning,
        reasoning_effort: aiRequest.reasoning_effort,
        response_format: aiRequest.response_format?.type,
        seed: aiRequest.seed,
        top_p: aiRequest.top_p,
        frequency_penalty: aiRequest.frequency_penalty,
        presence_penalty: aiRequest.presence_penalty,
        tools: aiRequest.tools?.length || 0,
        fineTuneModel: aiRequest.fineTuneModel
      }
    });

    // Log detailed parameters being sent to the AI provider
    console.log('📋 [PARAMETER_VERIFICATION] Complete AI request parameters:', JSON.stringify({
      provider: aiRequest.provider,
      model: aiRequest.model,
      temperature: aiRequest.temperature,
      maxTokens: aiRequest.maxTokens,
      reasoning_effort: aiRequest.reasoning_effort,
      response_format: aiRequest.response_format,
      seed: aiRequest.seed,
      top_p: aiRequest.top_p,
      frequency_penalty: aiRequest.frequency_penalty,
      presence_penalty: aiRequest.presence_penalty,
      enableReasoning: aiRequest.enableReasoning,
      reasoningLevel: aiRequest.reasoningLevel,
      enableSearch: aiRequest.enableSearch,
      tools: aiRequest.tools,
      fineTuneModel: aiRequest.fineTuneModel,
      selectedCollections: aiRequest.selectedCollections
    }, null, 2));

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