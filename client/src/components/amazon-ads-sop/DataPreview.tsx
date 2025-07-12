import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { AmazonKeyword } from './types';

interface DataPreviewProps {
  data: AmazonKeyword[];
  onProceedToAnalysis: () => void;
  isAnalyzing: boolean;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  onProceedToAnalysis,
  isAnalyzing
}) => {
  // Filtrar apenas keywords com dados de performance
  const keywordsWithPerformance = data.filter(
    item => {
      const entityField = item.entidade || item.Entidade || '';
      const clicks = item.cliques || item.clicks || 0;
      const impressions = item.impressoes || item.impressions || 0;
      
      return (entityField.toLowerCase().includes('palavra-chave') || 
              entityField.toLowerCase().includes('keyword') || 
              !entityField) && 
             (clicks > 0 || impressions > 0);
    }
  );

  const totalKeywords = keywordsWithPerformance.length;
  const totalSpend = keywordsWithPerformance.reduce((sum, item) => 
    sum + (item.gastos || item.spend || 0), 0);
  const totalSales = keywordsWithPerformance.reduce((sum, item) => 
    sum + (item.vendas || item.sales || 0), 0);
  const totalClicks = keywordsWithPerformance.reduce((sum, item) => 
    sum + (item.cliques || item.clicks || 0), 0);
  const totalOrders = keywordsWithPerformance.reduce((sum, item) => 
    sum + (item.pedidos || item.orders || 0), 0);

  // Calcular ACoS médio ponderado pelo gasto
  const averageAcos = totalSpend > 0 ? (totalSpend / totalSales) : 0;

  // Estimar faixa de preço baseada no ticket médio
  const keywordsWithSales = keywordsWithPerformance.filter(item => 
    (item.vendas || item.sales || 0) > 0 && (item.pedidos || item.orders || 0) > 0);
  
  const estimatedPrice = keywordsWithSales.length > 0
    ? keywordsWithSales.reduce((sum, item) => {
        const sales = item.vendas || item.sales || 0;
        const orders = item.pedidos || item.orders || 0;
        return sum + (orders > 0 ? sales / orders : 0);
      }, 0) / keywordsWithSales.length
    : 0;

  const getPriceRange = (price: number) => {
    // Assumindo que os valores estão em R$ e convertendo para USD aproximadamente
    const priceUSD = price / 5.5; // Taxa de câmbio aproximada
    if (priceUSD <= 50) return '$50';
    if (priceUSD <= 100) return '$100';
    if (priceUSD <= 200) return '$200';
    return '$200+';
  };

  // Identificar oportunidades óbvias
  const highAcosKeywords = keywordsWithPerformance.filter(item => 
    (item.acos || 0) > 0.5 || (item.gastos || item.spend || 0) > (item.vendas || item.sales || 0) * 0.5);
  
  const noSalesKeywords = keywordsWithPerformance.filter(item => 
    (item.cliques || item.clicks || 0) >= 10 && (item.pedidos || item.orders || 0) === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Preview dos Dados Carregados</span>
          <Badge variant="secondary">{totalKeywords} keywords analisáveis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalKeywords}</div>
            <div className="text-sm text-blue-800">Keywords Ativas</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-red-800">Gasto Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-green-800">Vendas Total</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {(averageAcos * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-orange-800">ACoS Médio</div>
          </div>
        </div>

        {/* Informações de classificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {estimatedPrice > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Classificação Automática
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Ticket médio estimado:</span>
                  <span className="ml-2 font-medium">
                    R$ {estimatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Faixa de preço SOP:</span>
                  <Badge className="ml-2">{getPriceRange(estimatedPrice)}</Badge>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Oportunidades Identificadas
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>ACoS alto (≥50%):</span>
                <Badge variant="destructive" className="text-xs">
                  {highAcosKeywords.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Sem vendas (≥10 cliques):</span>
                <Badge variant="secondary" className="text-xs">
                  {noSalesKeywords.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Total com oportunidades:</span>
                <Badge className="text-xs">
                  {Math.min(highAcosKeywords.length + noSalesKeywords.length, totalKeywords)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Preview da tabela */}
        <div>
          <h4 className="font-medium mb-3">Preview das Keywords (primeiras 5)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Keyword</th>
                  <th className="text-left p-3 border-b">Campanha</th>
                  <th className="text-right p-3 border-b">Lance</th>
                  <th className="text-right p-3 border-b">Cliques</th>
                  <th className="text-right p-3 border-b">Pedidos</th>
                  <th className="text-right p-3 border-b">ACoS</th>
                  <th className="text-right p-3 border-b">Gastos</th>
                </tr>
              </thead>
              <tbody>
                {keywordsWithPerformance.slice(0, 5).map((item, index) => {
                  const keyword = item.textopalavraChave || item.keyword || 'N/A';
                  const campaign = item.nomeCampanha || item.campaign || 'N/A';
                  const bid = item.lance || item.bid || 0;
                  const clicks = item.cliques || item.clicks || 0;
                  const orders = item.pedidos || item.orders || 0;
                  const acos = item.acos || 0;
                  const spend = item.gastos || item.spend || 0;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{keyword}</td>
                      <td className="p-3 border-b text-gray-600">{campaign}</td>
                      <td className="p-3 border-b text-right">
                        R$ {bid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 border-b text-right">{clicks}</td>
                      <td className="p-3 border-b text-right">{orders}</td>
                      <td className="p-3 border-b text-right">
                        <span className={acos >= 0.5 ? 'text-red-600 font-medium' : ''}>
                          {(acos * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 border-b text-right">
                        R$ {spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalKeywords > 5 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ... e mais {totalKeywords - 5} keywords
            </p>
          )}
        </div>

        {/* Botão para prosseguir */}
        <div className="text-center pt-4">
          <Button 
            onClick={onProceedToAnalysis}
            disabled={isAnalyzing || totalKeywords === 0}
            size="lg"
            className="px-8"
          >
            {isAnalyzing ? 'Analisando...' : `Analisar ${totalKeywords} Keywords com SOP`}
          </Button>
          {totalKeywords === 0 && (
            <p className="text-sm text-red-600 mt-2">
              Nenhuma keyword com dados de performance encontrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};