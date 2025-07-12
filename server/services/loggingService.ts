import { db } from "../db";
import { aiGenerationLogs, aiImgGenerationLogs } from "@shared/schema";
import { CreditService } from "./creditService";

export class LoggingService {
  /**
   * Salva logs para ferramentas de IA (texto) COM desconto automático de créditos
   */
  static async saveAiLog(
    userId: number,
    feature: string,
    prompt: string,
    response: string,
    provider: string = "openai",
    model: string = "gpt-4o-mini",
    inputTokens: number = 0,
    outputTokens: number = 0,
    totalTokens: number = 0,
    cost: number = 0,
    creditsUsed: number = 0,
    duration: number = 0
  ): Promise<void> {
    try {
      // 1. DESCONTAR CRÉDITOS AUTOMATICAMENTE (se creditsUsed for 0)
      if (creditsUsed === 0) {
        try {
          creditsUsed = await CreditService.deductCredits(userId, feature);
        } catch (creditError) {
          console.error(`❌ [CREDIT] Failed to deduct credits for ${feature}:`, creditError);
          // Continue sem descontar créditos se der erro na configuração
        }
      }

      const logData = {
        userId,
        provider,
        model,
        prompt: prompt.substring(0, 5000), // Limitar tamanho
        response: response.substring(0, 10000), // Limitar tamanho
        promptCharacters: prompt.length,
        responseCharacters: response.length,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: cost.toString(),
        creditsUsed: creditsUsed.toString(),
        duration,
        feature
      };

      await db.insert(aiGenerationLogs).values(logData);
      
      console.log(`💾 [AI_LOG] ${feature} saved for user ${userId} - ${provider}/${model} - Cost: ${cost} - Credits: ${creditsUsed}`);
    } catch (error) {
      console.error(`❌ [AI_LOG] Error saving ${feature} log:`, error);
    }
  }

  /**
   * Salva logs para ferramentas de imagem
   */
  static async saveImageLog(
    userId: number,
    feature: string,
    prompt: string,
    imageUrl: string,
    provider: string = "openai",
    model: string = "dall-e-3",
    inputTokens: number = 0,
    outputTokens: number = 0,
    totalTokens: number = 0,
    cost: number = 0,
    creditsUsed: number = 0,
    duration: number = 0,
    metadata: any = {}
  ): Promise<void> {
    try {
      const logData = {
        userId,
        provider,
        model,
        feature,
        originalImageName: null,
        originalImageSize: null,
        generatedImageUrl: imageUrl,
        generatedImageSize: null,
        prompt: prompt.substring(0, 5000),
        scale: null,
        quality: null,
        apiResponse: metadata ? JSON.stringify(metadata) : null,
        status: 'success',
        errorMessage: null,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: cost.toString(),
        creditsUsed: creditsUsed.toString(),
        duration,
        requestId: null,
        sessionId: null,
        userAgent: null,
        ipAddress: null,
        metadata: metadata ? JSON.stringify(metadata) : null
      };

      await db.insert(aiImgGenerationLogs).values(logData);
      
      console.log(`🖼️ [IMG_LOG] ${feature} saved for user ${userId} - ${provider}/${model} - Cost: ${cost} - Credits: ${creditsUsed}`);
    } catch (error) {
      console.error(`❌ [IMG_LOG] Error saving ${feature} log:`, error);
    }
  }

  /**
   * Salva log para APIs externas (como CNPJ, Keywords)
   */
  static async saveApiLog(
    userId: number,
    feature: string,
    query: string,
    response: string,
    provider: string = "external-api",
    model: string = "api",
    duration: number = 0,
    cost: number = 0,
    creditsUsed: number = 0
  ): Promise<void> {
    try {
      const logData = {
        userId,
        provider,
        model,
        prompt: `API Query: ${query}`.substring(0, 5000),
        response: response.substring(0, 10000),
        promptCharacters: query.length,
        responseCharacters: response.length,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: cost.toString(),
        creditsUsed: creditsUsed.toString(),
        duration,
        feature
      };

      await db.insert(aiGenerationLogs).values(logData);
      
      console.log(`🌐 [API_LOG] ${feature} saved for user ${userId} - ${provider} - Cost: ${cost} - Credits: ${creditsUsed}`);
    } catch (error) {
      console.error(`❌ [API_LOG] Error saving ${feature} log:`, error);
    }
  }
}