import { Router } from 'express';
import { requireAuth, requireRole } from '../security';
import { agentStepService } from '../services/AgentStepService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createStepSchema = z.object({
  agentId: z.string(),
  stepNumber: z.number().int().min(1).max(5),
  stepName: z.string().min(1),
  stepDescription: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'gemini', 'deepseek', 'xai']),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(100).max(10000),
  promptTemplate: z.string().min(1),
  outputFormat: z.enum(['text', 'json', 'structured']).default('text'),
  isActive: z.boolean().default(true),
});

const updateStepsSchema = z.object({
  steps: z.array(createStepSchema),
});

/**
 * GET /api/agent-steps/:agentId
 * Get all steps for a specific agent
 */
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    console.log(`🔍 [AGENT_STEPS] Fetching steps for agent: ${agentId}`);
    
    const steps = await agentStepService.getAgentSteps(agentId);
    const isMultiStep = await agentStepService.isMultiStepAgent(agentId);
    const stepCount = await agentStepService.getStepCount(agentId);
    
    res.json({
      success: true,
      data: {
        agentId,
        steps,
        isMultiStep,
        stepCount,
        totalSteps: steps.length
      }
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error fetching steps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent steps'
    });
  }
});

/**
 * POST /api/agent-steps/:agentId
 * Create or update steps for an agent
 */
router.post('/:agentId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { agentId } = req.params;
    const validatedData = updateStepsSchema.parse(req.body);
    
    console.log(`🔄 [AGENT_STEPS] Updating steps for agent: ${agentId}`, {
      stepCount: validatedData.steps.length,
      providers: [...new Set(validatedData.steps.map(s => s.provider))]
    });
    
    // First, deactivate all existing steps
    const existingSteps = await agentStepService.getAgentSteps(agentId);
    for (const step of existingSteps) {
      if (step.id) {
        await agentStepService.deleteAgentStep(step.id);
      }
    }
    
    // Create new steps
    const createdSteps = [];
    for (const stepData of validatedData.steps) {
      const step = await agentStepService.createAgentStep({
        ...stepData,
        agentId,
      });
      createdSteps.push(step);
    }
    
    console.log(`✅ [AGENT_STEPS] Successfully updated ${createdSteps.length} steps for agent ${agentId}`);
    
    res.json({
      success: true,
      data: {
        message: 'Agent steps updated successfully',
        agentId,
        steps: createdSteps,
        stepCount: createdSteps.length
      }
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error updating steps:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid step configuration',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update agent steps'
    });
  }
});

/**
 * PUT /api/agent-steps/step/:stepId
 * Update a specific step
 */
router.put('/step/:stepId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { stepId } = req.params;
    const updateData = createStepSchema.partial().parse(req.body);
    
    console.log(`🔄 [AGENT_STEPS] Updating step: ${stepId}`);
    
    const updatedStep = await agentStepService.updateAgentStep(stepId, updateData);
    
    res.json({
      success: true,
      data: {
        message: 'Step updated successfully',
        step: updatedStep
      }
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error updating step:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid step data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update step'
    });
  }
});

/**
 * DELETE /api/agent-steps/step/:stepId
 * Delete a specific step
 */
router.delete('/step/:stepId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { stepId } = req.params;
    
    console.log(`🗑️ [AGENT_STEPS] Deleting step: ${stepId}`);
    
    await agentStepService.deleteAgentStep(stepId);
    
    res.json({
      success: true,
      data: {
        message: 'Step deleted successfully'
      }
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error deleting step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete step'
    });
  }
});

/**
 * POST /api/agent-steps/:agentId/execute
 * Execute multi-step agent process
 */
router.post('/:agentId/execute', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { inputData } = req.body;
    
    console.log(`🚀 [AGENT_STEPS] Executing multi-step process for agent: ${agentId}`);
    
    const result = await agentStepService.executeMultiStepProcess(agentId, inputData);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error executing steps:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute agent steps'
    });
  }
});

/**
 * GET /api/agent-steps/:agentId/status
 * Get agent step configuration status
 */
router.get('/:agentId/status', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const stepCount = await agentStepService.getStepCount(agentId);
    const isMultiStep = await agentStepService.isMultiStepAgent(agentId);
    
    res.json({
      success: true,
      data: {
        agentId,
        stepCount,
        isMultiStep,
        configuredSteps: stepCount > 0
      }
    });
    
  } catch (error) {
    console.error('❌ [AGENT_STEPS] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent step status'
    });
  }
});

export { router as agentStepsRouter };