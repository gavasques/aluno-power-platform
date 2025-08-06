import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResultData {
  input: {
    productName: string;
    brand: string;
    category: string;
    keywords?: string;
    longTailKeywords?: string;
    features?: string;
    targetAudience?: string;
    reviewsData: string;
  };
  output: {
    success: boolean;
    provider: string;
    model: string;
    tokensUsed: {
      input: number;
      output: number;
      total: number;
    };
    cost: number;
    sessionId: string;
    timestamp: string;
    keywords?: string;
    elementos_promocionais?: string;
    titulo?: string;
    bullet_points?: string;
    descricao?: string;
  };
  timestamp: number;
}

export default function AmazonListingsOptimizerResult() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [showInputData, setShowInputData] = useState(false);

  useEffect(() => {
    // Extrair dados da URL
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
      try {
        const parsed = JSON.parse(dataParam);
        setResultData(parsed);
      } catch (error) {
        console.error('Erro ao parsear dados da URL:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os resultados.",
          variant: "destructive"
        });
        navigate('/agents/amazon-listings-optimizer');
      }
    } else {
      navigate('/agents/amazon-listings-optimizer');
    }
  }, [navigate, toast]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive"
      });
    }
  };

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download concluído!",
      description: `Arquivo ${filename} baixado com sucesso.`
    });
  };

  const formatPromocionaisText = (promocionaisJson: string) => {
    if (!promocionaisJson) return 'Elementos promocionais não disponíveis';
    
    try {
      // Remove markdown code blocks se existirem
      const cleanJson = promocionaisJson.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      let formatted = '';
      
      if (parsed.headlines_impacto) {
        formatted += '🎯 HEADLINES DE IMPACTO:\n';
        parsed.headlines_impacto.forEach((headline: string, index: number) => {
          formatted += `${index + 1}. ${headline}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.callouts_numericos) {
        formatted += '📊 CALLOUTS NUMÉRICOS:\n';
        parsed.callouts_numericos.forEach((callout: string, index: number) => {
          formatted += `${index + 1}. ${callout}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.badges_qualidade) {
        formatted += '🏆 BADGES DE QUALIDADE:\n';
        parsed.badges_qualidade.forEach((badge: string, index: number) => {
          formatted += `${index + 1}. ${badge}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.urgencia_escassez) {
        formatted += '⚡ ELEMENTOS DE URGÊNCIA/ESCASSEZ:\n';
        parsed.urgencia_escassez.forEach((elemento: string, index: number) => {
          formatted += `${index + 1}. ${elemento}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.beneficios_unicos) {
        formatted += '✨ BENEFÍCIOS ÚNICOS:\n';
        parsed.beneficios_unicos.forEach((beneficio: string, index: number) => {
          formatted += `${index + 1}. ${beneficio}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.social_proof) {
        formatted += '👥 PROVA SOCIAL:\n';
        parsed.social_proof.forEach((prova: string, index: number) => {
          formatted += `${index + 1}. ${prova}\n`;
        });
        formatted += '\n';
      }
      
      if (parsed.garantias) {
        formatted += '🛡️ GARANTIAS:\n';
        parsed.garantias.forEach((garantia: string, index: number) => {
          formatted += `${index + 1}. ${garantia}\n`;
        });
        formatted += '\n';
      }
      
      return formatted.trim() || promocionaisJson;
    } catch (error) {
      // Se não conseguir parsear como JSON, retorna o texto original formatado
      return promocionaisJson;
    }
  };

  const formatCompleteResult = () => {
    if (!resultData) return '';
    
    const { input, output } = resultData;
    const date = new Date(resultData.timestamp).toLocaleString('pt-BR');
    
    return `AMAZON LISTING OPTIMIZER - RESULTADO COMPLETO
=================================================

Data: ${date}
Produto: ${input.productName}
Marca: ${input.brand}
Categoria: ${input.category}

=================================================
TÍTULO OTIMIZADO
=================================================
${output.titulo || 'Não disponível'}

=================================================
BULLET POINTS OTIMIZADOS
=================================================
${output.bullet_points || 'Não disponível'}

=================================================
DESCRIÇÃO OTIMIZADA
=================================================
${output.descricao || 'Não disponível'}

=================================================
PALAVRAS-CHAVE SUGERIDAS
=================================================
${output.keywords || 'Não disponível'}

=================================================
ELEMENTOS PROMOCIONAIS
=================================================
${formatPromocionaisText(output.elementos_promocionais || '')}

=================================================
INFORMAÇÕES TÉCNICAS
=================================================
Processado pelo Sistema de IA

---
Gerado em ${date} pelo Sistema de IA Amazon Listing Optimizer
`;
  };

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  const { input, output } = resultData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/agents/amazon-listings-optimizer">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nova Otimização
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Resultado da Otimização
                </h1>
                <p className="text-gray-600">
                  {input.productName} - {input.brand}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInputData(!showInputData)}
            >
              {showInputData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showInputData ? 'Ocultar' : 'Ver'} Dados de Entrada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(formatCompleteResult(), 'Resultado completo')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Tudo
            </Button>
            <Button
              size="sm"
              onClick={() => downloadAsText(formatCompleteResult(), `amazon-listing-${input.productName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.txt`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar TXT
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Otimização concluída com sucesso!</strong> Sua listagem foi processada e otimizada usando IA avançada.
          </AlertDescription>
        </Alert>

        {/* Input Data (Collapsible) */}
        {showInputData && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Dados de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-blue-800">Produto:</p>
                  <p className="text-blue-700">{input.productName}</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Marca:</p>
                  <p className="text-blue-700">{input.brand}</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Categoria:</p>
                  <p className="text-blue-700">{input.category}</p>
                </div>
              </div>
              {input.keywords && (
                <div>
                  <p className="font-semibold text-blue-800">Palavras-chave:</p>
                  <p className="text-blue-700">{input.keywords}</p>
                </div>
              )}
              {input.features && (
                <div>
                  <p className="font-semibold text-blue-800">Características:</p>
                  <p className="text-blue-700 whitespace-pre-line">{input.features}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Tabs */}
        <Tabs defaultValue="titulo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="titulo">Título</TabsTrigger>
            <TabsTrigger value="bullet_points">Bullet Points</TabsTrigger>
            <TabsTrigger value="descricao">Descrição</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="promocionais">Promocionais</TabsTrigger>
          </TabsList>

          {/* Título */}
          <TabsContent value="titulo">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span>Título Otimizado</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Título principal da listagem, otimizado para conversão e SEO
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(output.titulo || '', 'Título')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(output.titulo || '', `titulo-${Date.now()}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {output.titulo || 'Título não disponível'}
                  </h2>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bullet Points */}
          <TabsContent value="bullet_points">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span>Bullet Points Otimizados</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Pontos-chave destacando benefícios e características principais
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(output.bullet_points || '', 'Bullet Points')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(output.bullet_points || '', `bullet-points-${Date.now()}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                    {output.bullet_points || 'Bullet points não disponíveis'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Descrição */}
          <TabsContent value="descricao">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span>Descrição Otimizada</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Descrição detalhada e persuasiva do produto
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(output.descricao || '', 'Descrição')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(output.descricao || '', `descricao-${Date.now()}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                    {output.descricao || 'Descrição não disponível'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords */}
          <TabsContent value="keywords">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span>Palavras-chave Sugeridas</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Palavras-chave otimizadas para melhor visibilidade
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(output.keywords || '', 'Keywords')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(output.keywords || '', `keywords-${Date.now()}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                    {output.keywords || 'Keywords não disponíveis'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Elementos Promocionais */}
          <TabsContent value="promocionais">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span>Elementos Promocionais</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Sugestões de elementos promocionais e de marketing
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatPromocionaisText(output.elementos_promocionais || ''), 'Elementos Promocionais')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(formatPromocionaisText(output.elementos_promocionais || ''), `promocionais-${Date.now()}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                    {formatPromocionaisText(output.elementos_promocionais || '')}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Processing Info */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>Processado em: {new Date(resultData.timestamp).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}