import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { SOPRecommendation, AnalysisSummary } from './types';

interface ChartsSectionProps {
  recommendations: SOPRecommendation[];
  summary: AnalysisSummary;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  recommendations,
  summary
}) => {
  // Dados para gráfico de distribuição de prioridades
  const priorityData = [
    { name: 'Alta', value: summary.highPriority, color: '#ef4444' },
    { name: 'Média', value: summary.mediumPriority, color: '#f59e0b' },
    { name: 'Baixa', value: summary.lowPriority, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Dados para gráfico de tipos de ação
  const actionData = [
    { name: 'Desativar', value: summary.deactivations, color: '#dc2626' },
    { name: 'Reduzir Lance', value: summary.bidReductions, color: '#ea580c' },
    { name: 'Aumentar Lance', value: summary.bidIncreases, color: '#059669' }
  ].filter(item => item.value > 0);

  // Distribuição de ACoS antes das otimizações
  const acosDistribution = React.useMemo(() => {
    const ranges = [
      { range: '0-10%', min: 0, max: 0.1, count: 0 },
      { range: '10-25%', min: 0.1, max: 0.25, count: 0 },
      { range: '25-50%', min: 0.25, max: 0.5, count: 0 },
      { range: '50-75%', min: 0.5, max: 0.75, count: 0 },
      { range: '75%+', min: 0.75, max: Infinity, count: 0 }
    ];

    recommendations.forEach(rec => {
      const acos = rec.acos;
      ranges.forEach(range => {
        if (acos >= range.min && acos < range.max) {
          range.count++;
        }
      });
    });

    return ranges.filter(range => range.count > 0);
  }, [recommendations]);

  // Impacto estimado por campanha (top 10)
  const campaignImpact = React.useMemo(() => {
    const campaignMap = new Map<string, number>();
    
    recommendations.forEach(rec => {
      const current = campaignMap.get(rec.campaign) || 0;
      campaignMap.set(rec.campaign, current + rec.estimatedImpact);
    });

    return Array.from(campaignMap.entries())
      .map(([campaign, impact]) => ({
        campaign: campaign.length > 20 ? campaign.substring(0, 20) + '...' : campaign,
        fullCampaign: campaign,
        impact: Math.abs(impact)
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10);
  }, [recommendations]);

  // Custom tooltip para os gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição de Prioridades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {priorityData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Ação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" />
              Tipos de Ação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição de ACoS */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de ACoS Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={acosDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Insight:</strong> Keywords com ACoS acima de 50% devem ser priorizadas para otimização imediata.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impacto por Campanha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Impacto Estimado por Campanha</span>
              <Badge variant="secondary">Top 10</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignImpact} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="campaign" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = campaignImpact.find(item => item.campaign === label);
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
                          <p className="font-medium text-sm">{data?.fullCampaign}</p>
                          <p className="text-green-600">
                            Economia: R$ {payload[0]?.value?.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="impact" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Performance Projetadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                -{((summary.deactivations / summary.totalKeywords) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-800">Redução Gastos Improdutivos</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                +{((summary.bidIncreases / summary.totalKeywords) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-800">Aumento Investimento Eficiente</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {((summary.totalRecommendations / summary.totalKeywords) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-800">Taxa de Otimização</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                R$ {summary.estimatedSavings.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-orange-800">Economia Mensal Est.</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <h4 className="font-medium mb-2">💡 Recomendações Estratégicas</h4>
            <ul className="text-sm space-y-1">
              <li>• Implemente alterações de alta prioridade primeiro para maior impacto</li>
              <li>• Monitore performance por 7-14 dias antes de fazer novos ajustes</li>
              <li>• Keywords desativadas podem ser reativadas com lances menores se necessário</li>
              <li>• Considere expandir campanhas com bom ROI identificadas na análise</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};