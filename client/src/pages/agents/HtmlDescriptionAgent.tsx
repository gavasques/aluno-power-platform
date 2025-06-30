import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Trash2,
  Copy,
  Info,
  ArrowLeft,
  Code2
} from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

export default function HtmlDescriptionAgent() {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  
  const MAX_CHARS = 2000;
  const WARNING_THRESHOLD = 1800;

  const allowedSymbols = [
    { symbol: '✅', desc: 'Check/OK' },
    { symbol: '❌', desc: 'X/Não' },
    { symbol: '⚠️', desc: 'Aviso' },
    { symbol: '📦', desc: 'Produto' },
    { symbol: '🚚', desc: 'Entrega' },
    { symbol: '💯', desc: 'Qualidade' },
    { symbol: '⭐', desc: 'Estrela' },
    { symbol: '🔥', desc: 'Destaque' },
    { symbol: '💪', desc: 'Força' },
    { symbol: '🎯', desc: 'Alvo' }
  ];

  // Aplicar formatação com execCommand
  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    generateHtml();
  };

  // Inserir símbolo na posição do cursor
  const insertSymbol = (symbol: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(symbol);
      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    generateHtml();
  };

  // Inserir lista
  const insertList = (ordered = false) => {
    applyFormat(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  // Gerar HTML limpo
  const generateHtml = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    let cleanHtml = content;

    // Limpar HTML desnecessário e converter para formato Amazon
    cleanHtml = cleanHtml
      .replace(/<div><br><\/div>/g, '<p>&nbsp;</p>')
      .replace(/<div>/g, '<p>')
      .replace(/<\/div>/g, '</p>')
      .replace(/<br>/g, '</p><p>')
      .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
      .replace(/style="[^"]*"/g, '') // Remover estilos inline
      .replace(/<span[^>]*>/g, '') // Remover spans
      .replace(/<\/span>/g, '')
      .replace(/<font[^>]*>/g, '') // Remover tags font
      .replace(/<\/font>/g, '')
      .replace(/&nbsp;/g, ' ') // Converter nbsp para espaço
      .trim();

    // Validar tags permitidas pela Amazon
    const allowedTags = ['p', 'strong', 'b', 'i', 'em', 'ul', 'ol', 'li', 'br'];
    cleanHtml = cleanHtml.replace(/<(\/?)([\w]+)[^>]*>/g, (match, slash, tag) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        return `<${slash}${tag.toLowerCase()}>`;
      }
      return '';
    });

    // Contar caracteres (texto puro)
    const textContent = editorRef.current.textContent || '';
    setCharCount(textContent.length);
    
    // Verificar limite de caracteres
    if (textContent.length >= MAX_CHARS) {
      // Limitar conteúdo
      const limitedText = textContent.substring(0, MAX_CHARS);
      editorRef.current.textContent = limitedText;
      toast({
        title: "Limite atingido",
        description: "Máximo de 2000 caracteres atingido",
        variant: "destructive"
      });
    }

    setHtmlOutput(cleanHtml);
  };

  // Copiar HTML para clipboard
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast({
        title: "HTML copiado!",
        description: "HTML copiado para área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o HTML",
        variant: "destructive"
      });
    }
  };

  // Limpar editor
  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setHtmlOutput('');
      setCharCount(0);
    }
  };

  // Handler para mudanças no editor
  const handleEditorChange = () => {
    generateHtml();
  };

  // Prevenir cola de HTML formatado
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    generateHtml();
  };

  // Cor do contador baseada no limite
  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return 'text-red-600';
    if (charCount >= WARNING_THRESHOLD) return 'text-yellow-600';
    return 'text-green-600';
  };

  const amazonRules = [
    "Use apenas tags HTML permitidas: <p>, <strong>, <b>, <i>, <em>, <ul>, <ol>, <li>, <br>",
    "Máximo de 2000 caracteres incluindo tags HTML",
    "Evite usar CSS inline ou JavaScript",
    "Use <p> para parágrafos e <p>&nbsp;</p> para linhas vazias",
    "Use <strong> ou <b> para texto em negrito",
    "Use <i> ou <em> para texto em itálico", 
    "Use <ul><li> para listas com marcadores",
    "Use <ol><li> para listas numeradas",
    "Símbolos permitidos: ✅ ❌ ⚠️ 📦 🚚 💯 ⭐ 🔥 💪 🎯",
    "Evite caracteres especiais não suportados",
    "Teste sempre no Seller Central antes de publicar"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/agents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Agentes
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Code2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Gerador de Descrições HTML Amazon
                  </h1>
                  <p className="text-sm text-gray-600">
                    Agente especializado em criar descrições HTML formatadas seguindo as regras da Amazon Brasil
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              AGENTE IA
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>Editor de Texto</span>
                </CardTitle>
                <span className={`text-sm font-medium ${getCounterColor()}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Toolbar */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Formatação
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormat('bold')}
                    >
                      <Bold className="h-4 w-4 mr-1" />
                      Negrito
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormat('italic')}
                    >
                      <Italic className="h-4 w-4 mr-1" />
                      Itálico
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertList(false)}
                    >
                      <List className="h-4 w-4 mr-1" />
                      Lista
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertList(true)}
                    >
                      <ListOrdered className="h-4 w-4 mr-1" />
                      Numerada
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Símbolos
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {allowedSymbols.map((item, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-lg p-2 h-8 w-8"
                        onClick={() => insertSymbol(item.symbol)}
                        title={item.desc}
                      >
                        {item.symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[300px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
                onInput={handleEditorChange}
                onPaste={handlePaste}
                placeholder="Digite sua descrição do produto aqui..."
                suppressContentEditableWarning={true}
              />

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={copyHtml} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar HTML
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearEditor}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output & Rules */}
          <div className="space-y-6">
            
            {/* HTML Output */}
            <Card>
              <CardHeader>
                <CardTitle>HTML Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words text-gray-800">
                    {htmlOutput || 'O HTML aparecerá aqui conforme você digita...'}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Amazon Rules */}
            <Card>
              <CardHeader>
                <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4" />
                        <span className="font-semibold">Regras da Amazon Brasil</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {rulesOpen ? 'Recolher' : 'Expandir'}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {amazonRules.map((rule, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 text-xs mt-1">•</span>
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}