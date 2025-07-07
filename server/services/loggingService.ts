import { db } from "../db";
import { aiGenerationLogs, aiImgGenerationLogs } from "@shared/schema";

export class LoggingService {
  /**
   * Salva logs para ferramentas de IA (texto)
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
    duration: number = 0
  ): Promise<void> {
    try {
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
        duration,
        feature
      };

      await db.insert(aiGenerationLogs).values(logData);
      
      console.log(`💾 [AI_LOG] ${feature} saved for user ${userId} - ${provider}/${model}`);
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
    cost: number = 0,
    duration: number = 0,
    metadata: any = {}
  ): Promise<void> {
    try {
      const logData = {
        userId,
        provider,
        model,
        prompt: prompt.substring(0, 5000),
        imageUrl,
        promptCharacters: prompt.length,
        cost: cost.toString(),
        duration,
        feature,
        metadata: metadata ? JSON.stringify(metadata) : null
      };

      await db.insert(aiImgGenerationLogs).values(logData);
      
      console.log(`🖼️ [IMG_LOG] ${feature} saved for user ${userId} - ${provider}/${model}`);
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
    cost: number = 0
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
        duration,
        feature
      };

      await db.insert(aiGenerationLogs).values(logData);
      
      console.log(`🌐 [API_LOG] ${feature} saved for user ${userId} - ${provider}`);
    } catch (error) {
      console.error(`❌ [API_LOG] Error saving ${feature} log:`, error);
    }
  }
}