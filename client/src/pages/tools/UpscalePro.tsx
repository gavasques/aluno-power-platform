import { UpscaleProTool } from '@/components/upscale-pro/UpscaleProTool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ArrowLeft, Zap, Star, TrendingUp, Shield, CreditCard } from 'lucide-react';
import { Link } from 'wouter';

export default function UpscalePro() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
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
                <ZoomIn className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Upscale PRO</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <CreditCard className="w-3 h-3 mr-1" />
                4 créditos por uso
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Ampliação Profissional com IA</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Amplie suas imagens mantendo a qualidade com nossa tecnologia de upscaling padrão profissional
            </p>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Processamento Eficiente</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Qualidade Profissional</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">Ampliação até 8x</span>
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
        <UpscaleProTool />
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Recursos do Upscale PRO</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nossa ferramenta de upscaling padrão oferece ampliação de alta qualidade ideal para a maioria dos casos de uso
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ZoomIn className="w-5 h-5 text-blue-600" />
                Ampliação Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Amplie suas imagens até 8x mantendo detalhes nítidos e qualidade profissional
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Processamento Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Processamento otimizado para resultados rápidos sem comprometer a qualidade
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Múltiplos Formatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Suporte para PNG, JPG e WEBP com opções de formato de saída flexíveis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Privacidade Garantida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Suas imagens são processadas com segurança e removidas automaticamente após o processamento
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Fácil de Usar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Interface intuitiva - apenas carregue sua imagem e escolha o fator de ampliação
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Custo Fixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Apenas 4 créditos por processamento, independente do fator de ampliação escolhido
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Como Usar</h3>
            <p className="text-gray-600">
              Siga esses passos simples para ampliar suas imagens com qualidade profissional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload da Imagem</h4>
              <p className="text-gray-600 text-sm">
                Faça upload da sua imagem (PNG, JPG ou WEBP até 10MB)
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Configure o Upscale</h4>
              <p className="text-gray-600 text-sm">
                Escolha o fator de ampliação (2x até 8x) e formato de saída
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Download do Resultado</h4>
              <p className="text-gray-600 text-sm">
                Baixe sua imagem ampliada com qualidade profissional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}