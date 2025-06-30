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
  Info,
  Code2
} from 'lucide-react';

export default function HtmlDescriptionAgent() {
  const { toast } = useToast();
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  
  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;
  const placeholder = 'Digite sua descrição do produto aqui...\n\nDicas:\n• Use **texto** para negrito\n• Use *texto* para itálico\n• Use • para listas\n• Use 1. 2. 3. para listas numeradas';

  const allowedSymbols = [
    '✓', '©', '®', '★', '™', '♥', '①', '②', '③', '④'
  ];

  const charCount = textInput.length;

  // Renderizar preview formatado para overlay
  const renderFormattedPreview = (text: string) => {
    if (!text) return '';
    
    // Aplicar formatação visual simples
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold; color: #000;">$1</span>')
      .replace(/\*(.*?)\*/g, '<span style="font-style: italic; color: #000;">$1</span>')
      .replace(/• (.*?)(\n|$)/g, '<span style="color: #0066cc;">• </span><span style="color: #000;">$1</span>$2')
      .replace(/(\d+)\. (.*?)(\n|$)/g, '<span style="color: #0066cc;">$1. </span><span style="color: #000;">$2</span>$3');
    
    return formatted;
  };

  // Função para gerar HTML do contentEditable
  const generateHtml = () => {
    if (!textInput.trim()) {
      setHtmlOutput('');
      return;
    }

    // Processar o conteúdo linha por linha
    const lines = textInput.split('\n');
    const processedLines: string[] = [];
    let currentList: { type: string; items: string[] } = { type: '', items: [] };
    
    for (const line of lines) {
      let processedLine = line.trim();
      
      // Converter formatação markdown para HTML
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<i>$1</i>');
      
      // Verificar se é item de lista
      if (processedLine.startsWith('• ')) {
        if (currentList.type !== 'ul') {
          if (currentList.type && currentList.items.length > 0) {
            processedLines.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
          }
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(`<li>${processedLine.substring(2)}</li>`);
      } else if (/^\d+\.\s/.test(processedLine)) {
        if (currentList.type !== 'ol') {
          if (currentList.type && currentList.items.length > 0) {
            processedLines.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
          }
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(`<li>${processedLine.replace(/^\d+\.\s/, '')}</li>`);
      } else {
        // Finalizar lista atual se existir
        if (currentList.type && currentList.items.length > 0) {
          processedLines.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
          currentList = { type: '', items: [] };
        }
        
        // Processar linha normal
        if (processedLine.trim() === '') {
          processedLines.push('<p>&nbsp;</p>');
        } else {
          processedLines.push(`<p>${processedLine}</p>`);
        }
      }
    }
    
    // Finalizar lista pendente
    if (currentList.type && currentList.items.length > 0) {
      processedLines.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
    }
    
    let html = processedLines.join('');
    
    // Limpar HTML não permitido mantendo formatação
    html = html.replace(/<(?!\/?(strong|i|u|br|p|ul|ol|li|em)\b)[^>]*>/gi, '');
    
    setHtmlOutput(html);
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
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o HTML.",
        variant: "destructive",
      });
    }
  };

  // Limpar tudo
  const clearAll = () => {
    setTextInput('');
    setHtmlOutput('');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerador de Descrições HTML Amazon</h1>
              <p className="text-gray-600 mt-1">
                Agente especializado em criar descrições HTML formatadas para produtos da Amazon
              </p>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Editor de Texto</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    charCount >= MAX_CHARS ? 'text-red-600' :
                    charCount > WARNING_THRESHOLD ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {/* Formatação */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Formatação</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormatting('b')}
                    >
                      <Bold className="h-4 w-4" />
                      Negrito
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormatting('i')}
                    >
                      <Italic className="h-4 w-4" />
                      Itálico
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertList(false)}
                    >
                      <List className="h-4 w-4" />
                      Lista
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertList(true)}
                    >
                      <ListOrdered className="h-4 w-4" />
                      Numerada
                    </Button>
                  </div>
                </div>

                {/* Símbolos Permitidos pela Amazon */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Símbolos</h3>
                  <div className="flex flex-wrap gap-1">
                    {allowedSymbols.map((symbol) => (
                      <Button
                        key={symbol}
                        variant="outline"
                        size="sm"
                        className="px-3 py-1 text-lg"
                        onClick={() => insertSymbol(symbol)}
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
                  placeholder={placeholder}
                  className={`flex-1 resize-none min-h-[300px] ${
                    charCount >= MAX_CHARS ? 'border-red-500' :
                    charCount > WARNING_THRESHOLD ? 'border-yellow-500' :
                    'border-gray-300'
                  }`}
                  maxLength={MAX_CHARS}
                />
                
                {/* Overlay para mostrar formatação visual */}
                <div 
                  className="absolute top-0 left-0 w-full h-full p-3 pointer-events-none overflow-hidden z-10"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    color: 'transparent'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderFormattedPreview(textInput)
                  }}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={copyHtml}
                  disabled={!htmlOutput}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar HTML
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={!textInput}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          {/* Output Column */}
          <div className="space-y-6">
            {/* HTML Output */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">HTML Gerado</h2>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] font-mono text-sm">
                {htmlOutput || <span className="text-gray-400">O HTML aparecerá aqui...</span>}
              </div>
            </div>

            {/* Preview Visual */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Visual</h2>
              <div 
                className="bg-gray-50 rounded-lg p-4 min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          </div>
        </div>

        {/* Regras da Amazon */}
        <div className="mt-8 bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Regras da Amazon Brasil</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✅ PERMITIDO:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Tags HTML: &lt;strong&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
                <li>• Quebras de linha usando &lt;p&gt; (automático)</li>
                <li>• Máximo 2000 caracteres (incluindo espaços e tags)</li>
                <li>• Títulos de até 200 caracteres</li>
                <li>• Descrições claras e concisas</li>
                <li>• Símbolos permitidos: ✓ © ® ★ ™ ♥ ① ② ③ ④</li>
                <li>• Listas ordenadas e não ordenadas</li>
                <li>• Formatação em negrito e itálico</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-red-600 mb-2">❌ PROIBIDO:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• JavaScript ou qualquer código executável</li>
                <li>• Links externos ou URLs</li>
                <li>• Imagens ou vídeos incorporados</li>
                <li>• CSS inline ou folhas de estilo</li>
                <li>• Tags &lt;script&gt;, &lt;style&gt;, &lt;iframe&gt;</li>
                <li>• Mencionar preços ou promoções</li>
                <li>• Informações de contato ou redes sociais</li>
                <li>• Comparações diretas com concorrentes</li>
                <li>• Caracteres especiais não autorizados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}