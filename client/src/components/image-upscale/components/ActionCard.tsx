/**
 * Action button card component
 */

import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface ActionCardProps {
  onProcess: () => void;
  disabled: boolean;
  hasImage: boolean;
}

export const ActionCard = ({ onProcess, disabled, hasImage }: ActionCardProps) => {
  if (!hasImage || disabled) {
    return null;
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="pt-6">
        <button
          onClick={onProcess}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                     disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed 
                     text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center gap-2 
                     transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          <Sparkles className="h-5 w-5" />
          Melhorar com IA
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          A imagem será aumentada 2x usando inteligência artificial
        </p>
      </CardContent>
    </Card>
  );
};