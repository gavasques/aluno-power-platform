import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Trash2,
  Copy,
  Info,
  Wand2,
  Loader2
} from 'lucide-react';

const HtmlDescriptionGenerator: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const { toast } = useToast();

  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;

  // Símbolos permitidos pela Amazon
  const allowedSymbols = [
    '✓', '©', '®', '★', '™', '♥', '①', '②', '③', '④'
  ];

  const charCount = textInput.length;

  // Função para validar HTML permitido pela Amazon
  const validateAmazonHtml = (html: string) => {
    // Manter apenas tags permitidas pela Amazon
    return html.replace(/<(?!\/?(strong|i|u|br|p|ul|ol|li|em)\b)[^>]*>/gi, '');
  };

  // Renderizar preview formatado para overlay
  const renderFormattedPreview = (text: string) => {
    if (!text) return '<span style="color: #999;">' + placeholder + '</span>';
    
    // Aplicar formatação visual - converte markdown para visual real
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #000;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #000;">$1</em>')
      .replace(/• (.*?)(\n|$)/g, '<span style="color: #0066cc; font-weight: bold;">• </span><span style="color: #000;">$1</span>$2')
      .replace(/(\d+)\. (.*?)(\n|$)/g, '<span style="color: #0066cc; font-weight: bold;">$1. </span><span style="color: #000;">$2</span>$3')
      .replace(/\n/g, '<br>');
    
    return formatted;
  };

  // Função para gerar HTML do markdown
  const generateHtml = () => {
    if (!textInput.trim()) {
      setHtmlOutput('');
      return;
    }

    // Dividir por linhas
    const lines = textInput.split('\n');
    let htmlLines: string[] = [];

    for (const line of lines) {
      if (line.trim() === '') {
        // Linha vazia vira parágrafo com espaço
        htmlLines.push('<p>&nbsp;</p>');
      } else {
        // Aplicar formatação markdown para HTML
        let formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>')
          .replace(/• (.*)/g, '• $1')
          .replace(/(\d+)\. (.*)/g, '$1. $2');
        
        htmlLines.push(`<p>${formatted}</p>`);
      }
    }

    const finalHtml = htmlLines.join('\n');
    
    // Validar HTML (remover tags não permitidas)
    const cleanHtml = validateAmazonHtml(finalHtml);
    setHtmlOutput(cleanHtml);
  };

  // Gerar HTML em tempo real
  useEffect(() => {
    generateHtml();
  }, [textInput]);

  // Aplicar formatação usando markdown
  const applyFormatting = (type: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);
    
    if (selectedText) {
      const beforeText = textInput.substring(0, start);
      const afterText = textInput.substring(end);
      
      let formattedText = '';
      if (type === 'b') {
        formattedText = `**${selectedText}**`;
      } else if (type === 'i') {
        formattedText = `*${selectedText}*`;
      }
      
      const newText = beforeText + formattedText + afterText;
      
      if (newText.length <= MAX_CHARS) {
        setTextInput(newText);
        
        // Reposicionar cursor
        setTimeout(() => {
          const newPos = start + formattedText.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  // Inserir lista (visual)
  const insertList = (ordered = false) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);
    
    let listText = '';
    
    if (selectedText.trim()) {
      // Se há texto selecionado, converter para lista
      const lines = selectedText.split('\n').filter(line => line.trim() !== '');
      if (ordered) {
        listText = lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
      } else {
        listText = lines.map(line => `• ${line.trim()}`).join('\n');
      }
    } else {
      // Inserir lista vazia
      if (ordered) {
        listText = '1. Item 1\n2. Item 2\n3. Item 3';
      } else {
        listText = '• Item 1\n• Item 2\n• Item 3';
      }
    }
    
    const beforeText = textInput.substring(0, start);
    const afterText = textInput.substring(end);
    const newText = beforeText + listText + afterText;
    
    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      
      // Reposicionar cursor
      setTimeout(() => {
        const newPos = start + listText.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  };



  // Inserir símbolo
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = textInput.substring(0, start);
    const afterText = textInput.substring(start);
    const newText = beforeText + symbol + afterText;
    
    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      
      // Reposicionar cursor
      setTimeout(() => {
        const newPos = start + symbol.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  };

  // Copiar HTML
  const copyHtml = async () => {
    if (!htmlOutput) {
      toast({
        title: "Nada para copiar",
        description: "Digite algum texto primeiro para gerar o HTML.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast({
        title: "HTML copiado!",
        description: "O código HTML foi copiado para a área de transferência.",
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o HTML. Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  // Limpar tudo
  const clearAll = () => {
    setTextInput('');
    setHtmlOutput('');
    toast({
      title: "Conteúdo limpo",
      description: "Todo o texto foi removido.",
    });
  };

  // Cores do contador
  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return 'text-red-600';
    if (charCount > WARNING_THRESHOLD) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCounterIcon = () => {
    if (charCount >= MAX_CHARS) return '🚫';
    if (charCount > WARNING_THRESHOLD) return '⚠️';
    return '📝';
  };

  const getCounterMessage = () => {
    if (charCount >= MAX_CHARS) return 'Limite atingido!';
    if (charCount > WARNING_THRESHOLD) return 'Próximo do limite';
    return 'caracteres';
  };

  // Texto de exemplo
  const placeholder = `Digite aqui a descrição do seu produto...

Exemplo:
Produto de alta qualidade
Disponível em várias cores
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

    setIsGenerating(true);
    
    try {
      const prompt = `${textInput}

Baseando-se na breve descrição que te dei do meu produto, por favor escreva uma descrição de produto PODEROSA e PERSUASIVA para Amazon. A descrição deve captar a atenção dos compradores e convencê-los de que meu produto é a melhor opção disponível na Amazon.

Comprimento da descrição:
a. Deve ter entre 1500 a 2000 Caracteres
b. Não pode ter menos de 1500 caracteres no total
c. Não pode ter mais de 2000 caracteres.

Tom da Descrição:
A descrição deve ser envolvente, divertida e atraente, NUNCA entediante ou corporativa. O texto deve brilhar e se destacar da concorrência, transmitindo confiança e emoção ao comprador.
a. Mantenha um foco nos benefícios principais do produto, e como este melhora a vida do cliente.

Objetivo:
A descrição deve gerar urgência e levar o cliente a querer comprar o produto imediatamente. Deve soar natural, mas também ser incrivelmente persuasiva, destacando porque meu produto é o melhor que qualquer outra opção.

Fechamento Persuasivo:
Termine a descrição com uma chamada para ação direta e convincente, motivando o cliente a adicionar o produto ao carrinho imediatamente.`;

      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          prompt: prompt,
          maxTokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da OpenAI');
      }

      const data = await response.json();
      setGeneratedDescription(data.response);
      setShowReplaceDialog(true);
      
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
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
        description: "Falha ao copiar para a área de transferência"
      });
    }
  }, [htmlOutput, toast]);

  // Limpar todo o conteúdo
  const clearAll = () => {
    setTextInput('');
    setHtmlOutput('');
    toast({
      title: "🗑️ Limpo!",
      description: "Todo o conteúdo foi removido"
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerador de Descrições Amazon
          </h1>
          <p className="text-gray-600">
            Crie descrições profissionais para seus produtos na Amazon sem saber HTML
          </p>
        </div>

        {/* Layout Principal - 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
          {/* Coluna Esquerda - Editor */}
          <div className="bg-white border-r border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Editor de Texto
              </h2>
              <div className={`text-sm font-medium ${getCounterColor()}`}>
                {getCounterIcon()} {charCount}/{MAX_CHARS} {getCounterMessage()}
              </div>
            </div>

            {/* Barra de Ferramentas */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('b')}
                    className="flex items-center gap-1"
                  >
                    <Bold className="h-4 w-4" />
                    Negrito
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('i')}
                    className="flex items-center gap-1"
                  >
                    <Italic className="h-4 w-4" />
                    Itálico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertList(false)}
                    className="flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertList(true)}
                    className="flex items-center gap-1"
                  >
                    <ListOrdered className="h-4 w-4" />
                    Numerada
                  </Button>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button
                    onClick={generateWithAI}
                    disabled={isGenerating || !textInput.trim()}
                    size="sm"
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Gerar com IA
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearAll}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Símbolos Permitidos pela Amazon */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Símbolos Permitidos pela Amazon:</p>
                <div className="flex flex-wrap gap-1">
                  {allowedSymbols.map((symbol, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => insertSymbol(symbol)}
                      className="min-w-8 h-8 p-0 text-lg"
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Textarea com formatação visual */}
            <div className="relative flex-1">
              <Textarea
                id="textInput"
                value={textInput}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setTextInput(e.target.value);
                  }
                }}
                placeholder=""
                className={`flex-1 resize-none min-h-[300px] text-transparent caret-black selection:bg-blue-200 bg-transparent ${
                  charCount >= MAX_CHARS ? 'border-red-500' :
                  charCount > WARNING_THRESHOLD ? 'border-yellow-500' :
                  'border-gray-300'
                }`}
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit'
                }}
                maxLength={MAX_CHARS}
              />
              
              {/* Overlay para mostrar formatação visual */}
              <div 
                className="absolute top-0 left-0 w-full h-full p-3 pointer-events-none overflow-hidden z-0"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{
                  __html: renderFormattedPreview(textInput)
                }}
              />
            </div>


          </div>

          {/* Coluna Direita - Output */}
          <div className="bg-white p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Código HTML Gerado
              </h2>
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="flex items-center gap-1"
                disabled={!htmlOutput}
              >
                <Copy className="h-4 w-4" />
                Copiar HTML
              </Button>
            </div>

            {/* Output HTML */}
            <div 
              className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex-1 overflow-auto whitespace-pre-wrap"
              id="htmlOutput"
            >
              {htmlOutput || 'O código HTML aparecerá aqui conforme você digita...'}
            </div>
          </div>
        </div>

        {/* Regras da Amazon - Sempre Aberta Abaixo */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Info className="h-5 w-5" />
              📋 Regras da Amazon Brasil
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✅ PERMITIDO:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Tags HTML: &lt;strong&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
                <li>• Quebras de linha usando &lt;p&gt; (automático)</li>
                <li>• Máximo 2000 caracteres (incluindo espaços e tags)</li>
                <li>• Títulos de até 200 caracteres</li>
                <li>• Descrições claras e concisas</li>
                <li>• Símbolos permitidos: ✓ © ® ★ ™ ♥ ① ② ③ ④</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-red-600 mb-2">❌ PROIBIDO:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• JavaScript, HTML avançado ou CSS</li>
                <li>• Material promocional, anúncios ou marcas d'água</li>
                <li>• Reviews, depoimentos ou pedidos de avaliação</li>
                <li>• Links para outros sites</li>
                <li>• Informações sobre preço ou disponibilidade</li>
                <li>• Informações pessoais (emails, telefones, URLs)</li>
                <li>• Conteúdo obsceno ou ofensivo</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-yellow-600 mb-2">⚠️ IMPORTANTE:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Não seguir pode resultar em suspensão da conta</li>
                <li>• Cada produto deve ter seu próprio listing</li>
                <li>• Mantenha sempre a experiência do cliente em mente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmação de Substituição */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir Conteúdo Original?</AlertDialogTitle>
            <AlertDialogDescription>
              A IA gerou uma nova descrição. Deseja substituir o conteúdo original por esta nova versão?
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedDescription.substring(0, 300)}
                  {generatedDescription.length > 300 && '...'}
                </p>
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
    </Layout>
  );
};

export default HtmlDescriptionGenerator;