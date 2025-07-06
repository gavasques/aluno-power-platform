import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb,
  ArrowRight,
  Star,
  Zap,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Crown
} from 'lucide-react';

interface Recommendation {
  type: string;
  title: string;
  description: string;
  action: string;
  url: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface RecommendationCardProps {
  recommendations?: Recommendation[];
  onInteraction?: (recommendation: Recommendation, action: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendations = [],
  onInteraction
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'credits': return AlertTriangle;
      case 'upgrade': return Crown;
      case 'feature': return Star;
      case 'tutorial': return BookOpen;
      case 'optimization': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return {
        badge: 'bg-red-100 text-red-800',
        border: 'border-red-200',
        bg: 'bg-red-50'
      };
      case 'high': return {
        badge: 'bg-orange-100 text-orange-800',
        border: 'border-orange-200',
        bg: 'bg-orange-50'
      };
      case 'medium': return {
        badge: 'bg-blue-100 text-blue-800',
        border: 'border-blue-200',
        bg: 'bg-blue-50'
      };
      case 'low': return {
        badge: 'bg-gray-100 text-gray-800',
        border: 'border-gray-200',
        bg: 'bg-gray-50'
      };
      default: return {
        badge: 'bg-gray-100 text-gray-800',
        border: 'border-gray-200',
        bg: 'bg-gray-50'
      };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (onInteraction) {
      onInteraction(recommendation, 'click');
    }
    // Navigate to the recommendation URL
    window.location.href = recommendation.url;
  };

  const handleDismiss = (recommendation: Recommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInteraction) {
      onInteraction(recommendation, 'dismiss');
    }
  };

  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Recomendações Personalizadas</CardTitle>
        <Lightbulb className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRecommendations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma recomendação no momento</p>
              <p className="text-xs">Continue usando a plataforma para receber sugestões personalizadas!</p>
            </div>
          ) : (
            sortedRecommendations.map((recommendation, index) => {
              const Icon = getRecommendationIcon(recommendation.type);
              const colors = getPriorityColor(recommendation.priority);
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${colors.border} ${colors.bg} cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={() => handleRecommendationClick(recommendation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {recommendation.title}
                        </h4>
                        <Badge 
                          className={`${colors.badge} text-xs`}
                          variant="secondary"
                        >
                          {getPriorityLabel(recommendation.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {recommendation.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecommendationClick(recommendation);
                          }}
                        >
                          {recommendation.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-gray-500 hover:text-gray-700"
                          onClick={(e) => handleDismiss(recommendation, e)}
                        >
                          Dispensar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Smart Tips Section */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-3">
              💡 Dicas Inteligentes
            </h4>
            
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">
                  Maximize seus créditos
                </p>
                <p className="text-xs text-blue-600">
                  Use o modo "batch" para processar múltiplos produtos de uma vez e economizar créditos.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800 font-medium mb-1">
                  Melhore seus resultados
                </p>
                <p className="text-xs text-green-600">
                  Forneça mais contexto nos seus prompts para obter resultados mais precisos da IA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};