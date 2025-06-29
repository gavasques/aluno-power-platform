import { db } from "../db";
import { agentSessions, agentSessionFiles } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export interface SessionData {
  productName?: string;
  brand?: string;
  category?: string;
  keywords?: string;
  longTailKeywords?: string;
  mainFeatures?: string;
  targetAudience?: string;
  reviewsData?: string;
}

export interface SessionTags {
  PRODUCT_NAME?: string;
  BRAND?: string;
  CATEGORY?: string;
  KEYWORDS?: string;
  LONG_TAIL_KEYWORDS?: string;
  MAIN_FEATURES?: string;
  TARGET_AUDIENCE?: string;
  REVIEWS_DATA?: string;
}

export class SessionService {
  // Criar nova sessão
  static async createSession(userId: string, agentType: string = "amazon-listing-optimizer") {
    const sessionHash = this.generateSessionHash();
    
    const [session] = await db
      .insert(agentSessions)
      .values({
        sessionHash,
        userId,
        agentType,
        status: "active",
        inputData: {},
        tags: {}
      })
      .returning();
    
    return session;
  }

  // Atualizar dados da sessão e gerar tags
  static async updateSessionData(sessionId: string, data: SessionData) {
    const tags = this.generateTags(data);
    
    const [session] = await db
      .update(agentSessions)
      .set({
        inputData: data,
        tags,
        updatedAt: new Date()
      })
      .where(eq(agentSessions.id, sessionId))
      .returning();
    
    return session;
  }

  // Buscar sessão por ID
  static async getSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.id, sessionId));
    
    return session;
  }

  // Buscar sessão por hash
  static async getSessionByHash(sessionHash: string) {
    const [session] = await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.sessionHash, sessionHash));
    
    return session;
  }

  // Adicionar arquivo à sessão
  static async addFileToSession(
    sessionId: string,
    fileName: string,
    fileType: string,
    fileUrl: string,
    fileSize: number,
    processedContent?: string
  ) {
    const [file] = await db
      .insert(agentSessionFiles)
      .values({
        sessionId,
        fileName,
        fileType,
        fileUrl,
        fileSize,
        processedContent
      })
      .returning();
    
    return file;
  }

  // Buscar arquivos da sessão
  static async getSessionFiles(sessionId: string) {
    return await db
      .select()
      .from(agentSessionFiles)
      .where(eq(agentSessionFiles.sessionId, sessionId));
  }

  // Marcar sessão como completa
  static async completeSession(sessionId: string) {
    const [session] = await db
      .update(agentSessions)
      .set({
        status: "completed",
        updatedAt: new Date()
      })
      .where(eq(agentSessions.id, sessionId))
      .returning();
    
    return session;
  }

  // Gerar hash único da sessão
  private static generateSessionHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `ALS-${timestamp.slice(-6)}${random.toUpperCase()}`;
  }

  // Gerar tags dos dados da sessão
  private static generateTags(data: SessionData): SessionTags {
    const tags: SessionTags = {};
    
    if (data.productName) {
      tags.PRODUCT_NAME = data.productName.trim();
    }
    
    if (data.brand) {
      tags.BRAND = data.brand.trim();
    }
    
    if (data.category) {
      tags.CATEGORY = data.category.trim();
    }
    
    if (data.keywords) {
      tags.KEYWORDS = data.keywords.trim();
    }
    
    if (data.longTailKeywords) {
      tags.LONG_TAIL_KEYWORDS = data.longTailKeywords.trim();
    }
    
    if (data.mainFeatures) {
      tags.MAIN_FEATURES = data.mainFeatures.trim();
    }
    
    if (data.targetAudience) {
      tags.TARGET_AUDIENCE = data.targetAudience.trim();
    }
    
    if (data.reviewsData) {
      tags.REVIEWS_DATA = data.reviewsData.trim();
    }
    
    return tags;
  }

  // Obter tags disponíveis para prompts
  static getAvailableTags(sessionData: SessionTags): string[] {
    return Object.keys(sessionData).map(key => `{${key}}`);
  }
}