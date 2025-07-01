import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulletPointsInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  maxChars: number;
  warningThreshold: number;
}

export const BulletPointsInput: React.FC<BulletPointsInputProps> = ({
  value,
  onChange,
  onGenerate,
  onClear,
  isGenerating,
  maxChars,
  warningThreshold
}) => {
  const { toast } = useToast();
  const charCount = value.length;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length > maxChars) {
      toast({
        variant: "destructive",
        title: "❌ Limite excedido",
        description: `O limite é de ${maxChars} caracteres. Digite menos informações.`
      });
      return;
    }
    onChange(newValue);
  };

  const getCharCountColor = () => {
    if (charCount >= maxChars) return 'text-red-600';
    if (charCount >= warningThreshold) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Informações do Produto
        </h2>
        <span className={`text-sm font-medium ${getCharCountColor()}`}>
          {charCount}/{maxChars} caracteres
        </span>
      </div>
      
      <Textarea
        value={value}
        onChange={handleInputChange}
        placeholder="Descreva as características, benefícios e informações técnicas do seu produto. Inclua público-alvo, materiais, dimensões, funcionalidades e qualquer diferencial competitivo..."
        className="min-h-[400px] resize-none text-sm"
      />
      
      <div className="flex gap-2 mt-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? 'Gerando...' : 'Criar Bullet Points'}
        </Button>
        
        <Button
          variant="outline"
          onClick={onClear}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
};