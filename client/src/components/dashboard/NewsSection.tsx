import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Rss } from 'lucide-react';

interface NewsSectionProps {
  newsData: any[];
  newsLoading: boolean;
  onNewsClick: (news: any) => void;
  formatCreatedDate: (dateString: string) => string;
  variant?: 'full' | 'simple';
}

const NewsSection: React.FC<NewsSectionProps> = ({ 
  newsData, 
  newsLoading, 
  onNewsClick, 
  formatCreatedDate,
  variant = 'full'
}) => {
  if (variant === 'simple') {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
            <Rss className="h-5 w-5 text-green-600" />
            Notícias
          </CardTitle>
          <CardDescription className="text-gray-600">
            Últimas atualizações da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {newsData.length > 0 ? (
              newsData.slice(0, 3).map((news: any) => (
                <div
                  key={news.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onNewsClick(news)}
                >
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{news.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{news.summary}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={news.category === 'Funcionalidades' ? 'default' : 'secondary'} className="text-xs">
                      {news.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {news.createdAt ? formatCreatedDate(news.createdAt) : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Rss className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notícia disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Rss className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Notícias
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Últimas atualizações da plataforma
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {newsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : newsData && newsData.length > 0 ? (
          <div className="space-y-3">
            {newsData.slice(0, 3).map((news) => (
              <div 
                key={news.id} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onNewsClick(news)}
              >
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {news.summary || news.content?.substring(0, 100) + '...'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                      {news.category || 'Geral'}
                    </Badge>
                    {(news as any).featured && (
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatCreatedDate(String(news.createdAt || ''))}
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = '/noticias'}
            >
              Ver Todas as Notícias
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Rss className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhuma notícia</h3>
            <p className="text-gray-500 text-xs">As últimas notícias aparecerão aqui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(NewsSection);