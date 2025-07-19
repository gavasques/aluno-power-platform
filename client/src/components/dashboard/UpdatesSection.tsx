import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';

interface UpdatesSectionProps {
  updatesData: any[];
  updatesLoading: boolean;
  onUpdateClick: (update: any) => void;
  formatCreatedDate: (dateString: string) => string;
  variant?: 'full' | 'simple';
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({ 
  updatesData, 
  updatesLoading, 
  onUpdateClick, 
  formatCreatedDate,
  variant = 'full'
}) => {
  if (variant === 'simple') {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Novidades
          </CardTitle>
          <CardDescription className="text-gray-600">
            Recursos e melhorias recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {updatesData.length > 0 ? (
              updatesData.slice(0, 3).map((update: any) => (
                <div
                  key={update.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onUpdateClick(update)}
                >
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{update.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{update.summary || 'Sem descrição disponível'}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={update.type === 'feature' ? 'default' : update.type === 'improvement' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {update.type === 'feature' ? 'Novo' : update.type === 'improvement' ? 'Melhoria' : 'Correção'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {update.createdAt ? formatCreatedDate(update.createdAt) : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma novidade disponível</p>
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
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Novidades
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Recursos e melhorias recentes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {updatesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : updatesData && updatesData.length > 0 ? (
          <div className="space-y-3">
            {updatesData.slice(0, 3).map((update) => (
              <div 
                key={update.id} 
                className="bg-green-50 rounded-lg p-4 border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                onClick={() => onUpdateClick(update)}
              >
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                  {update.title}
                </h3>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {update.summary || update.content?.substring(0, 100) + '...'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 text-xs">
                      {update.version || 'v1.0'}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 text-xs">
                      {update.type || 'Feature'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatCreatedDate(String(update.createdAt || ''))}
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = '/novidades'}
            >
              Ver Todas as Novidades
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhuma novidade</h3>
            <p className="text-gray-500 text-xs">As últimas atualizações aparecerão aqui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(UpdatesSection);