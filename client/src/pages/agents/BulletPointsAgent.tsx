import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import type { Agent } from '@shared/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Copy,
  Settings,
  Loader2,
  Wand2,
  List
} from 'lucide-react';

const BulletPointsAgent: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [bulletPointsOutput, setBulletPointsOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBulletPoints, setGeneratedBulletPoints] = useState('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;

  // Buscar configurações do agente
  const { data: agent } = useQuery({
    queryKey: ['/api/agents/bullet-points-generator'],
    enabled: true,
  });

  // Atualizar configurações quando o agente for carregado
  useEffect(() => {
    if (agent && typeof agent === 'object') {
      setAgentConfig({
        provider: (agent as any).provider || 'openai',
        model: (agent as any).model || 'gpt-4o-mini',
        temperature: (agent as any).temperature || 0.7,
        maxTokens: (agent as any).maxTokens || 2000
      });
    }
  }, [agent]);

  const charCount = textInput.length;

  // Função para copiar bullet points
  const copyBulletPoints = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bulletPointsOutput);
      toast({
        title: "✓ Copiado!",
        description: "Bullet points copiados para a área de transferência",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Erro ao copiar bullet points",
      });
    }
  }, [bulletPointsOutput, toast]);

  // Função para gerar bullet points com IA
  const generateWithAI = async () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Por favor, insira informações sobre o produto antes de gerar bullet points",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Usuário não autenticado",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const startTime = Date.now();
      
      const prompt = `PROMPT PARA CRIAÇÃO DE BULLET POINTS AMAZON - ALTA CONVERSÃO

INSTRUÇÕES GERAIS

Você é um especialista em copywriting para Amazon com mais de 10 anos de experiência em otimização de listings que convertem. Sua missão é criar 8 bullet points extremamente persuasivos e comerciais que despertem o desejo de compra imediato.

FORMATO OBRIGATÓRIO DOS BULLET POINTS

BENEFÍCIO EM MAIÚSCULAS - Características que respaldem esse benefício de maneira clara e precisa. ADICIONAR AO CARRINHO

ESPECIFICAÇÕES TÉCNICAS:

• Cada bullet point deve ter entre 180 e 250 caracteres
• SEMPRE terminar com "ADICIONAR AO CARRINHO"
• Benefício principal em MAIÚSCULAS no início
• Características de apoio após o hífen
• Tom comercial e persuasivo extremamente forte
• Foco em despertar desejo de compra AGORA

ESTRUTURA DOS 8 BULLET POINTS

BULLET POINT 1: PÚBLICO-ALVO + PROPOSTA ÚNICA DE VALOR
Foco: Quem é o produto + diferencial único + credibilidade
Elementos: Autoridade, confiança, superioridade sobre concorrentes
Tom: Transformacional, não incremental

BULLET POINT 2: BENEFÍCIO EMOCIONAL PRINCIPAL
Foco: Principal benefício emocional + ponte para características técnicas
Elementos: Resultado real que o cliente vai sentir + como isso é possível
Tom: Experiencial, sensorial

BULLET POINT 3: CARACTERÍSTICAS TÉCNICAS + BENEFÍCIOS
Foco: Recursos técnicos mais importantes + FAQ + ponte para benefícios
Elementos: Diferenciação técnica + resposta a objeções comuns
Tom: Educativo mas persuasivo

BULLET POINT 4: FACILIDADE DE USO
Foco: Como usar + facilidade de propriedade + manutenção
Elementos: Processo simples + conveniência + praticidade
Tom: Tranquilizador, remove barreiras

BULLET POINT 5: REDUÇÃO DE RISCO + VALORES
Foco: Garantias + certificações + alinhamento com valores do cliente
Elementos: Warranty, garantias, certificações, origem, causas apoiadas
Tom: Confiável, seguro

BULLET POINT 6: TRANSFORMAÇÃO/RESULTADO FINAL
Foco: Transformação completa que o produto proporciona
Elementos: Antes vs depois + impacto na vida + urgência
Tom: Inspiracional, transformacional

BULLET POINT 7: EXCLUSIVIDADE + ESCASSEZ
Foco: O que torna este produto único + elementos de escassez
Elementos: Tecnologia exclusiva + limitações + diferenciação
Tom: Urgente, exclusivo

BULLET POINT 8: CALL TO ACTION FINAL
Foco: Chamada final irresistível para ação
Elementos: Síntese dos benefícios + urgência + facilidade de compra
Tom: Urgente, irresistível

TÉCNICAS DE COPYWRITING OBRIGATÓRIAS

PALAVRAS DE PODER A USAR:
• FINALMENTE, REVOLUCIONÁRIO, EXCLUSIVO, COMPROVADO, SUPERIOR
• IMEDIATO, INSTANTÂNEO, TRANSFORME, EXPERIMENTE, DESCUBRA
• GARANTIDO, CLINICAMENTE TESTADO, PREMIUM, PROFISSIONAL
• ÚNICO, AVANÇADO, INOVADOR, EFICAZ, PODEROSO

TÉCNICAS PSICOLÓGICAS:
1. Agitação da Dor: Mencione o problema que resolve
2. Ponte Benefício-Característica: Sempre conecte recursos técnicos aos benefícios reais
3. Prova Social: Use indicadores de autoridade e credibilidade
4. Urgência: Crie senso de que precisam agir agora
5. Propriedade Mental: Faça o cliente se imaginar usando o produto
6. Transformação: Posicione como experiência transformadora, não melhoria incremental

EVITAR ABSOLUTAMENTE:
• Palavras como "nosso", "nós" (use "seu", "você")
• Menções de preço ou promoções
• Políticas de envio ou devolução
• Jargões técnicos sem explicação
• Linguagem genérica ou vaga
• Referir ao produto como "este" ou "isso"

INSTRUÇÕES DE EXECUÇÃO

PASSO 1: Analise as informações técnicas do produto fornecidas
PASSO 2: Identifique o público-alvo principal e suas dores/desejos
PASSO 3: Extraia os 3 benefícios mais poderosos
PASSO 4: Identifique as características técnicas que suportam cada benefício
PASSO 5: Crie os 8 bullet points seguindo a estrutura exata
PASSO 6: Verifique se cada bullet tem 180-250 caracteres
PASSO 7: Confirme que todos terminam com "ADICIONAR AO CARRINHO"
PASSO 8: Revise o tom para máxima persuasão comercial

EXEMPLO DE APLICAÇÃO:
ALÍVIO INSTANTÂNEO E DURADOURO DA DOR COMPROVADO CLINICAMENTE - Tecnologia de alta frequência penetra profundamente como massagem suave, superior a TENS tradicionais. ADICIONAR AO CARRINHO

Agora, com base nas informações do produto abaixo, crie 8 bullet points seguindo exatamente as especificações:

${textInput}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          provider: agentConfig.provider,
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Salvar log da geração
      await fetch('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          feature: 'bullet-points-generator',
          provider: agentConfig.provider,
          model: agentConfig.model,
          promptText: prompt,
          responseText: data.response,
          promptTokens: data.usage?.prompt_tokens || 0,
          responseTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          estimatedCost: data.cost || 0,
          processingTime: duration,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
        }),
      });

      if (bulletPointsOutput && bulletPointsOutput.trim()) {
        setGeneratedBulletPoints(data.response);
        setShowReplaceDialog(true);
      } else {
        setBulletPointsOutput(data.response);
        toast({
          title: "✓ Bullet Points Gerados!",
          description: "Bullet points criados com sucesso usando IA",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar bullet points:', error);
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Erro ao gerar bullet points com IA",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplaceConfirm = () => {
    setBulletPointsOutput(generatedBulletPoints);
    setShowReplaceDialog(false);
    setGeneratedBulletPoints('');
    toast({
      title: "✓ Atualizado!",
      description: "Bullet points substituídos com sucesso",
    });
  };

  const handleClearAll = () => {
    setTextInput('');
    setBulletPointsOutput('');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <List className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gerador de Bullet Points
                </h1>
                <p className="text-gray-600 mt-1">
                  Crie bullet points persuasivos para produtos Amazon com alta conversão
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/admin/agents/providers', '_blank')}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configurações
              </Button>
            </div>
          </div>

          {/* Grid de 2 colunas */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna da Esquerda - Entrada */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informações do Produto
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`font-medium ${
                        charCount > WARNING_THRESHOLD
                          ? charCount >= MAX_CHARS
                            ? 'text-red-600'
                            : 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {charCount}/{MAX_CHARS} caracteres
                    </span>
                  </div>
                </div>
                
                <Textarea
                  value={textInput}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setTextInput(e.target.value);
                    }
                  }}
                  placeholder="Descreva as características, benefícios e informações técnicas do seu produto. Inclua público-alvo, materiais, dimensões, funcionalidades e qualquer diferencial competitivo..."
                  className="min-h-[300px] resize-none text-sm"
                />
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={generateWithAI}
                    disabled={isGenerating || !textInput.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Gerando...' : 'Criar Bullet Points'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>

            {/* Coluna da Direita - Saída */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bullet Points Gerados
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBulletPoints}
                    disabled={!bulletPointsOutput}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar Bullet Points
                  </Button>
                </div>
                
                <Textarea
                  value={bulletPointsOutput}
                  onChange={(e) => setBulletPointsOutput(e.target.value)}
                  placeholder="Os bullet points gerados aparecerão aqui. Você pode editá-los conforme necessário..."
                  className="min-h-[300px] resize-none text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir Bullet Points?</AlertDialogTitle>
            <AlertDialogDescription>
              Já existem bullet points no campo de saída. Deseja substituí-los pelos novos bullet points gerados?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>
              Substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default BulletPointsAgent;