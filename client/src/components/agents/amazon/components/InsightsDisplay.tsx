import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, Search, DollarSign, Calendar, Lightbulb, AlertTriangle } from 'lucide-react';
import { ProductInsight, InsightType } from '@/types/amazon';

interface InsightsDisplayProps {
  insights: ProductInsight[];
}

export const InsightsDisplay = ({ insights }: InsightsDisplayProps) => {
  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case InsightType.KEYWORD_OPPORTUNITY:
        return Search;
      case InsightType.COMPETITOR_GAP:
        return Target;
      case InsightType.AUDIENCE_BEHAVIOR:
        return Users;
      case InsightType.CONTENT_OPTIMIZATION:
        return Lightbulb;
      case InsightType.PRICING_INSIGHT:
        return DollarSign;
      case InsightType.SEASONAL_TREND:
        return Calendar;
      default:
        return TrendingUp;
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization':
        return 'bg-blue-100 text-blue-800';
      case 'competition':
        return 'bg-purple-100 text-purple-800';
      case 'audience':
        return 'bg-orange-100 text-orange-800';
      case 'keywords':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactLabel = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'Alto Impacto';
      case 'medium':
        return 'Médio Impacto';
      case 'low':
        return 'Baixo Impacto';
      default:
        return 'Impacto Desconhecido';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = [];
    }
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<string, ProductInsight[]>);

  const categoryLabels = {
    optimization: 'Otimização de Conteúdo',
    competition: 'Análise Competitiva',
    audience: 'Comportamento da Audiência',
    keywords: 'Oportunidades de Keywords'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insights e Recomendações</h3>
        <Badge variant="secondary">
          {insights.length} {insights.length === 1 ? 'insight' : 'insights'}
        </Badge>
      </div>

      {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </h4>
            <Badge variant="outline" className={getCategoryColor(category)}>
              {categoryInsights.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {categoryInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-gray-900">{insight.title}</h5>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getImpactColor(insight.impact)}`}
                          >
                            {getImpactLabel(insight.impact)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {insights.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum insight foi gerado ainda.</p>
          <p className="text-sm mt-2">Os insights aparecerão após a análise dos dados.</p>
        </div>
      )}

      {/* Summary Stats */}
      {insights.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-600">
              {insights.filter(i => i.impact === 'high').length}
            </p>
            <p className="text-xs text-muted-foreground">Alto Impacto</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-xl font-bold text-yellow-600">
              {insights.filter(i => i.impact === 'medium').length}
            </p>
            <p className="text-xs text-muted-foreground">Médio Impacto</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">
              {insights.filter(i => i.impact === 'low').length}
            </p>
            <p className="text-xs text-muted-foreground">Baixo Impacto</p>
          </div>
        </div>
      )}

      {/* Action Items */}
      {insights.filter(i => i.impact === 'high').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">Ações Prioritárias:</h4>
              <div className="space-y-1">
                {insights
                  .filter(i => i.impact === 'high')
                  .slice(0, 3)
                  .map((insight, index) => (
                    <p key={index} className="text-sm text-red-700">
                      • {insight.title}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};