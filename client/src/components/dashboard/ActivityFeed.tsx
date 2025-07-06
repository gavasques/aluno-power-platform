import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Bot, 
  Image, 
  Search, 
  FileText, 
  Zap,
  ExternalLink,
  Filter
} from 'lucide-react';

interface ActivityItem {
  id: number | string;
  activity: string;
  feature?: string;
  description: string;
  duration?: number;
  date: string | Date;
}

interface RecentFeature {
  type: string;
  feature: string;
  model?: string;
  cost?: number;
  asin?: string;
  keyword?: string;
  date: string | Date;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  recentFeatures?: RecentFeature[];
  onViewDetails?: (id: string | number) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  recentFeatures = [],
  onViewDetails
}) => {
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays}d atrás`;
    } else {
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const getActivityIcon = (activity: string, feature?: string) => {
    if (activity === 'ai_generation' || feature?.includes('ai')) {
      return <Bot className="h-4 w-4 text-blue-500" />;
    }
    if (activity === 'image_processing' || feature?.includes('image')) {
      return <Image className="h-4 w-4 text-purple-500" />;
    }
    if (activity === 'tool_usage' || feature?.includes('search')) {
      return <Search className="h-4 w-4 text-green-500" />;
    }
    if (activity === 'login') {
      return <Zap className="h-4 w-4 text-yellow-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getFeatureType = (type: string) => {
    switch (type) {
      case 'ai_generation': return { label: 'IA', color: 'bg-blue-100 text-blue-800' };
      case 'tool_usage': return { label: 'Tool', color: 'bg-green-100 text-green-800' };
      case 'image_processing': return { label: 'Imagem', color: 'bg-purple-100 text-purple-800' };
      default: return { label: 'Outro', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getFeatureName = (feature: string) => {
    const featureNames: Record<string, string> = {
      'html-description': 'Descrição HTML',
      'bullet-points': 'Bullet Points',
      'amazon-listing': 'Listing Amazon',
      'image-upscale': 'Ampliação de Imagem',
      'background-removal': 'Remoção de Fundo',
      'keyword-research': 'Pesquisa de Keywords',
      'review-extractor': 'Extrator de Reviews',
    };
    return featureNames[feature] || feature;
  };

  // Combine and sort all activities
  const allActivities = [
    ...activities.map(a => ({ ...a, type: 'activity' as const })),
    ...recentFeatures.map(f => ({
      id: `${f.type}-${f.date}`,
      activity: f.type,
      feature: f.feature,
      description: `Usou ${getFeatureName(f.feature)}${f.asin ? ` para ASIN ${f.asin}` : ''}${f.keyword ? ` com keyword "${f.keyword}"` : ''}`,
      date: f.date,
      type: 'feature' as const,
      cost: f.cost,
      model: f.model,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allActivities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
              <p className="text-xs">Comece usando nossas ferramentas!</p>
            </div>
          ) : (
            allActivities.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(item.activity, item.feature)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {item.feature ? getFeatureName(item.feature) : item.activity}
                    </p>
                    {item.type === 'feature' && (
                      <Badge 
                        variant="secondary" 
                        className={`${getFeatureType(item.activity).color} text-xs`}
                      >
                        {getFeatureType(item.activity).label}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{formatDate(item.date)}</span>
                    {item.type === 'activity' && item.duration && (
                      <span>• {formatDuration(item.duration)}</span>
                    )}
                    {item.type === 'feature' && (item as any).cost && (
                      <span>• ${((item as any).cost).toFixed(4)}</span>
                    )}
                    {item.type === 'feature' && (item as any).model && (
                      <span>• {(item as any).model}</span>
                    )}
                  </div>
                </div>

                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(item.id)}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}

          {allActivities.length > 0 && (
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Ver Todas as Atividades
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};