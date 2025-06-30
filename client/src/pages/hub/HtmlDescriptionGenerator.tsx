import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  CornerDownLeft, 
  FileText, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

const HtmlDescriptionGenerator = () => {
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const { toast } = useToast();

  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;

  // Símbolos permitidos pela Amazon
  const allowedSymbols = [
    '✓', '©', '®', '★', '™', '♥', '①', '②', '③', '④'
  ];

  // Converter texto para HTML
  const convertToHTML = useCallback((text: string) => {
    if (!text) return '';
    
    // Remover tags não permitidas
    let cleaned = text.replace(/<(?!\/?(?:b|i|u|br|p|ul|ol|li)\b)[^>]*>/gi, '');
    
    return cleaned;
  }, []);

  // Atualizar contador e HTML em tempo real
  useEffect(() => {
    const htmlCode = convertToHTML(textInput);
    setHtmlOutput(htmlCode);
    setCharCount(textInput.length);
  }, [textInput, convertToHTML]);

  // Inserir símbolo no cursor
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = textInput.substring(0, cursorPos);
    const textAfter = textInput.substring(cursorPos);
    const newText = textBefore + symbol + textAfter;

    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      // Reposicionar cursor após inserir símbolo
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos + symbol.length, cursorPos + symbol.length);
      }, 0);
    } else {
      toast({
        title: "⚠️ Limite excedido",
        description: "Símbolo não inserido: excederia o limite de 2000 caracteres",
        variant: "destructive"
      });
    }
  };

  // Aplicar formatação
  const applyFormatting = (tag: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);

    if (!selectedText) {
      toast({
        title: "⚠️ Selecione um texto",
        description: "Selecione o texto que deseja formatar",
        variant: "destructive"
      });
      return;
    }

    let newText = '';
    switch (tag) {
      case 'bold':
        newText = textInput.replace(selectedText, `<b>${selectedText}</b>`);
        break;
      case 'italic':
        newText = textInput.replace(selectedText, `<i>${selectedText}</i>`);
        break;
      case 'paragraph':
        newText = textInput.replace(selectedText, `<p>${selectedText}</p>`);
        break;
      default:
        return;
    }

    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      toast({
        title: "✅ Formatação aplicada",
        description: `Texto formatado com ${tag}`,
      });
    } else {
      toast({
        title: "⚠️ Limite excedido",
        description: "Formatação não aplicada: excederia o limite de 2000 caracteres",
        variant: "destructive"
      });
    }
  };

  // Criar lista
  const createList = (ordered = false) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);

    if (!selectedText) {
      toast({
        title: "⚠️ Selecione o texto",
        description: "Selecione as linhas que deseja transformar em lista",
        variant: "destructive"
      });
      return;
    }

    const lines = selectedText.split('\n').filter(line => line.trim());
    const listItems = lines.map(line => `<li>${line.trim()}</li>`).join('');
    const listTag = ordered ? 'ol' : 'ul';
    const newList = `<${listTag}>${listItems}</${listTag}>`;
    
    const newText = textInput.replace(selectedText, newList);

    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      toast({
        title: "✅ Lista criada",
        description: `Lista ${ordered ? 'numerada' : 'com marcadores'} criada com sucesso`,
      });
    } else {
      toast({
        title: "⚠️ Limite excedido",
        description: "Lista não criada: excederia o limite de 2000 caracteres",
        variant: "destructive"
      });
    }
  };

  // Inserir quebra de linha
  const insertLineBreak = () => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = textInput.substring(0, cursorPos);
    const textAfter = textInput.substring(cursorPos);
    const newText = textBefore + '<br>' + textAfter;

    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos + 4, cursorPos + 4);
      }, 0);
    }
  };

  // Copiar HTML
  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast({
        title: "✅ Código HTML copiado!",
        description: "O código foi copiado para sua área de transferência",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  // Limpar tudo
  const clearAll = () => {
    setTextInput('');
    setHtmlOutput('');
    setCharCount(0);
    toast({
      title: "🗑️ Conteúdo limpo",
      description: "Todo o conteúdo foi removido",
    });
  };

  // Cor do contador baseado no limite
  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return 'text-red-600';
    if (charCount > WARNING_THRESHOLD) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Ícone do contador
  const getCounterIcon = () => {
    if (charCount >= MAX_CHARS) return '🚫';
    if (charCount > WARNING_THRESHOLD) return '⚠️';
    return '📊';
  };

  // Mensagem do contador
  const getCounterMessage = () => {
    if (charCount >= MAX_CHARS) return 'Limite atingido!';
    if (charCount > WARNING_THRESHOLD) return 'Atenção!';
    return 'caracteres';
  };

  const placeholder = `Digite aqui a descrição do seu produto.

Exemplo:
✅ Produto de alta qualidade
✅ Disponível em várias cores
✅ Material resistente e durável
✅ Ideal para uso diário
✅ Garantia de 12 meses`;

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
              <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('bold')}
                    className="flex items-center gap-1"
                  >
                    <Bold className="h-4 w-4" />
                    Negrito
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('italic')}
                    className="flex items-center gap-1"
                  >
                    <Italic className="h-4 w-4" />
                    Itálico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createList(false)}
                    className="flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createList(true)}
                    className="flex items-center gap-1"
                  >
                    <ListOrdered className="h-4 w-4" />
                    Numerada
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={insertLineBreak}
                    className="flex items-center gap-1"
                  >
                    <CornerDownLeft className="h-4 w-4" />
                    Quebra
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('paragraph')}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Parágrafo
                  </Button>
                </div>

                {/* Símbolos Permitidos */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Símbolos Permitidos pela Amazon:
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {allowedSymbols.map((symbol, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => insertSymbol(symbol)}
                        className="text-lg p-1 h-8 w-8"
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                id="textInput"
                value={textInput}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setTextInput(e.target.value);
                  }
                }}
                placeholder={placeholder}
                className={`flex-1 resize-none ${
                  charCount >= MAX_CHARS ? 'border-red-500' :
                  charCount > WARNING_THRESHOLD ? 'border-yellow-500' :
                  'border-gray-300'
                }`}
                maxLength={MAX_CHARS}
              />

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAll}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar Tudo
                </Button>
              </div>
          </div>

          {/* Coluna Direita - Output */}
          <div className="bg-white p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Código HTML Gerado
                </h2>
                <Button
                  onClick={copyHTML}
                  disabled={!htmlOutput}
                  className="flex items-center gap-1"
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
                      <li>• Tags HTML: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
                      <li>• Quebras de linha usando &lt;br&gt;</li>
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
    </Layout>
  );
};

export default HtmlDescriptionGenerator;