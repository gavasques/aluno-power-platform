
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptContentProps {
  content: string;
  title: string;
}

export const PromptContent = ({ content, title }: PromptContentProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Prompt copiado!",
        description: `O prompt "${title}" foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para destacar conteúdo dentro de {} e []
  const highlightPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]*\]|\{[^}]*\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\[[^\]]*\]$/) || part.match(/^\{[^}]*\}$/)) {
        return (
          <span 
            key={index} 
            className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="h-5 w-5" />
            Conteúdo do Prompt
          </CardTitle>
          <Button 
            onClick={() => copyToClipboard(content, title)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
            {highlightPlaceholders(content)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
