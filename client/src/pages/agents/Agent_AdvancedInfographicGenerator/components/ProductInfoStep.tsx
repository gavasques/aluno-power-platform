import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, X, ArrowRight } from 'lucide-react';
import { CATEGORIES, type ProductInfo } from '../types';

interface ProductInfoStepProps {
  productInfo: ProductInfo;
  onUpdateField: (field: keyof ProductInfo, value: any) => void;
  onNextStep: () => void;
}

export const ProductInfoStep = memo<ProductInfoStepProps>(({
  productInfo,
  onUpdateField,
  onNextStep
}) => {
  const [newFeature, setNewFeature] = React.useState('');
  const [newBenefit, setNewBenefit] = React.useState('');

  const addFeature = () => {
    if (newFeature.trim() && !productInfo.keyFeatures.includes(newFeature.trim())) {
      onUpdateField('keyFeatures', [...productInfo.keyFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    onUpdateField('keyFeatures', productInfo.keyFeatures.filter(feature => feature !== featureToRemove));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !productInfo.benefits.includes(newBenefit.trim())) {
      onUpdateField('benefits', [...productInfo.benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    onUpdateField('benefits', productInfo.benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const isFormValid = () => {
    return productInfo.productName && 
           productInfo.category && 
           productInfo.description && 
           productInfo.targetAudience;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Informações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Nome do Produto *</Label>
            <Input
              id="productName"
              value={productInfo.productName}
              onChange={(e) => onUpdateField('productName', e.target.value)}
              placeholder="Ex: Smartphone XYZ Pro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={productInfo.category} onValueChange={(value) => onUpdateField('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              value={productInfo.price}
              onChange={(e) => onUpdateField('price', e.target.value)}
              placeholder="Ex: R$ 999,99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-Alvo *</Label>
            <Input
              id="targetAudience"
              value={productInfo.targetAudience}
              onChange={(e) => onUpdateField('targetAudience', e.target.value)}
              placeholder="Ex: Jovens profissionais, 25-35 anos"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição do Produto *</Label>
          <Textarea
            id="description"
            value={productInfo.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            placeholder="Descreva o produto, suas principais características e diferenciais..."
            rows={4}
          />
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <Label htmlFor="keyFeatures">Características Principais</Label>
          <div className="flex gap-2">
            <Input
              id="keyFeatures"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addFeature)}
              placeholder="Digite uma característica e pressione Enter"
              className="flex-1"
            />
            <Button type="button" onClick={addFeature} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {productInfo.keyFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {productInfo.keyFeatures.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeFeature(feature)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <Label htmlFor="benefits">Benefícios</Label>
          <div className="flex gap-2">
            <Input
              id="benefits"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addBenefit)}
              placeholder="Digite um benefício e pressione Enter"
              className="flex-1"
            />
            <Button type="button" onClick={addBenefit} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {productInfo.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {productInfo.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {benefit}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeBenefit(benefit)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onNextStep} disabled={!isFormValid()}>
            Próximo: Conceito Visual
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});