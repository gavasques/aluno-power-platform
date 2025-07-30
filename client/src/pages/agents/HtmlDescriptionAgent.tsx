import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { useCreditSystem } from '@/hooks/useCreditSystem';
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
  Bold,
  Italic,
  List,
  ListOrdered,
  MoreHorizontal,
  Copy,
  Code2,
  Settings,
  Wand2,
  ArrowLeft
} from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { AgentCostDisplay } from '@/components/AgentCostDisplay';
import { logger } from '@/utils/logger';
import { Link } from 'wouter';

const HtmlDescriptionAgent: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { logAIGeneration, checkCredits, showInsufficientCreditsToast } = useCreditSystem();

  // Buscar saldo de créditos do usuário
  const { data: creditsData } = useQuery({
    queryKey: ['/api/credits/balance'],
    enabled: !!user?.id
  });

  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;
  const FEATURE_CODE = 'agents.html_descriptions';

  // Buscar configurações do agente
  const { data: agent } = useQuery({
    queryKey: ['/api/agents/html-description-generator'],
    enabled: true
  });

  // Atualizar configurações quando o agente for carregado
  useEffect(() => {
    if (agent) {
      const agentData = agent as any;
      setAgentConfig({
        provider: agentData?.provider || 'openai',
        model: agentData?.model || 'gpt-4o-mini',
        temperature: parseFloat(agentData?.temperature || '0.7'),
        maxTokens: agentData?.maxTokens || 2000
      });
    }
  }, [agent]);

  // Símbolos permitidos pela Amazon
  const allowedSymbols = [
    '✓', '©', '®', '★', '™', '♥', '①', '②', '③', '④'
  ];

  const charCount = textInput.length;

  // Função para validar HTML permitido pela Amazon
  const validateAmazonHtml = (html: string) => {
    return html.replace(/<(?!\/?(strong|i|u|br|p|ul|ol|li|em)\b)[^>]*>/gi, '');
  };

  // Converter texto para HTML
  const convertToHtml = useCallback((text: string) => {
    if (!text) return '';

    // Quebrar por linhas
    const lines = text.split('\n');
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        // Linha vazia - adiciona parágrafo vazio
        html += '<p>&nbsp;</p>';
      } else {
        // Processa formatação inline
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>');
        
        html += `<p>${processedLine}</p>`;
      }
    }
    
    return validateAmazonHtml(html);
  }, []);

  // Atualizar HTML quando texto mudar
  useEffect(() => {
    setHtmlOutput(convertToHtml(textInput));
  }, [textInput, convertToHtml]);

  // Aplicar formatação
  const applyFormatting = useCallback((format: string) => {
    const textarea = document.getElementById('text-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);
    
    if (selectedText) {
      let newText = '';
      let replacement = '';
      
      switch (format) {
        case 'bold':
          replacement = `**${selectedText}**`;
          break;
        case 'italic':
          replacement = `*${selectedText}*`;
          break;
        case 'ul':
          replacement = selectedText.split('\n').map(line => `• ${line}`).join('\n');
          break;
        case 'ol':
          replacement = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
          break;
        default:
          replacement = selectedText;
      }
      
      newText = textInput.substring(0, start) + replacement + textInput.substring(end);
      setTextInput(newText);
      
      // Reposicionar cursor
      setTimeout(() => {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
        textarea.focus();
      }, 0);
    }
  }, [textInput]);

  // Inserir símbolo
  const insertSymbol = useCallback((symbol: string) => {
    const textarea = document.getElementById('text-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = textInput.substring(0, start) + symbol + textInput.substring(end);
    
    setTextInput(newText);
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.selectionStart = start + symbol.length;
      textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  }, [textInput]);

  // Exemplo de texto
  const exampleText = `Maca BKZA é top, ela é dobrável e super resistente, aguenta até 200kg, e tem bolsa para levar.

Material resistente e durável
Ideal para uso diário
Garantia de 12 meses`;

  // Gerar descrição com IA
  const generateWithAI = async () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Digite uma descrição básica do produto antes de gerar com IA"
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

    // Validar se usuário tem créditos suficientes
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();
    
    try {
      const prompt = `${textInput}

# Regra 1: NUNCA EXCEDA 1900 Caracteres. Com espaços símbolos e tudo mais
Baseando-se na breve descrição que te dei do meu produto, por favor escreva uma descrição de produto PODEROSA e PERSUASIVA para Amazon. A descrição deve captar a atenção dos compradores e convencê-los de que meu produto é a melhor opção disponível na Amazon.

Comprimento da descrição:
a. Deve ter entre 1400 a 1800 Caracteres. Com espaços símbolos e tudo mais
b. Não pode ter menos de 1400 caracteres no total. Com espaços símbolos e tudo mais
c. Não pode ter mais de 1800 caracteres. Com espaços símbolos e tudo mais

Tom da Descrição:
A descrição deve ser envolvente, divertida e atraente, NUNCA entediante ou corporativa. O texto deve brilhar e se destacar da concorrência, transmitindo confiança e emoção ao comprador.
a. Mantenha um foco nos benefícios principais do produto, e como este melhora a vida do cliente.

Objetivo:
A descrição deve gerar urgência e levar o cliente a querer comprar o produto imediatamente. Deve soar natural, mas também ser incrivelmente persuasiva, destacando porque meu produto é o melhor que qualquer outra opção.

Fechamento Persuasivo:
Termine a descrição com uma chamada para ação direta e convincente, motivando o cliente a adicionar o produto ao carrinho imediatamente.

A descrição deve usar sempre que possível o que esse produto resolve, o porquê desse produto. Ex. Essa cadeira diminui a dor nas costas, devido a seguir a NR 17.`;

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          provider: agentConfig.provider,
          model: agentConfig.model,
          prompt: prompt,
          maxTokens: agentConfig.maxTokens,
          temperature: agentConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da IA');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Erro na resposta da API');
      }

      const responseText = data.response || '';
      const duration = Date.now() - startTime;

      // Salvar log da geração com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: agentConfig.provider,
        model: agentConfig.model,
        prompt: prompt,
        response: responseText,
        inputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.inputTokens || 0 : 0,
        outputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.outputTokens || 0 : 0,
        totalTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.totalTokens || 0 : 0,
        cost: data.cost || 0,
        creditsUsed: 0, // 0 para dedução automática através do LoggingService
        duration: duration
      });

      setGeneratedDescription(responseText);
      setShowReplaceDialog(true);
      
    } catch (error) {
      logger.error('Erro ao gerar descrição:', error);
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Falha ao gerar descrição com IA. Tente novamente."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Substituir conteúdo original
  const handleReplaceContent = (replace: boolean) => {
    if (replace) {
      setTextInput(generatedDescription);
      toast({
        title: "✅ Atualizado!",
        description: "Descrição substituída pela versão gerada pela IA"
      });
    }
    setShowReplaceDialog(false);
    setGeneratedDescription('');
  };

  // Copiar HTML para clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast({
        title: "✅ Copiado!",
        description: "HTML copiado para a área de transferência"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Falha ao copiar para área de transferência"
      });
    }
  }, [htmlOutput, toast]);

  // Cor do contador baseada no número de caracteres
  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return 'text-red-600 font-bold';
    if (charCount > WARNING_THRESHOLD) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  // Limpar conteúdo
  const clearContent = useCallback(() => {
    setTextInput('');
    setHtmlOutput('');
  }, []);

  return (
    <Layout>
      <PermissionGuard 
        featureCode="agents.html_descriptions"
        showMessage={true}
        message="Você não tem permissão para usar o Gerador de Descrições HTML."
      >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        {/* Header do Agente */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/agentes">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerador de Descrições HTML</h1>
                <p className="text-gray-600">Agente especializado em criar descrições persuasivas para Amazon</p>
              </div>
            </div>
            
            {/* Custo do Agente */}
            <AgentCostDisplay 
              featureCode={FEATURE_CODE}
              description="Custo por uso da IA:"
            />
          </div>
        </div>

        {/* Editor Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Entrada de Texto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-gray-900">Entrada de Texto</label>
              <span className={`text-sm ${getCounterColor()}`}>
                {charCount}/{MAX_CHARS} caracteres
              </span>
            </div>

            {/* Barra de Ferramentas */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <Button variant="outline" size="sm" onClick={() => applyFormatting('bold')}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyFormatting('italic')}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyFormatting('ul')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyFormatting('ol')}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              {/* Símbolos */}
              {allowedSymbols.map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => insertSymbol(symbol)}
                  className="text-base"
                >
                  {symbol}
                </Button>
              ))}
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              {/* Botões de Ação */}
              <Button 
                onClick={generateWithAI}
                disabled={isGenerating || !textInput.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <ButtonLoader />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={clearContent}>
                Limpar
              </Button>
            </div>

            <Textarea
              id="text-input"
              placeholder={`Digite ou cole a descrição básica do seu produto aqui...\n\nExemplo:\n${exampleText}`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.slice(0, MAX_CHARS))}
              className="h-96 resize-none font-mono text-sm"
            />
          </div>

          {/* Saída HTML */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-gray-900">Código HTML</label>
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar HTML
              </Button>
            </div>

            <div className="h-[500px] bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto">
              <pre className="whitespace-pre-wrap break-words">
                {htmlOutput || '<p>Seu HTML aparecerá aqui...</p>'}
              </pre>
            </div>
          </div>
        </div>

        {/* Regras da Amazon */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <details className="cursor-pointer">
            <summary className="font-semibold text-blue-900 mb-3">
              📋 Regras e Limitações da Amazon Brasil
            </summary>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-medium">Tags HTML Permitidas:</p>
                <p><strong>&lt;strong&gt;</strong>, <strong>&lt;i&gt;</strong>, <strong>&lt;u&gt;</strong>, <strong>&lt;br&gt;</strong>, <strong>&lt;p&gt;</strong>, <strong>&lt;ul&gt;</strong>, <strong>&lt;ol&gt;</strong>, <strong>&lt;li&gt;</strong>, <strong>&lt;em&gt;</strong></p>
              </div>
              <div>
                <p className="font-medium">Símbolos Permitidos:</p>
                <p>{allowedSymbols.join(' ')}</p>
              </div>
              <div>
                <p className="font-medium">Não Permitido:</p> 
                <p><strong>JavaScript, CSS inline, links externos, imagens</strong></p>
              </div>
            </div>
          </details>
        </div>
        </div>
      </div>

      {/* Dialog de Confirmação IA */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Descrição Gerada pela IA
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>A IA gerou uma nova descrição otimizada para seu produto. Deseja substituir o conteúdo atual?</p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Prévia da descrição gerada:</p>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {generatedDescription.length} caracteres
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto bg-white p-4 rounded border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {generatedDescription}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleReplaceContent(false)}>
              Manter Original
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleReplaceContent(true)}>
              Substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </PermissionGuard>
    </Layout>
  );
};

export default HtmlDescriptionAgent;