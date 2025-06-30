import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  RotateCcw, 
  Wand2, 
  Loader2,
  Copy
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (action: FormatAction) => void;
  onInsertSymbol: (symbol: string) => void;
  onGenerateAI: () => void;
  onClear: () => void;
  onCopyHtml: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

interface FormatAction {
  before: string;
  after: string;
  type: 'wrap' | 'insert';
}

const ALLOWED_SYMBOLS = ['✅', '❌', '⚠️', '📦', '🚚', '💯', '⭐', '🔥', '💪', '🎯'];

export const HtmlGeneratorToolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onInsertSymbol,
  onGenerateAI,
  onClear,
  onCopyHtml,
  isGenerating,
  disabled = false
}) => {
  const formatActions = {
    bold: { before: '**', after: '**', type: 'wrap' as const },
    italic: { before: '*', after: '*', type: 'wrap' as const },
    unorderedList: { before: '• ', after: '', type: 'insert' as const },
    orderedList: { before: '1. ', after: '', type: 'insert' as const },
    lineBreak: { before: '\n', after: '', type: 'insert' as const }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b rounded-t-lg">
      {/* Formatação */}
      <div className="flex gap-1 border-r pr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFormat(formatActions.bold)}
          disabled={disabled}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFormat(formatActions.italic)}
          disabled={disabled}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      {/* Listas */}
      <div className="flex gap-1 border-r pr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFormat(formatActions.unorderedList)}
          disabled={disabled}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFormat(formatActions.orderedList)}
          disabled={disabled}
          title="Lista Numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Símbolos */}
      <div className="flex gap-1 border-r pr-2">
        {ALLOWED_SYMBOLS.slice(0, 5).map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            size="sm"
            onClick={() => onInsertSymbol(symbol)}
            disabled={disabled}
            title={`Inserir ${symbol}`}
          >
            {symbol}
          </Button>
        ))}
      </div>

      {/* Ações IA e Utilitários */}
      <div className="flex gap-1 ml-auto">
        <Button
          onClick={onGenerateAI}
          disabled={isGenerating || disabled}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Wand2 className="h-4 w-4 mr-1" />
          )}
          {isGenerating ? 'Gerando...' : 'Gerar com IA'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={disabled}
          title="Limpar"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCopyHtml}
          disabled={disabled}
          title="Copiar HTML"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};