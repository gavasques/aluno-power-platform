import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProductData } from '@/pages/agents/amazon-listings-optimizer';

interface ProductFormProps {
  data: ProductData;
  onChange: (data: ProductData) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ProductData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const getKeywordCount = (keywords: string) => {
    return keywords.split(',').filter(k => k.trim()).length;
  };

  const getFeatureCount = (features: string) => {
    return features.split(',').filter(f => f.trim()).length;
  };

  const getLongTailCount = (longTail: string) => {
    return longTail.split(',').filter(lt => lt.trim()).length;
  };

  return (
    <div className="space-y-6">
      {/* Nome do Produto */}
      <div className="space-y-2">
        <Label htmlFor="productName">
          Nome do Produto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="productName"
          value={data.productName}
          onChange={(e) => handleChange('productName', e.target.value)}
          placeholder="Ex: Capa de Berço Descartável 300 Unidades"
          className={data.productName.length > 0 && data.productName.length < 5 ? 'border-red-300' : ''}
        />
        {data.productName.length > 0 && data.productName.length < 5 && (
          <p className="text-sm text-red-600">
            Nome do produto é obrigatório (mín. 5 caracteres)
          </p>
        )}
      </div>

      {/* Palavras-chave Principais */}
      <div className="space-y-2">
        <Label htmlFor="mainKeywords">
          Palavras-chave Principais <span className="text-red-500">*</span>
        </Label>
        <Input
          id="mainKeywords"
          value={data.mainKeywords}
          onChange={(e) => handleChange('mainKeywords', e.target.value)}
          placeholder="Ex: capa berço, descartável, bebê, proteção, higiênico"
          className={data.mainKeywords.length > 0 && getKeywordCount(data.mainKeywords) < 3 ? 'border-red-300' : ''}
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Insira até 10 palavras-chave separadas por vírgula (ordem de importância)
          </span>
          <span className={`${getKeywordCount(data.mainKeywords) > 10 ? 'text-red-600' : 'text-gray-500'}`}>
            {getKeywordCount(data.mainKeywords)}/10 palavras-chave
          </span>
        </div>
        {data.mainKeywords.length > 0 && getKeywordCount(data.mainKeywords) < 3 && (
          <p className="text-sm text-red-600">
            Insira pelo menos 3 palavras-chave
          </p>
        )}
      </div>

      {/* Palavras Long Tail */}
      <div className="space-y-2">
        <Label htmlFor="longTailKeywords">
          Palavras Long Tail (Opcional)
        </Label>
        <Input
          id="longTailKeywords"
          value={data.longTailKeywords}
          onChange={(e) => handleChange('longTailKeywords', e.target.value)}
          placeholder="Ex: capa descartável para berço de bebê, proteção higiênica berço"
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Frases mais específicas com oportunidade (até 5, separadas por vírgula)
          </span>
          <span className={`${getLongTailCount(data.longTailKeywords) > 5 ? 'text-red-600' : 'text-gray-500'}`}>
            {getLongTailCount(data.longTailKeywords)}/5 long tail
          </span>
        </div>
      </div>

      {/* Características Destacadas */}
      <div className="space-y-2">
        <Label htmlFor="features">
          Características Destacadas <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="features"
          value={data.features}
          onChange={(e) => handleChange('features', e.target.value)}
          placeholder="Ex: Material hipoalergênico, Descartável, 300 unidades, Fácil aplicação, Proteção completa, Tamanho universal, Resistente, Econômico"
          rows={3}
          className={data.features.length > 0 && getFeatureCount(data.features) < 3 ? 'border-red-300' : ''}
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Características importantes do produto (até 8, separadas por vírgula)
          </span>
          <span className={`${getFeatureCount(data.features) > 8 ? 'text-red-600' : 'text-gray-500'}`}>
            {getFeatureCount(data.features)}/8 características
          </span>
        </div>
        {data.features.length > 0 && getFeatureCount(data.features) < 3 && (
          <p className="text-sm text-red-600">
            Insira pelo menos 3 características
          </p>
        )}
      </div>

      {/* Mais Informações */}
      <div className="space-y-2">
        <Label htmlFor="additionalInfo">
          Mais Informações (Opcional)
        </Label>
        <Textarea
          id="additionalInfo"
          value={data.additionalInfo}
          onChange={(e) => handleChange('additionalInfo', e.target.value)}
          placeholder="Informações adicionais que considera úteis: materiais específicos, dimensões, certificações, diferenciais, etc."
          rows={4}
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500">
          {data.additionalInfo.length}/500
        </div>
      </div>
    </div>
  );
};