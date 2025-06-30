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

  // Atualizar HTML quando texto muda
  useEffect(() => {
    setHtmlOutput(convertToHtml(textInput));
  }, [textInput, convertToHtml]);

  // Aplicar formatação
  const applyFormatting = (tag: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);
    
    if (selectedText) {
      let formattedText = '';
      switch (tag) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newText = textInput.substring(0, start) + formattedText + textInput.substring(end);
      setTextInput(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 10);
    }
  };

  // Inserir lista
  const insertList = (ordered: boolean = false) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listItems = ordered 
      ? '1. Item 1\n2. Item 2\n3. Item 3' 
      : '• Item 1\n• Item 2\n• Item 3';
    
    const newText = textInput.substring(0, start) + listItems + textInput.substring(start);
    setTextInput(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + listItems.length, start + listItems.length);
    }, 10);
  };

  // Inserir símbolo
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = textInput.substring(0, start) + symbol + textInput.substring(start);
    setTextInput(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // Inserir quebra de linha
  const insertLineBreak = () => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = textInput.substring(0, start) + '\n\n' + textInput.substring(start);
    setTextInput(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 10);
  };

  // Limpar todo o conteúdo
  const clearAll = () => {
    setTextInput('');
    setHtmlOutput('');
    
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
    
    toast({
      title: "🗑️ Limpo!",
      description: "Todo o conteúdo foi removido"
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

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: 'openai',
          model: 'gpt-4o-mini',
          prompt: prompt,
          maxTokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da OpenAI');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Erro na resposta da API');
      }
      setGeneratedDescription(data.response || '');
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerador de Descrições Amazon
          </h1>
          <p className="text-gray-600">
            Crie descrições em HTML profissionais para seus produtos Amazon com formatação rica e conformidade com as diretrizes da plataforma.
          </p>
        </div>

        {/* Container Principal */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            
            {/* Coluna Esquerda - Input */}
            <div className="bg-white p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  📝 Entrada de Texto
                </h2>
                <div className={`flex items-center gap-2 ${getCounterColor()}`}>
                  <span>{getCounterIcon()}</span>
                  <span className="text-sm font-medium">
                    {charCount}/{MAX_CHARS} {getCounterMessage()}
                  </span>
                </div>
              </div>

              {/* Barra de Ferramentas */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Botões de Formatação à Esquerda */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyFormatting('bold')}
                      className="h-8 px-2"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyFormatting('italic')}
                      className="h-8 px-2"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertList(false)}
                      className="h-8 px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertList(true)}
                      className="h-8 px-2"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Separador */}
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>

                  {/* Símbolos Permitidos */}
                  <div className="flex items-center gap-1">
                    {allowedSymbols.slice(0, 4).map((symbol, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        onClick={() => insertSymbol(symbol)}
                        className="h-8 px-2 text-sm"
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>

                  {/* Spacer para empurrar botões de ação para a direita */}
                  <div className="flex-1"></div>

                  {/* Botões de Ação à Direita */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={generateWithAI}
                      disabled={isGenerating || !textInput.trim()}
                      className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-8"
                      size="sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearAll}
                      className="flex items-center gap-1 h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Área de Texto */}
              <div className="flex-1">
                <Textarea
                  id="textInput"
                  value={textInput}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setTextInput(e.target.value);
                    }
                  }}
                  placeholder={placeholder}
                  className="w-full h-full resize-none border-2 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Coluna Direita - Output */}
            <div className="bg-white p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  🔧 Código HTML
                </h2>
                <Button
                  onClick={copyToClipboard}
                  disabled={!htmlOutput.trim()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar HTML
                </Button>
              </div>

              {/* Preview HTML */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full border-2 border-gray-300 rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  {htmlOutput ? (
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {htmlOutput}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">
                      O código HTML será exibido aqui...
                    </p>
                  )}
                </div>
              </div>

              {/* Regras da Amazon */}
              <details className="mt-4 border border-gray-200 rounded-lg">
                <summary className="p-3 bg-blue-50 cursor-pointer flex items-center gap-2 text-blue-700 font-medium">
                  <Info className="h-4 w-4" />
                  Diretrizes Amazon Brasil
                </summary>
                <div className="p-3 text-sm text-gray-600 space-y-2">
                  <p><strong>Tags Permitidas:</strong> &lt;strong&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;em&gt;</p>
                  <p><strong>Símbolos Permitidos:</strong> ✓ © ® ★ ™ ♥ ① ② ③ ④</p>
                  <p><strong>Limite de Caracteres:</strong> Máximo 2000 caracteres</p>
                  <p><strong>Proibido:</strong> JavaScript, CSS inline, links externos, imagens</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação IA */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Descrição Gerada pela IA
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>A IA gerou uma nova descrição otimizada para seu produto. Deseja substituir o conteúdo atual?</p>
              
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