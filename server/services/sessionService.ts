import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { AgentSession, AgentSessionWithFiles, InsertAgentSession, InsertAgentSessionFile } from '@shared/schema';

/**
 * SessionService - Gerencia sessões de agentes seguindo princípios SOLID
 * Responsabilidade única: gerenciar ciclo de vida das sessões
 */
export class SessionService {
  
  /**
   * Cria uma nova sessão para um agente
   */
  async createSession(userId: string, agentType: string, inputData: any = {}): Promise<AgentSession> {
    const sessionHash = this.generateSessionHash();
    
    const sessionData: InsertAgentSession = {
      sessionHash,
      userId,
      agentType,
      status: 'active',
      inputData,
      tags: this.generateInitialTags(inputData),
    };

    return await storage.createAgentSession(sessionData);
  }

  /**
   * Busca uma sessão por hash
   */
  async getSessionByHash(sessionHash: string): Promise<AgentSessionWithFiles | null> {
    return await storage.getAgentSessionByHash(sessionHash);
  }

  /**
   * Atualiza dados de entrada e tags de uma sessão
   */
  async updateSessionData(sessionId: string, inputData: any): Promise<AgentSession> {
    const tags = this.generateTags(inputData);
    return await storage.updateAgentSession(sessionId, { inputData, tags });
  }

  /**
   * Adiciona arquivo à sessão
   */
  async addFileToSession(sessionId: string, fileData: Omit<InsertAgentSessionFile, 'sessionId'>): Promise<void> {
    await storage.createAgentSessionFile({
      ...fileData,
      sessionId,
    });
  }

  /**
   * Processa múltiplos arquivos e combina o conteúdo
   */
  async processMultipleFiles(sessionId: string, files: Array<{ name: string; content: string }>): Promise<string> {
    let combinedContent = '';

    for (const file of files) {
      combinedContent += `\n\n=== ARQUIVO: ${file.name} ===\n${file.content}`;
      
      // Salva arquivo processado
      await this.addFileToSession(sessionId, {
        fileName: file.name,
        fileType: 'text/plain',
        fileUrl: '', // Não há URL física, apenas conteúdo processado
        fileSize: file.content.length,
        processedContent: file.content,
      });
    }

    return combinedContent.trim();
  }

  /**
   * Completa uma sessão
   */
  async completeSession(sessionId: string): Promise<void> {
    await storage.updateAgentSession(sessionId, { status: 'completed' });
  }

  /**
   * Gera hash único para a sessão
   */
  private generateSessionHash(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Gera tags iniciais baseadas nos dados de entrada
   */
  private generateInitialTags(inputData: any): Record<string, string> {
    const tags: Record<string, string> = {};
    
    if (inputData.productName) {
      tags.PRODUCT_NAME = inputData.productName;
    }
    
    return tags;
  }

  /**
   * Gera todas as tags baseadas nos dados completos
   */
  private generateTags(inputData: any): Record<string, string> {
    const tags: Record<string, string> = {};

    // Tags básicas
    if (inputData.productName) tags.PRODUCT_NAME = inputData.productName;
    if (inputData.category) tags.CATEGORY = inputData.category;
    if (inputData.keywords) tags.KEYWORDS = inputData.keywords;
    if (inputData.longTailKeywords) tags.LONG_TAIL_KEYWORDS = inputData.longTailKeywords;
    if (inputData.features) tags.FEATURES = inputData.features;
    if (inputData.targetAudience) tags.TARGET_AUDIENCE = inputData.targetAudience;
    if (inputData.reviewsData) tags.REVIEWS_DATA = inputData.reviewsData;

    // Tags derivadas
    if (inputData.keywords && inputData.longTailKeywords) {
      tags.ALL_KEYWORDS = `${inputData.keywords}, ${inputData.longTailKeywords}`;
    }

    return tags;
  }

  /**
   * Lista sessões ativas de um usuário
   */
  async getUserActiveSessions(userId: string, agentType?: string): Promise<AgentSession[]> {
    return await storage.getUserAgentSessions(userId, agentType, 'active');
  }
}

export const sessionService = new SessionService();