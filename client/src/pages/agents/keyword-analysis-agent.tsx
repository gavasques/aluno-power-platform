import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { Loader2, Search, TrendingUp, Target, BookOpen, Sparkles } from "lucide-react";
import { getAuthToken } from "@/utils/auth";

interface AnalysisResult {
  analysis: string;
  duration: number;
  cost: number;
}

export default function KeywordAnalysisAgent() {
  const [formData, setFormData] = useState({
    nome_produto: "",
    categoria: "",
    descricao: "",
    outras_informacoes: ""
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  const FEATURE_CODE = 'agents.keyword_analysis';
  const CREDIT_COST = 6;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.nome_produto.trim() && formData.categoria.trim() && formData.descricao.trim();

  const generateKeywordAnalysis = async () => {
    if (!isFormValid) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos Nome do Produto, Categoria e Descrição",
        variant: "destructive"
      });
      return;
    }

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      // Construir o prompt completo com base no template fornecido
      const prompt = `
Você é um especialista em SEO, marketing digital e vendas online, principalmente focado em Amazon, com foco exclusivo em análise de palavras-chave. Sua única tarefa é identificar, analisar e entregar uma lista completa e estratégica de palavras-chave relacionadas ao produto fornecido.

UTILIZE REASONING AVANÇADO E PESQUISA WEB para mapear todas as possibilidades de keywords que podem ser usadas no título do produto na Amazon.

INFORMAÇÕES DO PRODUTO:
- Nome do Produto: ${formData.nome_produto}
- Categoria: ${formData.categoria}
- Descrição: ${formData.descricao}
- Outras Informações: ${formData.outras_informacoes}

TAREFAS OBRIGATÓRIAS DE PESQUISA WEB:
1. Verificar tendências atuais de busca
2. Identificar termos emergentes no mercado
3. Analisar concorrentes diretos e indiretos no Amazon.com.br
4. Validar volume de busca e competitividade

ANÁLISE POR CATEGORIAS (para cada categoria, forneça pelo menos 4-8 keywords relevantes):

📍 1. SINÔNIMOS E VARIAÇÕES
- Pesquise no Google Trends Brasil variações do nome do produto
- Analise títulos de produtos similares na Amazon.com.br
- Considere diferenças regionais brasileiras

📍 2. TERMOS DE BUSCA DOS USUÁRIOS
- Como os consumidores realmente pesquisam por este produto
- Especificações técnicas, compatibilidades, características
- Diferentes níveis de conhecimento técnico

📍 3. UTILIDADE E FUNÇÃO
- Mapear todas as funções e usos do produto
- Problemas que o produto resolve
- Aplicações primárias e secundárias

📍 4. BENEFÍCIOS E VANTAGENS
- Keywords relacionadas aos benefícios motivadores de compra
- Vantagens competitivas e diferenciais
- Benefícios emocionais e funcionais

📍 5. CONTEXTO DE USO E AMBIENTE
- Onde, quando e em que situações o produto é usado
- Ambientes específicos (casa, trabalho, lazer)
- Ocasiões e momentos de uso

📍 6. REGIONALIZAÇÃO BRASILEIRA
- Variações linguísticas por região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste)
- Termos universais vs. regionais
- Exemplo: mandioca = macaxeira = aipim

📍 7. PERGUNTAS E OBJEÇÕES DOS CLIENTES
- Principais dúvidas sobre o produto
- Objeções comuns de compra
- Respostas persuasivas (2-4 frases cada)

📍 8. TEXTOS COMERCIAIS PARA FOTOS
Crie textos para 3 fotos infográficas:
- Foto 1: Apresentar produto + principal benefício
- Foto 2: Funcionalidades específicas + diferenciais
- Foto 3: Resultados + call-to-action de compra

FORMATO DE SAÍDA:
Organize sua resposta seguindo esta estrutura:

# 📊 ANÁLISE DE PALAVRAS-CHAVE - ${formData.nome_produto}

## 🔍 1. SINÔNIMOS E VARIAÇÕES
[Lista com prioridade Alta/Média/Baixa]

## 🎯 2. TERMOS DE BUSCA DOS USUÁRIOS
[Separar por intenção: informacional, comercial, transacional]

## ⚙️ 3. UTILIDADE E FUNÇÃO
[Tabela: Função | Keywords | Problema que Resolve]

## ✨ 4. BENEFÍCIOS E VANTAGENS  
[Tabela: Benefício | Keywords | Apelo Emocional]

## 🏠 5. CONTEXTO DE USO
[Tabela: Ambiente | Keywords Contextuais | Ocasião]

## 🗺️ 6. REGIONALIZAÇÃO BRASILEIRA
[Por região + termo universal recomendado]

## ❓ 7. PERGUNTAS E OBJEÇÕES
[Pergunta + Resposta persuasiva de 2-4 frases]

## 📸 8. TEXTOS PARA FOTOS INFOGRÁFICAS
**Foto 1:** [Título + 2-3 benefícios + CTA]
**Foto 2:** [Funcionalidades + diferenciais + garantia]  
**Foto 3:** [Resultados + satisfação + CTA forte]

## 🎯 TOP 10 KEYWORDS PRIORIZADAS
1. [Keyword] - Alta prioridade - [Justificativa]
[Continue 2-10...]

## 💡 TÍTULO SUGERIDO PARA AMAZON
[Construa um título otimizado usando as keywords de alta prioridade]

## 🚀 PRÓXIMOS PASSOS
[5 recomendações práticas para implementação]

IMPORTANTE: Priorize termos com intenção de compra, volume relevante no Brasil e baixa-média competitividade. Use reasoning para validar cada keyword antes de incluir.
`;

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: 'openai',
          model: 'gpt-4o',
          prompt: prompt,
          maxTokens: 8000,
          temperature: 0.7,
          enableWebSearch: true,
          enableReasoning: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Falha na análise de palavras-chave');
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      setResult({
        analysis: data.response,
        duration,
        cost: data.cost || 0
      });

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'openai',
        model: 'gpt-4o',
        prompt: `Análise de palavras-chave: ${formData.nome_produto}`,
        response: 'Análise completa de keywords gerada com sucesso',
        inputTokens: data.usage?.inputTokens || 0,
        outputTokens: data.usage?.outputTokens || 0,
        totalTokens: data.usage?.totalTokens || 0,
        cost: data.cost || 0,
        duration,
        creditsUsed: 0 // Será deduzido automaticamente
      });

      toast({
        title: "✅ Análise concluída!",
        description: `Análise de palavras-chave gerada em ${(duration / 1000).toFixed(1)}s`
      });

    } catch (error: any) {
      console.error('Error generating keyword analysis:', error);
      toast({
        title: "❌ Erro na análise",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_produto: "",
      categoria: "",
      descricao: "",
      outras_informacoes: ""
    });
    setResult(null);
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Análise de Palavras-Chave para Amazon
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análise completa de SEO com research avançado e estratégias regionalizadas
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
            <Sparkles className="w-3 h-3 mr-1" />
            {CREDIT_COST} créditos por análise
          </Badge>
          <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
            <TrendingUp className="w-3 h-3 mr-1" />
            Research com IA Avançada
          </Badge>
          <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
            <Target className="w-3 h-3 mr-1" />
            8 Categorias de Análise
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Informações do Produto
            </CardTitle>
            <CardDescription>
              Preencha os dados do produto para análise completa de palavras-chave
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_produto">Nome do Produto *</Label>
              <Input
                id="nome_produto"
                placeholder="Ex: Cadeira Gamer Ergonômica com LED RGB"
                value={formData.nome_produto}
                onChange={(e) => handleInputChange('nome_produto', e.target.value)}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.nome_produto.length}/100 caracteres
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria Amazon *</Label>
              <Input
                id="categoria"
                placeholder="Ex: Casa e Jardim > Móveis > Cadeiras de Escritório"
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                maxLength={80}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.categoria.length}/80 caracteres
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Produto *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva as principais características, materiais, dimensões, funcionalidades e benefícios do produto..."
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.descricao.length}/1000 caracteres
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outras_informacoes">Outras Informações</Label>
              <Textarea
                id="outras_informacoes"
                placeholder="Informações adicionais: marca, público-alvo, diferencial competitivo, certificações, garantia..."
                value={formData.outras_informacoes}
                onChange={(e) => handleInputChange('outras_informacoes', e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={800}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.outras_informacoes.length}/800 caracteres
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={generateKeywordAnalysis}
                disabled={!isFormValid || isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analisar Keywords ({CREDIT_COST} créditos)
                  </>
                )}
              </Button>
              
              {result && (
                <Button
                  onClick={resetForm}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Nova Análise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resultado da Análise
            </CardTitle>
            <CardDescription>
              Análise completa de palavras-chave com 8 categorias estratégicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">Análise de Keywords</p>
                <p className="text-sm">
                  Preencha as informações e clique em "Analisar Keywords" para gerar uma análise completa
                </p>
                <div className="mt-6 space-y-2 text-xs">
                  <p>✓ 1. Sinônimos e Variações</p>
                  <p>✓ 2. Termos de Busca dos Usuários</p>
                  <p>✓ 3. Utilidade e Função</p>
                  <p>✓ 4. Benefícios e Vantagens</p>
                  <p>✓ 5. Contexto de Uso e Ambiente</p>
                  <p>✓ 6. Regionalização Brasileira</p>
                  <p>✓ 7. Perguntas e Objeções</p>
                  <p>✓ 8. Textos para Fotos Infográficas</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Analysis Stats */}
                <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(result.duration / 1000).toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-500">Duração</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${result.cost.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">Custo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {CREDIT_COST}
                    </div>
                    <div className="text-xs text-gray-500">Créditos</div>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.analysis}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}