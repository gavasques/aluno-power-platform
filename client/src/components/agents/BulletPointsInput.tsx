import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useToast } from '@/hooks/use-toast';
import { BULLET_POINTS_CONFIG } from '@/lib/bulletPointsConfig';

interface ProductFormData {
  productName: string;
  brand: string;
  textInput: string;
  targetAudience: string;
  keywords: string;
  uniqueDifferential: string;
  materials: string;
  warranty: string;
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

  const handleFieldChange = (field: keyof ProductFormData, value: string) => {
    const limit = BULLET_POINTS_CONFIG.FIELD_LIMITS[field];
    
    if (value.length > limit) {
      toast({
        variant: "destructive",
        title: "❌ Limite excedido",
        description: `O limite para este campo é de ${limit} caracteres.`
      });
      return;
    }
    onChange(field, value);
  };

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

  const getFieldCharCount = (field: keyof ProductFormData, value: string) => {
    const limit = BULLET_POINTS_CONFIG.FIELD_LIMITS[field];
    const count = value.length;
    const isNearLimit = count >= limit * 0.8;
    const isOverLimit = count >= limit;
    
    return {
      count,
      limit,
      color: isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
    };
  };

  const getCharCountColor = () => {
    if (charCount >= maxChars) return 'text-red-600';
    if (charCount >= warningThreshold) return 'text-yellow-600';
    if (charCount < BULLET_POINTS_CONFIG.MIN_CHARS) return 'text-orange-600';
    return 'text-gray-500';
  };

  const isFormValid = formData.productName.trim() && formData.textInput.trim() && formData.textInput.trim().length >= BULLET_POINTS_CONFIG.MIN_CHARS;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 h-full flex flex-col">
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Informações do Produto
        </h2>
        
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Linha 1: Nome do Produto e Marca */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
                  Nome do Produto <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs ${getFieldCharCount('productName', formData.productName).color}`}>
                  {getFieldCharCount('productName', formData.productName).count}/{getFieldCharCount('productName', formData.productName).limit}
                </span>
              </div>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleFieldChange('productName', e.target.value)}
                placeholder="Ex: Smartphone Samsung Galaxy S24 128GB"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                  Marca
                </Label>
                <span className={`text-xs ${getFieldCharCount('brand', formData.brand).color}`}>
                  {getFieldCharCount('brand', formData.brand).count}/{getFieldCharCount('brand', formData.brand).limit}
                </span>
              </div>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleFieldChange('brand', e.target.value)}
                placeholder="Ex: Samsung, Apple, Nike..."
              />
            </div>
          </div>

          {/* Linha 2: Público Alvo e Garantia */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">
                  Público Alvo
                </Label>
                <span className={`text-xs ${getFieldCharCount('targetAudience', formData.targetAudience).color}`}>
                  {getFieldCharCount('targetAudience', formData.targetAudience).count}/{getFieldCharCount('targetAudience', formData.targetAudience).limit}
                </span>
              </div>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                placeholder="Ex: Jovens adultos, Profissionais de tecnologia..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="warranty" className="text-sm font-medium text-gray-700">
                  Garantia
                </Label>
                <span className={`text-xs ${getFieldCharCount('warranty', formData.warranty).color}`}>
                  {getFieldCharCount('warranty', formData.warranty).count}/{getFieldCharCount('warranty', formData.warranty).limit}
                </span>
              </div>
              <Input
                id="warranty"
                value={formData.warranty}
                onChange={(e) => handleFieldChange('warranty', e.target.value)}
                placeholder="Ex: 12 meses, 2 anos..."
              />
            </div>
          </div>

          {/* Linha 3: Palavras-Chave (campo maior) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                Palavras-Chave
                <span className="text-xs text-gray-500 ml-1">(separadas por vírgula)</span>
              </Label>
              <span className={`text-xs ${getFieldCharCount('keywords', formData.keywords).color}`}>
                {getFieldCharCount('keywords', formData.keywords).count}/{getFieldCharCount('keywords', formData.keywords).limit}
              </span>
            </div>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => handleFieldChange('keywords', e.target.value)}
              placeholder="Ex: smartphone, 5G, câmera, bateria, tecnologia, resistente à água, alta qualidade..."
            />
          </div>

          {/* Linha 4: Diferencial Único e Materiais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="uniqueDifferential" className="text-sm font-medium text-gray-700">
                  Diferencial Único
                </Label>
                <span className={`text-xs ${getFieldCharCount('uniqueDifferential', formData.uniqueDifferential).color}`}>
                  {getFieldCharCount('uniqueDifferential', formData.uniqueDifferential).count}/{getFieldCharCount('uniqueDifferential', formData.uniqueDifferential).limit}
                </span>
              </div>
              <Input
                id="uniqueDifferential"
                value={formData.uniqueDifferential}
                onChange={(e) => handleFieldChange('uniqueDifferential', e.target.value)}
                placeholder="Ex: Tecnologia exclusiva, Inovação única..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="materials" className="text-sm font-medium text-gray-700">
                  Materiais
                </Label>
                <span className={`text-xs ${getFieldCharCount('materials', formData.materials).color}`}>
                  {getFieldCharCount('materials', formData.materials).count}/{getFieldCharCount('materials', formData.materials).limit}
                </span>
              </div>
              <Input
                id="materials"
                value={formData.materials}
                onChange={(e) => handleFieldChange('materials', e.target.value)}
                placeholder="Ex: Alumínio, Aço inoxidável, Silicone..."
              />
            </div>
          </div>

          {/* Informações do Produto - Obrigatório */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="productInfo" className="text-sm font-medium text-gray-700">
                Informações do Produto <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(mín. 100 caracteres)</span>
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
              className="flex-1 resize-none text-sm"
            />
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !isFormValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
          >
            {isGenerating ? (
              <ButtonLoader />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Gerando...' : 'Criar Bullet Points'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClear}
            className="h-11 px-6"
          >
            Limpar Tudo
          </Button>
        </div>
      </div>
    </div>
  );
};