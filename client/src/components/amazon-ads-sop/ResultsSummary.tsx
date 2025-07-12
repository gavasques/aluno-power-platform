import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Zap,
  Shield
} from 'lucide-react';
import { AnalysisSummary } from './types';

interface ResultsSummaryProps {
  summary: AnalysisSummary;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ summary }) => {
  const optimizationRate = summary.totalKeywords > 0 
    ? (summary.totalRecommendations / summary.totalKeywords) * 100 
    : 0;

  const priorityData = [
    {
      label: 'Alta Prioridade',
      count: summary.highPriority,
      color: 'red',
      icon: AlertTriangle,
      description: 'Ação imediata necessária'
    },
    {
      label: 'Média Prioridade',
      count: summary.mediumPriority,
      color: 'yellow',
      icon: Target,
      description: 'Otimização recomendada'
    },
    {
      label: 'Baixa Prioridade',
      count: summary.lowPriority,
      color: 'green',
      icon: CheckCircle,
      description: 'Ajuste preventivo'
    }
  ];

  const actionData = [
    {
      label: 'Desativações',
      count: summary.deactivations,
      color: 'red',
      icon: Shield,
      description: 'Keywords com muitos cliques sem conversão'
    },
    {
      label: 'Reduções de Lance',
      count: summary.bidReductions,
      color: 'orange',
      icon: TrendingDown,
      description: 'Diminuir investimento em low performers'
    },
    {
      label: 'Aumentos de Lance',
      count: summary.bidIncreases,
      color: 'green',
      icon: TrendingUp,
      description: 'Aumentar investimento em top performers'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Resumo da Análise SOP
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {summary.totalRecommendations} recomendações
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{summary.totalKeywords}</div>
              <div className="text-sm text-blue-800">Keywords Analisadas</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{summary.totalRecommendations}</div>
              <div className="text-sm text-green-800">Recomendações</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{optimizationRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-800">Taxa de Otimização</div>
            </div>
            
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <DollarSign className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">
                R$ {summary.estimatedSavings.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-emerald-800">Economia Estimada</div>
            </div>
          </div>

          {/* Barra de progresso da otimização */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Potencial de Otimização</span>
              <span>{optimizationRate.toFixed(1)}%</span>
            </div>
            <Progress value={optimizationRate} className="h-2" />
            <p className="text-xs text-gray-500">
              {optimizationRate >= 70 ? 'Alto potencial de melhoria detectado' :
               optimizationRate >= 30 ? 'Oportunidades moderadas de otimização' :
               'Campanhas com boa performance geral'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityData.map((priority, index) => {
              const Icon = priority.icon;
              const percentage = summary.totalRecommendations > 0 
                ? (priority.count / summary.totalRecommendations) * 100 
                : 0;
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${getColorClasses(priority.color)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{priority.label}</span>
                    </div>
                    <Badge variant="secondary">{priority.count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-1 mb-1" />
                  <p className="text-xs opacity-80">{priority.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Tipos de Ação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipos de Ação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionData.map((action, index) => {
              const Icon = action.icon;
              const percentage = summary.totalRecommendations > 0 
                ? (action.count / summary.totalRecommendations) * 100 
                : 0;
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${getColorClasses(action.color)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <Badge variant="secondary">{action.count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-1 mb-1" />
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📊 Performance Geral</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Faixa de preço: {summary.priceRange}</li>
                <li>• Ticket médio: R$ {summary.estimatedProductPrice.toLocaleString('pt-BR')}</li>
                <li>• {summary.totalRecommendations} de {summary.totalKeywords} keywords precisam de ajuste</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">💡 Próximos Passos</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Aplicar alterações de alta prioridade primeiro</li>
                <li>• Monitorar performance por 7-14 dias</li>
                <li>• Reavaliar keywords desativadas mensalmente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};