import { Router, Request, Response } from 'express';
import { requireRole } from '../../security';
import { ProviderConfigService } from '../../services/ProviderConfigService';

const router = Router();
const providerConfigService = ProviderConfigService.getInstance();

// Initialize provider and model configurations
router.post('/initialize', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    await providerConfigService.initializeProviderConfigs();
    await providerConfigService.initializeModelConfigs();
    
    res.json({ message: 'Provider configurations initialized successfully' });
  } catch (error) {
    console.error('Error initializing provider configs:', error);
    res.status(500).json({ error: 'Failed to initialize provider configurations' });
  }
});

// Get all provider configurations
router.get('/providers', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const providers = await providerConfigService.getProviderConfigs();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching provider configs:', error);
    res.status(500).json({ error: 'Failed to fetch provider configurations' });
  }
});

// Get specific provider configuration
router.get('/providers/:provider', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const config = await providerConfigService.getProviderConfig(provider);
    
    if (!config) {
      return res.status(404).json({ error: 'Provider configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching provider config:', error);
    res.status(500).json({ error: 'Failed to fetch provider configuration' });
  }
});

// Update provider configuration
router.put('/providers/:provider', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const result = await providerConfigService.updateProviderConfig(provider, req.body);
    
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Provider configuration not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating provider config:', error);
    res.status(500).json({ error: 'Failed to update provider configuration' });
  }
});

// Get all model configurations
router.get('/models', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;
    const models = await providerConfigService.getModelConfigs(provider as string);
    res.json(models);
  } catch (error) {
    console.error('Error fetching model configs:', error);
    res.status(500).json({ error: 'Failed to fetch model configurations' });
  }
});

// Get specific model configuration
router.get('/models/:provider/:model', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { provider, model } = req.params;
    const config = await providerConfigService.getModelConfig(provider, model);
    
    if (!config) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching model config:', error);
    res.status(500).json({ error: 'Failed to fetch model configuration' });
  }
});

// Update model configuration
router.put('/models/:provider/:model', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { provider, model } = req.params;
    const result = await providerConfigService.updateModelConfig(provider, model, req.body);
    
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating model config:', error);
    res.status(500).json({ error: 'Failed to update model configuration' });
  }
});

// Get agent configuration with inherited settings
router.get('/agents/:agentId/config', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const config = await providerConfigService.getAgentConfiguration(agentId);
    res.json(config);
  } catch (error) {
    console.error('Error fetching agent config:', error);
    res.status(500).json({ error: 'Failed to fetch agent configuration' });
  }
});

export default router;