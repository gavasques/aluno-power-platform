import { SOPRecommendation } from './types';

// Interfaces
interface FilterCriteria {
  keyword: string;
  campaign: string;
  ruleType: string;
  actionType: string;
}

interface IgnoredRecommendation {
  id: string;
  keyword: string;
  campaign: string;
  ruleApplied: string;
  ignoredAt: Date;
  reason: string;
  criteria: FilterCriteria;
}

interface FilterResult {
  shouldFilter: boolean;
  reason: string;
  confidence: number;
}

interface SmartFilterConfig {
  enablePatternLearning: boolean;
  enableSimilarKeywordFiltering: boolean;
  enableCampaignLevelFiltering: boolean;
  enablePerformanceBasedFiltering: boolean;
  similarityThreshold: number;
}

// Sistema inteligente de filtro
export class SmartRecommendationFilter {
  private ignoredRecommendations: IgnoredRecommendation[];
  private config: SmartFilterConfig;

  constructor(
    ignoredRecommendations: IgnoredRecommendation[],
    config: SmartFilterConfig = {
      enablePatternLearning: true,
      enableSimilarKeywordFiltering: true,
      enableCampaignLevelFiltering: true,
      enablePerformanceBasedFiltering: true,
      similarityThreshold: 0.8
    }
  ) {
    this.ignoredRecommendations = ignoredRecommendations;
    this.config = config;
  }

  // Verifica se uma recomendação deve ser filtrada
  shouldFilterRecommendation(
    recommendation: SOPRecommendation
  ): FilterResult {
    // 1. Filtro Exato
    const exactMatch = this.checkExactMatch(recommendation);
    if (exactMatch.shouldFilter) {
      return exactMatch;
    }

    // 2. Filtro por Keywords Similares
    if (this.config.enableSimilarKeywordFiltering) {
      const similarMatch = this.checkSimilarKeywords(recommendation);
      if (similarMatch.shouldFilter) {
        return similarMatch;
      }
    }

    // 3. Filtro por Campanha
    if (this.config.enableCampaignLevelFiltering) {
      const campaignMatch = this.checkCampaignPatterns(recommendation);
      if (campaignMatch.shouldFilter) {
        return campaignMatch;
      }
    }

    // 4. Filtro por Performance Similar
    if (this.config.enablePerformanceBasedFiltering) {
      const performanceMatch = this.checkPerformancePatterns(recommendation);
      if (performanceMatch.shouldFilter) {
        return performanceMatch;
      }
    }

    return {
      shouldFilter: false,
      reason: '',
      confidence: 0
    };
  }

  // Verifica correspondência exata
  private checkExactMatch(recommendation: SOPRecommendation): FilterResult {
    const ruleType = recommendation.ruleApplied.split(':')[0];
    const actionType = this.getActionType(recommendation.action);

    const exactMatch = this.ignoredRecommendations.find(ignored =>
      ignored.criteria.keyword === recommendation.keyword &&
      ignored.criteria.campaign === recommendation.campaign &&
      ignored.criteria.ruleType === ruleType &&
      ignored.criteria.actionType === actionType
    );

    return {
      shouldFilter: !!exactMatch,
      reason: exactMatch ? 'Recomendação idêntica já foi ignorada anteriormente' : '',
      confidence: exactMatch ? 1.0 : 0
    };
  }

  // Verifica keywords similares
  private checkSimilarKeywords(recommendation: SOPRecommendation): FilterResult {
    const keyword = recommendation.keyword.toLowerCase();
    const ruleType = recommendation.ruleApplied.split(':')[0];
    const actionType = this.getActionType(recommendation.action);

    const similarIgnored = this.ignoredRecommendations.filter(ignored => {
      if (ignored.criteria.ruleType !== ruleType || ignored.criteria.actionType !== actionType) {
        return false;
      }

      const ignoredKeyword = ignored.criteria.keyword.toLowerCase();
      const similarity = this.calculateKeywordSimilarity(keyword, ignoredKeyword);
      
      return similarity >= this.config.similarityThreshold;
    });

    if (similarIgnored.length > 0) {
      const avgSimilarity = similarIgnored.reduce((sum, ignored) => {
        return sum + this.calculateKeywordSimilarity(keyword, ignored.criteria.keyword.toLowerCase());
      }, 0) / similarIgnored.length;

      return {
        shouldFilter: true,
        reason: `Keywords similares já foram ignoradas: ${similarIgnored.map(i => i.criteria.keyword).slice(0, 3).join(', ')}`,
        confidence: avgSimilarity
      };
    }

    return { shouldFilter: false, reason: '', confidence: 0 };
  }

  // Verifica padrões de campanha
  private checkCampaignPatterns(recommendation: SOPRecommendation): FilterResult {
    const campaign = recommendation.campaign;
    const ruleType = recommendation.ruleApplied.split(':')[0];
    const actionType = this.getActionType(recommendation.action);

    const campaignIgnored = this.ignoredRecommendations.filter(ignored =>
      ignored.criteria.campaign === campaign &&
      ignored.criteria.ruleType === ruleType &&
      ignored.criteria.actionType === actionType
    );

    // Se mais de 3 recomendações similares nesta campanha foram ignoradas
    if (campaignIgnored.length >= 3) {
      return {
        shouldFilter: true,
        reason: `${campaignIgnored.length} recomendações similares foram ignoradas nesta campanha`,
        confidence: Math.min(campaignIgnored.length / 5, 0.9)
      };
    }

    return { shouldFilter: false, reason: '', confidence: 0 };
  }

  // Verifica padrões de performance
  private checkPerformancePatterns(recommendation: SOPRecommendation): FilterResult {
    const ruleType = recommendation.ruleApplied.split(':')[0];
    const actionType = this.getActionType(recommendation.action);

    const similarPerformance = this.ignoredRecommendations.filter(ignored => {
      if (ignored.criteria.ruleType !== ruleType || ignored.criteria.actionType !== actionType) {
        return false;
      }

      // Buscar recomendações com ACoS similar (±10%)
      const targetAcos = recommendation.acos;
      const ignoredRec = this.ignoredRecommendations.find(r => r.keyword === ignored.keyword);
      if (!ignoredRec) return false;

      // Aqui precisaríamos dos dados de performance da recomendação ignorada
      // Por simplicidade, vamos usar uma heurística
      return true;
    });

    if (similarPerformance.length >= 2) {
      return {
        shouldFilter: true,
        reason: `Performance similar a ${similarPerformance.length} recomendações ignoradas`,
        confidence: Math.min(similarPerformance.length / 5, 0.9)
      };
    }

    return { shouldFilter: false, reason: '', confidence: 0 };
  }

  // Calcula similaridade entre keywords
  private calculateKeywordSimilarity(keyword1: string, keyword2: string): number {
    const terms1 = new Set(keyword1.split(/\s+/));
    const terms2 = new Set(keyword2.split(/\s+/));
    
    const intersection = new Set([...terms1].filter(x => terms2.has(x)));
    const union = new Set([...terms1, ...terms2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Converte ação em tipo padronizado
  private getActionType(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('aumentar')) return 'increase';
    if (actionLower.includes('reduzir')) return 'decrease';
    if (actionLower.includes('desativar')) return 'disable';
    return 'other';
  }
}

// Função auxiliar para filtrar recomendações
export const filterRecommendationsWithHistory = (
  recommendations: SOPRecommendation[],
  ignoredList: IgnoredRecommendation[],
  config?: SmartFilterConfig
): SOPRecommendation[] => {
  const filter = new SmartRecommendationFilter(ignoredList, config);
  
  return recommendations.filter(rec => {
    const result = filter.shouldFilterRecommendation(rec);
    if (result.shouldFilter) {
      console.log(`Filtrando: ${rec.keyword} - ${result.reason} (confiança: ${(result.confidence * 100).toFixed(0)}%)`);
    }
    return !result.shouldFilter;
  });
};