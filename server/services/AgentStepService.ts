import { db } from "../db";
import { agentSteps, agents } from "@shared/schema";
import type { InsertAgentStep, AgentStep } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { aiProviderService } from "./aiProviderService";
import { AIRequest, AIResponse } from "./types/ai.types";

export class AgentStepService {
  
  /**
   * Get all steps for a specific agent
   */
  async getAgentSteps(agentId: string): Promise<AgentStep[]> {
    return await db
      .select()
      .from(agentSteps)
      .where(and(
        eq(agentSteps.agentId, agentId),
        eq(agentSteps.isActive, true)
      ))
      .orderBy(agentSteps.stepNumber);
  }

  /**
   * Create a new agent step
   */
  async createAgentStep(stepData: InsertAgentStep): Promise<AgentStep> {
    const id = `step_${stepData.agentId}_${stepData.stepNumber}_${Date.now()}`;
    
    const [step] = await db
      .insert(agentSteps)
      .values({
        ...stepData,
        id,
      })
      .returning();
    
    return step;
  }

  /**
   * Update an existing agent step
   */
  async updateAgentStep(stepId: string, updates: Partial<InsertAgentStep>): Promise<AgentStep> {
    const [step] = await db
      .update(agentSteps)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(agentSteps.id, stepId))
      .returning();
    
    return step;
  }

  /**
   * Delete an agent step
   */
  async deleteAgentStep(stepId: string): Promise<void> {
    await db
      .update(agentSteps)
      .set({ isActive: false })
      .where(eq(agentSteps.id, stepId));
  }

  /**
   * Execute a single step with AI processing
   */
  async executeStep(
    step: AgentStep, 
    inputData: any, 
    previousStepOutput?: any
  ): Promise<{
    stepNumber: number;
    stepName: string;
    output: any;
    provider: string;
    model: string;
    tokens: { input: number; output: number; total: number };
    cost: number;
    duration: number;
  }> {
    const startTime = Date.now();
    
    // Build the prompt by replacing template variables
    const prompt = this.buildPrompt(step.promptTemplate, inputData, previousStepOutput);
    
    // Prepare AI request
    const aiRequest: AIRequest = {
      prompt,
      provider: step.provider as any,
      model: step.model,
      temperature: parseFloat(step.temperature.toString()),
      maxTokens: step.maxTokens,
      responseFormat: step.outputFormat === 'json' ? 'json_object' : undefined
    };

    console.log(`🚀 [STEP_${step.stepNumber}] Executing "${step.stepName}" with ${step.provider}/${step.model}`);
    
    // Execute AI request
    const response: AIResponse = await aiProviderService.generateResponse(aiRequest);
    
    const duration = Date.now() - startTime;
    
    // Parse output based on format
    let parsedOutput = response.content;
    if (step.outputFormat === 'json') {
      try {
        parsedOutput = JSON.parse(response.content);
      } catch (error) {
        console.warn(`⚠️ [STEP_${step.stepNumber}] Failed to parse JSON output, using raw text`);
      }
    }

    return {
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      output: parsedOutput,
      provider: step.provider,
      model: step.model,
      tokens: response.usage || { input: 0, output: 0, total: 0 },
      cost: response.cost || 0,
      duration
    };
  }

  /**
   * Execute all steps for an agent in sequence
   */
  async executeMultiStepProcess(
    agentId: string, 
    inputData: any
  ): Promise<{
    steps: any[];
    totalTokens: { input: number; output: number; total: number };
    totalCost: number;
    totalDuration: number;
    finalOutput: any;
  }> {
    const steps = await this.getAgentSteps(agentId);
    
    if (steps.length === 0) {
      throw new Error(`No active steps found for agent ${agentId}`);
    }

    console.log(`🎯 [MULTI_STEP] Starting ${steps.length}-step process for agent ${agentId}`);
    
    const results = [];
    let previousOutput = null;
    let totalCost = 0;
    let totalDuration = 0;
    let totalTokens = { input: 0, output: 0, total: 0 };

    for (const step of steps) {
      try {
        const stepResult = await this.executeStep(step, inputData, previousOutput);
        
        results.push(stepResult);
        previousOutput = stepResult.output;
        totalCost += stepResult.cost;
        totalDuration += stepResult.duration;
        totalTokens.input += stepResult.tokens.input;
        totalTokens.output += stepResult.tokens.output;
        totalTokens.total += stepResult.tokens.total;

        console.log(`✅ [STEP_${step.stepNumber}] "${step.stepName}" completed in ${stepResult.duration}ms`);
        
      } catch (error) {
        console.error(`❌ [STEP_${step.stepNumber}] Failed:`, error);
        throw new Error(`Step ${step.stepNumber} (${step.stepName}) failed: ${error.message}`);
      }
    }

    console.log(`🎉 [MULTI_STEP] Process completed in ${totalDuration}ms - Total cost: $${totalCost.toFixed(6)}`);

    return {
      steps: results,
      totalTokens,
      totalCost,
      totalDuration,
      finalOutput: previousOutput
    };
  }

  /**
   * Build prompt by replacing template variables
   */
  private buildPrompt(template: string, inputData: any, previousStepOutput?: any): string {
    let prompt = template;
    
    // Replace input data variables
    if (inputData) {
      Object.keys(inputData).forEach(key => {
        const placeholder = `{{${key}}}`;
        if (prompt.includes(placeholder)) {
          prompt = prompt.replace(new RegExp(placeholder, 'g'), inputData[key]);
        }
      });
    }
    
    // Replace previous step output
    if (previousStepOutput) {
      const outputStr = typeof previousStepOutput === 'string' 
        ? previousStepOutput 
        : JSON.stringify(previousStepOutput, null, 2);
      prompt = prompt.replace(/\{\{previousOutput\}\}/g, outputStr);
    }
    
    return prompt;
  }

  /**
   * Check if agent has multi-step configuration
   */
  async isMultiStepAgent(agentId: string): Promise<boolean> {
    const steps = await db
      .select({ count: agentSteps.id })
      .from(agentSteps)
      .where(and(
        eq(agentSteps.agentId, agentId),
        eq(agentSteps.isActive, true)
      ));
    
    return steps.length > 1;
  }

  /**
   * Get step count for an agent
   */
  async getStepCount(agentId: string): Promise<number> {
    const steps = await this.getAgentSteps(agentId);
    return steps.length;
  }
}

export const agentStepService = new AgentStepService();