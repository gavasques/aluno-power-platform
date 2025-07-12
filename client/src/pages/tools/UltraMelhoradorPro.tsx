import { UltraEnhanceTool } from '@/components/ultra-enhance/UltraEnhanceTool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Zap, Star, TrendingUp, Shield, CreditCard } from 'lucide-react';
import { Link } from 'wouter';

export default function UltraMelhoradorPro() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
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
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Ultra Melhorador PRO</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <CreditCard className="w-3 h-3 mr-1" />
                4 créditos por uso
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Tecnologia de IA Avançada</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Melhore e amplie suas imagens com qualidade profissional usando inteligência artificial de última geração
            </p>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Processamento Rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Qualidade Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">Ampliação até 16x</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool */}
      <div className="py-8">
        <UltraEnhanceTool />
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Recursos Avançados</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra todos os recursos que tornam o Ultra Melhorador PRO a escolha ideal para profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Ampliação Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Amplie suas imagens de 2x até 16x mantendo a qualidade original com algoritmos de IA avançados
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Qualidade Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Melhore detalhes, nitidez e resolução com tecnologia de super-resolução baseada em IA
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Múltiplos Formatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suporte para JPG, PNG e WEBP com otimização automática para cada formato
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Processamento Seguro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suas imagens são processadas com segurança e não são armazenadas em nossos servidores
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                IA de Última Geração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tecnologia Picsart Ultra Enhance com modelos de IA treinados para melhoramento de imagens
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Preço Justo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Apenas 4 créditos por uso, oferecendo excelente custo-benefício para resultados profissionais
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Casos de Uso</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ideal para diversos tipos de projeto e necessidades profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">E-commerce</h4>
              <p className="text-sm text-gray-600">Melhore fotos de produtos para listings no Amazon e outras plataformas</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Marketing</h4>
              <p className="text-sm text-gray-600">Crie materiais visuais de alta qualidade para campanhas publicitárias</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Impressão</h4>
              <p className="text-sm text-gray-600">Prepare imagens para impressão em alta resolução e qualidade</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Design</h4>
              <p className="text-sm text-gray-600">Melhore recursos visuais para projetos de design e apresentações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}