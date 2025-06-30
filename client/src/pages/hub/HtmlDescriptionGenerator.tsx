import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Trash2,
  Copy,
  Info
} from 'lucide-react';

const HtmlDescriptionGenerator: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const { toast } = useToast();

  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;

  // Símbolos permitidos pela Amazon
  const allowedSymbols = [
    '✓', '©', '®', '★', '™', '♥', '①', '②', '③', '④'
  ];

  const charCount = textInput.length;

  // Gerar HTML em tempo real
  useEffect(() => {
    if (!textInput.trim()) {
      setHtmlOutput('');
      return;
    }

    let html = textInput;
    
    // Aplicar formatação básica
    html = html.replace(/\n/g, '<br>\n');
    
    // Limpar HTML não permitido (validação básica)
    html = html.replace(/<(?!\/?(b|i|u|br|p|ul|ol|li|strong|em)\b)[^>]*>/gi, '');
    
    setHtmlOutput(html);
  }, [textInput]);

  // Aplicar formatação
  const applyFormatting = (tag: string) => {
    const textarea = document.getElementById('textInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textInput.substring(start, end);
    
    if (selectedText) {
      const beforeText = textInput.substring(0, start);
      const afterText = textInput.substring(end);
      const formattedText = `<${tag}>${selectedText}</${tag}>`;
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

  // Inserir lista
  const insertList = (ordered = false) => {
    const listType = ordered ? 'ol' : 'ul';
    const listHtml = `<${listType}>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</${listType}>`;
    
    const newText = textInput + '\n' + listHtml;
    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
    }
  };

  // Inserir quebra de linha
  const insertBreak = () => {
    const newText = textInput + '<br>';
    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
    }
  };

  // Inserir parágrafo
  const insertParagraph = () => {
    const newText = textInput + '\n<p>Novo parágrafo</p>';
    if (newText.length <= MAX_CHARS) {
      setTextInput(newText);
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
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={insertBreak}
                >
                  Quebra
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={insertParagraph}
                >
                  Parágrafo
                </Button>
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
                onClick={copyHtml}
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
      </div>
    </Layout>
  );
};

export default HtmlDescriptionGenerator;