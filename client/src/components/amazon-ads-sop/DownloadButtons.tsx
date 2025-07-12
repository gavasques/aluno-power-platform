import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, FileText, Loader2, CheckCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { SOPRecommendation, AnalysisSummary, AmazonKeyword } from './types';

interface DownloadButtonsProps {
  recommendations: SOPRecommendation[];
  summary: AnalysisSummary;
  originalData: AmazonKeyword[];
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  recommendations,
  summary,
  originalData
}) => {
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState<'excel' | 'report' | null>(null);

  // Gerar planilha Excel otimizada
  const generateOptimizedExcel = async () => {
    setIsGeneratingExcel(true);
    
    try {
      // Preparar dados otimizados baseados nas recomendações
      const optimizedData = originalData.map((row, index) => {
        const recommendation = recommendations.find(rec => rec.rowIndex === index);
        
        if (recommendation) {
          const newRow = { ...row };
          
          // Atualizar lance baseado na recomendação
          if (recommendation.action.includes('Desativar')) {
            newRow.estado = 'pausado';
            newRow.State = 'paused';
          } else {
            // Atualizar lance (suporta ambos os formatos)
            if (newRow.lance !== undefined) newRow.lance = recommendation.newBid;
            if (newRow.bid !== undefined) newRow.bid = recommendation.newBid;
            if (newRow.Lance !== undefined) newRow.Lance = recommendation.newBid;
            if (newRow.Bid !== undefined) newRow.Bid = recommendation.newBid;
          }
          
          return newRow;
        }
        
        return row;
      });

      // Criar workbook
      const workbook = XLSX.utils.book_new();
      
      // Aba principal com dados otimizados
      const mainSheet = XLSX.utils.json_to_sheet(optimizedData);
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Dados Otimizados');
      
      // Aba com recomendações detalhadas
      const recommendationsSheet = XLSX.utils.json_to_sheet(
        recommendations.map(rec => ({
          'Keyword': rec.keyword,
          'Campanha': rec.campaign,
          'Lance Atual': rec.currentBid,
          'Novo Lance': rec.newBid,
          'Ação': rec.action,
          'Prioridade': rec.priority,
          'Cliques': rec.clicks,
          'Pedidos': rec.orders,
          'ACoS': (rec.acos * 100).toFixed(2) + '%',
          'Gastos': rec.spend,
          'Vendas': rec.sales,
          'Impacto Estimado': rec.estimatedImpact,
          'Justificativa': rec.justification,
          'Regra Aplicada': rec.ruleApplied
        }))
      );
      XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recomendações SOP');
      
      // Aba com resumo
      const summarySheet = XLSX.utils.json_to_sheet([
        { 'Métrica': 'Total de Keywords', 'Valor': summary.totalKeywords },
        { 'Métrica': 'Recomendações Geradas', 'Valor': summary.totalRecommendations },
        { 'Métrica': 'Alta Prioridade', 'Valor': summary.highPriority },
        { 'Métrica': 'Média Prioridade', 'Valor': summary.mediumPriority },
        { 'Métrica': 'Baixa Prioridade', 'Valor': summary.lowPriority },
        { 'Métrica': 'Desativações', 'Valor': summary.deactivations },
        { 'Métrica': 'Reduções de Lance', 'Valor': summary.bidReductions },
        { 'Métrica': 'Aumentos de Lance', 'Valor': summary.bidIncreases },
        { 'Métrica': 'Economia Estimada (R$)', 'Valor': summary.estimatedSavings },
        { 'Métrica': 'Faixa de Preço', 'Valor': summary.priceRange },
        { 'Métrica': 'Preço Médio Estimado (R$)', 'Valor': summary.estimatedProductPrice }
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo Análise');

      // Gerar arquivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `Amazon_Ads_SOP_Otimizado_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      setDownloadComplete('excel');
      setTimeout(() => setDownloadComplete(null), 3000);
      
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar arquivo Excel. Tente novamente.');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Gerar relatório detalhado em texto
  const generateDetailedReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const reportContent = `
RELATÓRIO DE ANÁLISE SOP - AMAZON ADS
Gerado em: ${new Date().toLocaleString('pt-BR')}

==========================================
RESUMO EXECUTIVO
==========================================

Total de Keywords Analisadas: ${summary.totalKeywords}
Recomendações Geradas: ${summary.totalRecommendations}
Taxa de Otimização: ${((summary.totalRecommendations / summary.totalKeywords) * 100).toFixed(1)}%

DISTRIBUIÇÃO POR PRIORIDADE:
• Alta Prioridade: ${summary.highPriority} keywords (${((summary.highPriority / summary.totalRecommendations) * 100).toFixed(1)}%)
• Média Prioridade: ${summary.mediumPriority} keywords (${((summary.mediumPriority / summary.totalRecommendations) * 100).toFixed(1)}%)
• Baixa Prioridade: ${summary.lowPriority} keywords (${((summary.lowPriority / summary.totalRecommendations) * 100).toFixed(1)}%)

TIPOS DE AÇÃO:
• Desativações: ${summary.deactivations} keywords
• Reduções de Lance: ${summary.bidReductions} keywords
• Aumentos de Lance: ${summary.bidIncreases} keywords

IMPACTO FINANCEIRO:
• Economia Estimada Mensal: R$ ${summary.estimatedSavings.toLocaleString('pt-BR')}
• Faixa de Preço do Produto: ${summary.priceRange}
• Ticket Médio Estimado: R$ ${summary.estimatedProductPrice.toLocaleString('pt-BR')}

==========================================
RECOMENDAÇÕES DETALHADAS
==========================================

${recommendations.map((rec, index) => `
${index + 1}. KEYWORD: "${rec.keyword}"
   Campanha: ${rec.campaign}
   Prioridade: ${rec.priority}
   
   SITUAÇÃO ATUAL:
   • Lance: R$ ${rec.currentBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
   • Cliques: ${rec.clicks}
   • Pedidos: ${rec.orders}
   • ACoS: ${(rec.acos * 100).toFixed(1)}%
   • Gastos: R$ ${rec.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
   • Vendas: R$ ${rec.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
   
   RECOMENDAÇÃO:
   • Ação: ${rec.action}
   • Novo Lance: ${rec.action.includes('Desativar') ? 'N/A (Desativar)' : `R$ ${rec.newBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
   • Impacto Estimado: R$ ${Math.abs(rec.estimatedImpact).toLocaleString('pt-BR')} ${rec.estimatedImpact > 0 ? '(economia)' : '(investimento)'}
   
   JUSTIFICATIVA:
   ${rec.justification}
   
   REGRA APLICADA: ${rec.ruleApplied}
   
   ---
`).join('')}

==========================================
INSIGHTS E ANÁLISES
==========================================

OPORTUNIDADES IDENTIFICADAS:
• Keywords com alto ACoS (≥50%): ${recommendations.filter(r => r.acos >= 0.5).length}
• Keywords sem conversão com muitos cliques: ${recommendations.filter(r => r.orders === 0 && r.clicks >= 10).length}
• Keywords com potencial de aumento de investimento: ${summary.bidIncreases}

PRÓXIMOS PASSOS RECOMENDADOS:
1. Implementar alterações de ALTA PRIORIDADE primeiro
2. Monitorar performance por 7-14 dias após implementação
3. Aplicar alterações de MÉDIA PRIORIDADE gradualmente
4. Reavaliar keywords desativadas após 30 dias
5. Otimizar campanhas com melhor ROI identificadas

CONSIDERAÇÕES IMPORTANTES:
• Este relatório é baseado em dados históricos e projeções
• Monitore mudanças de mercado que possam afetar a performance
• Considere fatores sazonais na implementação das mudanças
• Mantenha backup dos lances originais para possíveis rollbacks

==========================================
METODOLOGIA SOP APLICADA
==========================================

CLASSIFICAÇÃO POR FAIXA DE PREÇO: ${summary.priceRange}
TOLERÂNCIAS APLICADAS:
• Produtos até $50: 10-15-20 cliques (low-medium-high)
• Produtos $50-$100: 20-30-40 cliques
• Produtos $100-$200: 30-45-60 cliques  
• Produtos $200+: 40-60-80 cliques

REGRAS DE OTIMIZAÇÃO:
• Keywords sem conversão com cliques ≥ tolerância alta: DESATIVAR
• Keywords sem conversão com cliques ≥ tolerância média: REDUZIR 20%
• Keywords sem conversão com cliques ≥ tolerância baixa: REDUZIR 10%
• Keywords com ACoS ≥ 50%: REDUZIR 40%
• Keywords com ACoS ≥ 30%: REDUZIR 20%
• Keywords com ACoS ≤ 5%: AUMENTAR 10%

==========================================
DISCLAIMER
==========================================

Este relatório foi gerado automaticamente pela ferramenta de análise SOP.
As recomendações devem ser avaliadas considerando:
- Contexto específico do negócio
- Metas de crescimento vs. lucratividade
- Capacidade de estoque
- Sazonalidade do produto
- Concorrência no mercado

Para melhores resultados, implemente as mudanças gradualmente e monitore
constantemente a performance das campanhas.

Relatório gerado por: Aluno Power Platform - Ferramenta Amazon Ads SOP
`;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const fileName = `Relatorio_Amazon_Ads_SOP_${new Date().toISOString().split('T')[0]}.txt`;
      saveAs(blob, fileName);
      
      setDownloadComplete('report');
      setTimeout(() => setDownloadComplete(null), 3000);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Downloads dos Resultados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Download da planilha otimizada */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Planilha Otimizada</h4>
                <p className="text-sm text-gray-600">Dados prontos para upload na Amazon</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Lances atualizados:</span>
                <Badge variant="secondary">{recommendations.filter(r => !r.action.includes('Desativar')).length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Keywords pausadas:</span>
                <Badge variant="destructive">{summary.deactivations}</Badge>
              </div>
            </div>
            
            <Button 
              onClick={generateOptimizedExcel}
              disabled={isGeneratingExcel}
              className="w-full"
              variant="default"
            >
              {isGeneratingExcel ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Excel...
                </>
              ) : downloadComplete === 'excel' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Download Concluído
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Baixar Excel (.xlsx)
                </>
              )}
            </Button>
          </div>

          {/* Download do relatório detalhado */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Relatório Completo</h4>
                <p className="text-sm text-gray-600">Análise detalhada e insights</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Recomendações:</span>
                <Badge variant="secondary">{summary.totalRecommendations}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Economia estimada:</span>
                <Badge variant="outline">R$ {summary.estimatedSavings.toLocaleString('pt-BR')}</Badge>
              </div>
            </div>
            
            <Button 
              onClick={generateDetailedReport}
              disabled={isGeneratingReport}
              className="w-full"
              variant="outline"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Relatório...
                </>
              ) : downloadComplete === 'report' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Download Concluído
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Baixar Relatório (.txt)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instruções de uso */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">📋 Instruções de Implementação</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Planilha Excel:</strong> Faça upload direto na Amazon Ads ou use como referência para alterações manuais</li>
            <li>• <strong>Relatório:</strong> Compartilhe com sua equipe para alinhamento da estratégia</li>
            <li>• <strong>Prioridades:</strong> Implemente mudanças de alta prioridade primeiro</li>
            <li>• <strong>Monitoramento:</strong> Acompanhe resultados por 7-14 dias antes de novos ajustes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};