import React, { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useHtmlGenerator } from '@/hooks/useHtmlGenerator';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { HtmlGeneratorToolbar } from '@/components/HtmlGeneratorToolbar';
import { CharacterCounter } from '@/components/CharacterCounter';
import { AIConfirmationDialog } from '@/components/AIConfirmationDialog';
import { copyToClipboard } from '@/utils/clipboard';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface FormatAction {
  before: string;
  after: string;
  type: 'wrap' | 'insert';
}

const MAX_CHARS = 2000;
const WARNING_THRESHOLD = 1800;
const EXAMPLE_TEXT = `Smartwatch Ultra Resistente
Resistente à água e quedas
Material resistente e durável
Ideal para uso diário
Garantia de 12 meses`;

const HtmlDescriptionGenerator: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const { toast } = useToast();
  
  const {
    textInput,
    htmlOutput,
    isGenerating,
    generatedDescription,
    showReplaceDialog,
    setIsGenerating,
    setGeneratedDescription,
    setShowReplaceDialog,
    updateTextInput,
    handleReplaceContent,
    reset
  } = useHtmlGenerator();

  const { generateWithAI } = useAIGeneration();

  const insertAtCursor = useCallback((textarea: HTMLTextAreaElement, text: string) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    updateTextInput(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [updateTextInput]);

  const applyFormat = useCallback((action: FormatAction) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (action.type === 'wrap' && selectedText) {
      const wrappedText = `${action.before}${selectedText}${action.after}`;
      insertAtCursor(textarea, wrappedText.substring(selectedText.length));
    } else {
      insertAtCursor(textarea, action.before);
    }
  }, [insertAtCursor]);

  const insertSymbol = useCallback((symbol: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      insertAtCursor(textarea, symbol);
    }
  }, [insertAtCursor]);

  const handleGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    const result = await generateWithAI(textInput);
    
    if (result.success && result.result) {
      setGeneratedDescription(result.result);
      setShowReplaceDialog(true);
    }
    
    setIsGenerating(false);
  }, [textInput, generateWithAI, setIsGenerating, setGeneratedDescription, setShowReplaceDialog]);

  const handleCopyHtml = useCallback(async () => {
    const success = await copyToClipboard(htmlOutput);
    toast({
      title: success ? "✅ Copiado!" : "❌ Erro",
      description: success ? "HTML copiado para a área de transferência" : "Falha ao copiar HTML"
    });
  }, [htmlOutput, toast]);

  const loadExample = useCallback(() => {
    updateTextInput(EXAMPLE_TEXT);
    toast({
      title: "📝 Exemplo carregado",
      description: "Texto de exemplo inserido com sucesso"
    });
  }, [updateTextInput, toast]);

  const clearAll = useCallback(() => {
    reset();
    toast({
      title: "🗑️ Limpo",
      description: "Todo o conteúdo foi removido"
    });
  }, [reset, toast]);

  const charCount = textInput.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerador de Descrições HTML para Amazon
          </h1>
          <p className="text-gray-600">
            Crie descrições otimizadas seguindo as regras da Amazon Brasil com formatação HTML válida
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna de Entrada */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Entrada de Texto</h2>
                <CharacterCounter 
                  current={charCount} 
                  max={MAX_CHARS} 
                  warningThreshold={WARNING_THRESHOLD} 
                />
              </div>

              <HtmlGeneratorToolbar
                onFormat={applyFormat}
                onInsertSymbol={insertSymbol}
                onGenerateAI={handleGenerateAI}
                onClear={clearAll}
                onCopyHtml={handleCopyHtml}
                isGenerating={isGenerating}
                disabled={charCount >= MAX_CHARS}
              />

              <div className="p-4">
                <Textarea
                  value={textInput}
                  onChange={(e) => updateTextInput(e.target.value)}
                  placeholder="Digite a descrição do seu produto aqui..."
                  className="min-h-64 resize-none border-0 focus:ring-0 p-0"
                  maxLength={MAX_CHARS}
                />
              </div>

              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <button
                  onClick={loadExample}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  📝 Carregar exemplo
                </button>
              </div>
            </div>
          </div>

          {/* Coluna de Saída */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Código HTML</h2>
                <button
                  onClick={handleCopyHtml}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  disabled={!htmlOutput}
                >
                  📋 Copiar HTML
                </button>
              </div>

              <div className="p-4">
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm min-h-64 overflow-auto border">
                  <pre className="whitespace-pre-wrap text-gray-800">
                    {htmlOutput || '<p>Seu HTML aparecerá aqui...</p>'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Regras da Amazon */}
            <div className="bg-white rounded-lg border shadow-sm">
              <button
                onClick={() => setShowRules(!showRules)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Regras da Amazon Brasil</span>
                </div>
                {showRules ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              
              {showRules && (
                <div className="p-4 border-t space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">✅ Tags HTML Permitidas:</p>
                    <p><strong>&lt;strong&gt;</strong>, <strong>&lt;i&gt;</strong>, <strong>&lt;u&gt;</strong>, <strong>&lt;br&gt;</strong>, <strong>&lt;p&gt;</strong>, <strong>&lt;ul&gt;</strong>, <strong>&lt;ol&gt;</strong>, <strong>&lt;li&gt;</strong>, <strong>&lt;em&gt;</strong></p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">✅ Símbolos Permitidos:</p>
                    <p>✅ ❌ ⚠️ 📦 🚚 💯 ⭐ 🔥 💪 🎯</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">❌ Não Permitido:</p>
                    <p><strong>JavaScript, CSS inline, links externos, imagens</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AIConfirmationDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        onConfirm={() => handleReplaceContent(true)}
        onCancel={() => handleReplaceContent(false)}
        generatedText={generatedDescription}
      />
    </Layout>
  );
};

export default HtmlDescriptionGenerator;