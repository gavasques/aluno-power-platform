/**
 * LogoGeneratorPro Page - Professional logo generation tool
 * 
 * Features:
 * - Clean, professional interface
 * - Credit cost display
 * - Complete logo generation workflow
 * - Generic branding (no service provider references)
 * - Responsive design
 * - SEO optimized
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LogoGeneratorTool } from '@/components/logo-generator/LogoGeneratorTool';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Palette, Zap, Download } from 'lucide-react';

const LogoGeneratorPro: React.FC = () => {
  // Get feature cost for dynamic pricing
  const { data: featureCosts } = useQuery({
    queryKey: ['/api/feature-costs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoGenerationCost = featureCosts?.data?.byCategory?.['Ferramentas']?.find(
    (item: any) => item.featureName === 'tools.logo_generation'
  )?.costPerUse || 3;

  return (
    <>
      <Helmet>
        <title>Gerador de Logomarcas PRO - Aluno Power</title>
        <meta 
          name="description" 
          content="Crie logomarcas profissionais com inteligência artificial. Gerador PRO com múltiplas opções de personalização e download em alta qualidade." 
        />
        <meta name="keywords" content="gerador de logo, logomarca, design, inteligência artificial, marca, branding" />
        <meta property="og:title" content="Gerador de Logomarcas PRO - Aluno Power" />
        <meta property="og:description" content="Crie logomarcas profissionais com inteligência artificial" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Palette className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerador de Logomarcas PRO
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            Crie logomarcas profissionais com inteligência artificial
          </p>

          {/* Cost Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              {logoGenerationCost} créditos por uso
            </Badge>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              <Zap className="w-4 h-4 text-purple-600" />
              Geração rápida com IA
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              <Palette className="w-4 h-4 text-purple-600" />
              Múltiplas opções de cores
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              <Download className="w-4 h-4 text-purple-600" />
              Download em alta qualidade
            </div>
          </div>
        </div>

        {/* Main Tool */}
        <LogoGeneratorTool />
      </div>
    </>
  );
};

export default LogoGeneratorPro;