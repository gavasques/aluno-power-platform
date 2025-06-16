import { db } from "../db";
import { 
  news, 
  userNewsInteractions, 
  userPreferences, 
  newsRecommendations, 
  newsContentAnalysis,
  type News,
  type UserNewsInteraction,
  type UserPreferences,
  type NewsRecommendation,
  type NewsContentAnalysis,
  type InsertUserNewsInteraction,
  type InsertNewsRecommendation,
  type InsertNewsContentAnalysis,
  type InsertUserPreferences
} from "@shared/schema";
import { eq, desc, and, inArray, gt, lt, sql, not } from "drizzle-orm";

export class RecommendationEngine {
  
  // Content Analysis Methods
  async analyzeNewsContent(newsItem: News): Promise<NewsContentAnalysis> {
    const keywords = this.extractKeywords(newsItem.content);
    const entities = this.extractEntities(newsItem.content);
    const topics = this.classifyTopics(newsItem.content, newsItem.category);
    const sentiment = this.analyzeSentiment(newsItem.content);
    const readingTime = this.calculateReadingTime(newsItem.content);
    const complexity = this.assessContentComplexity(newsItem.content);

    const analysisData: InsertNewsContentAnalysis = {
      newsId: newsItem.id,
      keywords,
      entities,
      topics,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score.toString(),
      readingTime,
      contentComplexity: complexity,
      language: "pt-BR"
    };

    const [analysis] = await db
      .insert(newsContentAnalysis)
      .values(analysisData)
      .onConflictDoUpdate({
        target: newsContentAnalysis.newsId,
        set: analysisData
      })
      .returning();

    return analysis;
  }

  private extractKeywords(content: string): string[] {
    // Portuguese stopwords
    const stopwords = new Set([
      'a', 'o', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'com', 'para', 'por', 'que', 'se', 
      'na', 'no', 'ao', 'como', 'mais', 'mas', 'foi', 'muito', 'sua', 'seu', 'são', 'dos', 
      'das', 'tem', 'ter', 'ser', 'está', 'isso', 'quando', 'pode', 'sobre', 'entre', 'após',
      'pela', 'pelo', 'até', 'todos', 'todas', 'apenas', 'já', 'ainda', 'vai', 'vem', 'vez'
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.has(word));

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractEntities(content: string): string[] {
    // Simple entity extraction - in production, use NLP libraries
    const entityPatterns = [
      /\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g, // Proper nouns
      /\b(?:Amazon|Microsoft|Google|Apple|Meta|Tesla|Brasil|São Paulo|Rio de Janeiro)\b/gi, // Known entities
      /\b[A-Z]{2,}\b/g, // Acronyms
    ];

    const entities = new Set<string>();
    
    entityPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        if (match.length > 2) {
          entities.add(match.trim());
        }
      });
    });

    return Array.from(entities).slice(0, 15);
  }

  private classifyTopics(content: string, category?: string | null): string[] {
    const topics = new Set<string>();
    
    if (category) {
      topics.add(category);
    }

    // Topic classification based on keywords
    const topicKeywords = {
      'tecnologia': ['tecnologia', 'software', 'app', 'digital', 'internet', 'sistema', 'plataforma', 'dados'],
      'negócios': ['empresa', 'mercado', 'vendas', 'lucro', 'investimento', 'economia', 'negócio'],
      'e-commerce': ['venda', 'loja', 'produto', 'cliente', 'marketplace', 'online'],
      'importação': ['importação', 'china', 'fornecedor', 'alfândega', 'imposto'],
      'marketing': ['marketing', 'publicidade', 'campanha', 'anúncio', 'propaganda'],
      'educação': ['curso', 'treinamento', 'aprender', 'conhecimento', 'educação'],
      'finanças': ['dinheiro', 'financeiro', 'investir', 'capital', 'receita']
    };

    const contentLower = content.toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        return count + (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      }, 0);
      
      if (score > 0) {
        topics.add(topic);
      }
    });

    return Array.from(topics);
  }

  private analyzeSentiment(content: string): { label: string; score: number } {
    // Simple sentiment analysis - in production, use ML models
    const positiveWords = ['bom', 'ótimo', 'excelente', 'sucesso', 'melhoria', 'crescimento', 'lucro', 'ganho'];
    const negativeWords = ['ruim', 'problema', 'erro', 'falha', 'perda', 'crise', 'dificuldade'];
    
    const contentLower = content.toLowerCase();
    
    const positiveScore = positiveWords.reduce((score, word) => {
      return score + (contentLower.match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    const negativeScore = negativeWords.reduce((score, word) => {
      return score + (contentLower.match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    const totalScore = positiveScore - negativeScore;
    const normalizedScore = Math.max(-1, Math.min(1, totalScore / 10));
    
    let label = 'neutral';
    if (normalizedScore > 0.2) label = 'positive';
    else if (normalizedScore < -0.2) label = 'negative';
    
    return { label, score: Number(normalizedScore.toFixed(2)) };
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private assessContentComplexity(content: string): string {
    const avgWordsPerSentence = this.getAverageWordsPerSentence(content);
    const avgSyllablesPerWord = this.getAverageSyllablesPerWord(content);
    
    // Simple complexity score
    const complexityScore = (avgWordsPerSentence * 0.5) + (avgSyllablesPerWord * 2);
    
    if (complexityScore < 8) return 'low';
    if (complexityScore < 15) return 'medium';
    return 'high';
  }

  private getAverageWordsPerSentence(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((total, sentence) => {
      return total + sentence.trim().split(/\s+/).length;
    }, 0);
    
    return totalWords / sentences.length;
  }

  private getAverageSyllablesPerWord(content: string): number {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;
    
    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word);
    }, 0);
    
    return totalSyllables / words.length;
  }

  private countSyllables(word: string): number {
    // Simple syllable counting for Portuguese
    const vowels = 'aeiouáàâãéèêíìîóòôõúùû';
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  }

  // User Interaction Tracking
  async trackInteraction(interaction: InsertUserNewsInteraction): Promise<UserNewsInteraction> {
    const [tracked] = await db
      .insert(userNewsInteractions)
      .values({
        ...interaction,
        createdAt: new Date()
      })
      .returning();

    // Update user preferences based on interaction
    await this.updateUserPreferences(interaction.userId, interaction.newsId);

    return tracked;
  }

  // User Preference Management
  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    return preferences || null;
  }

  async updateUserPreferences(userId: number, newsId: number): Promise<void> {
    // Get news details
    const [newsItem] = await db
      .select()
      .from(news)
      .where(eq(news.id, newsId));

    if (!newsItem) return;

    // Get or create user preferences
    let preferences = await this.getUserPreferences(userId);
    
    if (!preferences) {
      const [created] = await db
        .insert(userPreferences)
        .values({
          userId,
          preferredCategories: newsItem.category ? [newsItem.category] : [],
          interests: [],
          lastActiveAt: new Date()
        })
        .returning();
      preferences = created;
    }

    // Update preferences based on interaction
    const currentCategories = preferences.preferredCategories || [];
    const updatedCategories = newsItem.category && !currentCategories.includes(newsItem.category)
      ? [...currentCategories, newsItem.category]
      : currentCategories;

    await db
      .update(userPreferences)
      .set({
        preferredCategories: updatedCategories,
        lastActiveAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId));
  }

  // Recommendation Generation
  async generateRecommendations(userId: number, limit: number = 10): Promise<NewsRecommendation[]> {
    const preferences = await this.getUserPreferences(userId);
    
    // Get user's interaction history
    const recentInteractions = await db
      .select()
      .from(userNewsInteractions)
      .where(eq(userNewsInteractions.userId, userId))
      .orderBy(desc(userNewsInteractions.createdAt))
      .limit(50);

    const viewedNewsIds = recentInteractions.map(i => i.newsId);

    // Content-based recommendations
    const contentRecommendations = await this.generateContentBasedRecommendations(
      userId, 
      preferences, 
      viewedNewsIds, 
      Math.ceil(limit * 0.7)
    );

    // Trending recommendations
    const trendingRecommendations = await this.generateTrendingRecommendations(
      userId, 
      viewedNewsIds, 
      Math.floor(limit * 0.3)
    );

    // Combine and save recommendations
    const allRecommendations = [
      ...contentRecommendations,
      ...trendingRecommendations
    ].slice(0, limit);

    // Save recommendations to database
    if (allRecommendations.length > 0) {
      await db.insert(newsRecommendations).values(allRecommendations);
    }

    return allRecommendations;
  }

  private async generateContentBasedRecommendations(
    userId: number,
    preferences: UserPreferences | null,
    excludeNewsIds: number[],
    limit: number
  ): Promise<InsertNewsRecommendation[]> {
    const recommendations: InsertNewsRecommendation[] = [];
    
    // Query news based on user preferences
    let query = db
      .select()
      .from(news)
      .where(
        and(
          eq(news.isPublished, true),
          excludeNewsIds.length > 0 ? not(inArray(news.id, excludeNewsIds)) : undefined
        )
      )
      .orderBy(desc(news.createdAt))
      .limit(limit * 2); // Get more to filter later

    const candidateNews = await query;

    for (const newsItem of candidateNews) {
      if (recommendations.length >= limit) break;

      let score = 0.1; // Base score
      const reasons: string[] = [];

      // Category preference matching
      if (preferences?.preferredCategories?.includes(newsItem.category || '')) {
        score += 0.4;
        reasons.push('Categoria de interesse');
      }

      // Recency bonus
      const daysSincePublished = Math.floor(
        (Date.now() - new Date(newsItem.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePublished <= 1) {
        score += 0.3;
        reasons.push('Conteúdo recente');
      } else if (daysSincePublished <= 7) {
        score += 0.1;
      }

      // Featured content bonus
      if (newsItem.isFeatured) {
        score += 0.2;
        reasons.push('Conteúdo em destaque');
      }

      if (score > 0.3) { // Minimum threshold
        recommendations.push({
          userId,
          newsId: newsItem.id,
          score: Math.min(1, score).toString(),
          algorithm: 'content-based',
          reasons,
          context: 'dashboard'
        });
      }
    }

    return recommendations.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
  }

  private async generateTrendingRecommendations(
    userId: number,
    excludeNewsIds: number[],
    limit: number
  ): Promise<InsertNewsRecommendation[]> {
    const recommendations: InsertNewsRecommendation[] = [];

    // Get trending news based on interaction volume
    const trendingNews = await db
      .select({
        news,
        interactionCount: sql<number>`COUNT(${userNewsInteractions.id})`.as('interaction_count')
      })
      .from(news)
      .leftJoin(userNewsInteractions, eq(news.id, userNewsInteractions.newsId))
      .where(
        and(
          eq(news.isPublished, true),
          gt(news.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
          excludeNewsIds.length > 0 ? not(inArray(news.id, excludeNewsIds)) : undefined
        )
      )
      .groupBy(news.id)
      .orderBy(desc(sql`interaction_count`), desc(news.createdAt))
      .limit(limit);

    for (const item of trendingNews) {
      const score = Math.min(1, 0.6 + (item.interactionCount * 0.05));
      
      recommendations.push({
        userId,
        newsId: item.news.id,
        score: score.toString(),
        algorithm: 'trending',
        reasons: ['Conteúdo popular', 'Trending'],
        context: 'dashboard'
      });
    }

    return recommendations;
  }

  // Get recommendations for user
  async getRecommendationsForUser(userId: number, context: string = 'dashboard'): Promise<(NewsRecommendation & { news: News })[]> {
    return await db
      .select({
        id: newsRecommendations.id,
        userId: newsRecommendations.userId,
        newsId: newsRecommendations.newsId,
        score: newsRecommendations.score,
        algorithm: newsRecommendations.algorithm,
        reasons: newsRecommendations.reasons,
        isShown: newsRecommendations.isShown,
        isClicked: newsRecommendations.isClicked,
        position: newsRecommendations.position,
        context: newsRecommendations.context,
        createdAt: newsRecommendations.createdAt,
        shownAt: newsRecommendations.shownAt,
        clickedAt: newsRecommendations.clickedAt,
        news
      })
      .from(newsRecommendations)
      .innerJoin(news, eq(newsRecommendations.newsId, news.id))
      .where(
        and(
          eq(newsRecommendations.userId, userId),
          eq(newsRecommendations.context, context),
          eq(newsRecommendations.isShown, false)
        )
      )
      .orderBy(desc(newsRecommendations.score))
      .limit(10);
  }

  // Mark recommendations as shown
  async markRecommendationsAsShown(recommendationIds: number[]): Promise<void> {
    if (recommendationIds.length === 0) return;
    
    await db
      .update(newsRecommendations)
      .set({ 
        isShown: true, 
        shownAt: new Date() 
      })
      .where(inArray(newsRecommendations.id, recommendationIds));
  }

  // Mark recommendation as clicked
  async markRecommendationAsClicked(recommendationId: number): Promise<void> {
    await db
      .update(newsRecommendations)
      .set({ 
        isClicked: true, 
        clickedAt: new Date() 
      })
      .where(eq(newsRecommendations.id, recommendationId));
  }
}