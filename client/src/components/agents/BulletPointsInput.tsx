import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  productName: string;
  brand: string;
  textInput: string;
  targetAudience: string;
  keywords: string;
}

interface BulletPointsInputProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  maxChars: number;
  warningThreshold: number;
}

export const BulletPointsInput: React.FC<BulletPointsInputProps> = ({
  formData,
  onChange,
  onGenerate,
  onClear,
  isGenerating,
  maxChars,
  warningThreshold
}) => {
  const { toast } = useToast();
  const charCount = formData.textInput.length;

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length > maxChars) {
      toast({
        variant: "destructive",
        title: "❌ Limite excedido",
        description: `O limite é de ${maxChars} caracteres. Digite menos informações.`
      });
      return;
    }
    onChange('textInput', newValue);
  };

  const getCharCountColor = () => {
    if (charCount >= maxChars) return 'text-red-600';
    if (charCount >= warningThreshold) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const isFormValid = formData.productName.trim() && formData.textInput.trim();

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Informações do Produto
        </h2>
        
        <div className="space-y-4">
          {/* Nome do Produto - Obrigatório */}
          <div>
            <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
              Nome do Produto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => onChange('productName', e.target.value)}
              placeholder="Ex: Smartphone Samsung Galaxy S24 128GB"
              className="mt-1"
            />
          </div>

          {/* Marca */}
          <div>
            <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
              Marca
            </Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="Ex: Samsung, Apple, Nike..."
              className="mt-1"
            />
          </div>

          {/* Público Alvo */}
          <div>
            <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">
              Público Alvo
            </Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => onChange('targetAudience', e.target.value)}
              placeholder="Ex: Jovens adultos, Profissionais de tecnologia..."
              className="mt-1"
            />
          </div>

          {/* Palavras Chave */}
          <div>
            <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
              Palavras-Chave
            </Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => onChange('keywords', e.target.value)}
              placeholder="Ex: smartphone, 5G, câmera, bateria..."
              className="mt-1"
            />
          </div>

          {/* Informações do Produto - Obrigatório */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="productInfo" className="text-sm font-medium text-gray-700">
                Informações do Produto <span className="text-red-500">*</span>
              </Label>
              <span className={`text-sm font-medium ${getCharCountColor()}`}>
                {charCount}/{maxChars} caracteres
              </span>
            </div>
            <Textarea
              id="productInfo"
              value={formData.textInput}
              onChange={handleTextInputChange}
              placeholder="Descreva as características, benefícios e informações técnicas do seu produto. Inclua materiais, dimensões, funcionalidades e qualquer diferencial competitivo..."
              className="min-h-[300px] resize-none text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !isFormValid}
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
          Limpar Tudo
        </Button>
      </div>
    </div>
  );
};