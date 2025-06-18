
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Images as ImageIcon } from 'lucide-react';
import { Prompt } from '@/types/prompt';

interface PromptDetailHeaderProps {
  prompt: Prompt;
}

export const PromptDetailHeader = ({ prompt }: PromptDetailHeaderProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setLocation('/hub/prompts-ia')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <div>
        <h1 className="text-3xl font-bold">{prompt.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{prompt.category.name}</Badge>
          {prompt.images && prompt.images.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              {prompt.images.length} {prompt.images.length === 1 ? 'imagem' : 'imagens'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
