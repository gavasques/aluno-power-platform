/**
 * AmazonAdsSOP Page - Professional Amazon Ads SOP analysis tool
 * 
 * Features:
 * - Excel file upload with automatic data detection
 * - Advanced SOP rule application with mathematical precision
 * - Priority-based recommendations (Alta/Média/Baixa)
 * - Comprehensive analysis reports and optimized Excel export
 * - Credit consumption based on keywords analyzed
 * - Responsive design with professional interface
 * - SEO optimized
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AmazonAdsSOPTool } from '@/components/amazon-ads-sop/AmazonAdsSOPTool';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, TrendingUp, Zap, FileSpreadsheet, BarChart3, Download } from 'lucide-react';
import { Link } from 'wouter';

const AmazonAdsSOP: React.FC = () => {
  // Get feature cost for dynamic pricing
  const { data: featureCosts } = useQuery({
    queryKey: ['/api/feature-costs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Estimativa de custo baseada no número de keywords
  const getCreditCost = (keywordCount: number): number => {
    if (keywordCount <= 100) return 1;
    if (keywordCount <= 500) return 3;
    if (keywordCount <= 1000) return 5;
    return 10;
  };

  return (
    <>
      <Helmet>
        <title>Análise SOP Amazon Ads - Aluno Power</title>
        <meta 
          name="description" 
          content="Ferramenta profissional para análise SOP de campanhas Amazon Ads. Upload de planilhas, aplicação automática de regras matemáticas e geração de recomendações otimizadas." 
        />
        <meta name="keywords" content="amazon ads, sop, análise, otimização, campanhas, keywords, ppc, acos, amazon" />
        <meta property="og:title" content="Análise SOP Amazon Ads - Aluno Power" />
        <meta property="og:description" content="Ferramenta profissional para análise SOP de campanhas Amazon Ads" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* Header com navegação */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/ferramentas">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Análise SOP Amazon Ads
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-6">
              Ferramenta profissional para otimização de campanhas Amazon Ads com regras SOP matemáticas
            </p>

            {/* Cost Information */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Custo dinâmico por keywords analisadas
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                1-10 créditos por análise
              </Badge>
            </div>

            {/* Pricing breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-600">Até 100</div>
                <div className="text-xs text-gray-600">1 crédito</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-600">101-500</div>
                <div className="text-xs text-gray-600">3 créditos</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                <div className="text-sm font-medium text-orange-600">501-1000</div>
                <div className="text-xs text-gray-600">5 créditos</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-600">1000+</div>
                <div className="text-xs text-gray-600">10 créditos</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Upload automático Excel
              </div>
              <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                <Target className="w-4 h-4 text-green-600" />
                Regras SOP matemáticas
              </div>
              <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Análise de prioridades
              </div>
              <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                <Download className="w-4 h-4 text-orange-600" />
                Export otimizado
              </div>
            </div>
          </div>

          {/* Componente da ferramenta */}
          <AmazonAdsSOPTool />

          {/* Informações sobre o SOP */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Regras SOP Aplicadas
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Faixa de Preço:</strong> Tolerâncias automáticas baseadas no ticket médio</li>
                <li>• <strong>Cliques sem Conversão:</strong> Desativação ou redução baseada em limites</li>
                <li>• <strong>ACoS Alto:</strong> Reduções de 20% a 40% conforme gravidade</li>
                <li>• <strong>Performance Excelente:</strong> Aumento de investimento em top performers</li>
                <li>• <strong>Baixa Visibilidade:</strong> Otimização de lances para melhor posicionamento</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Resultados Esperados
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Economia Imediata:</strong> Redução de gastos improdutivos</li>
                <li>• <strong>Melhor ROI:</strong> Otimização do retorno sobre investimento</li>
                <li>• <strong>ACoS Otimizado:</strong> Redução do custo de aquisição</li>
                <li>• <strong>Escalabilidade:</strong> Identificação de oportunidades de crescimento</li>
                <li>• <strong>Automação:</strong> Processo systematizado e repetível</li>
              </ul>
            </div>
          </div>

          {/* Instruções de uso */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">📋 Como Usar</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <p className="font-medium">Upload</p>
                <p className="text-xs text-gray-600">Faça upload da planilha Amazon Ads (.xlsx)</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <p className="font-medium">Configurar</p>
                <p className="text-xs text-gray-600">Ajuste configurações ou use detecção automática</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <p className="font-medium">Analisar</p>
                <p className="text-xs text-gray-600">Aplique regras SOP matemáticas automaticamente</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                <p className="font-medium">Implementar</p>
                <p className="text-xs text-gray-600">Baixe planilha otimizada e relatório completo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AmazonAdsSOP;