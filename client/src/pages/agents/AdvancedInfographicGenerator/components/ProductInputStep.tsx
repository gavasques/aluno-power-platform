import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import type { InfographicState } from '../types';

interface ProductInputStepProps {
  state: InfographicState;
  departments: any[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFormSubmit: () => void;
  onFormFieldChange: (field: keyof InfographicState['formData'], value: string) => void;
}

export const ProductInputStep = memo<ProductInputStepProps>(({
  state,
  departments,
  onImageUpload,
  onFormSubmit,
  onFormFieldChange
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de Infográficos Avançado</h1>
        <p className="text-muted-foreground">
          Crie infográficos profissionais para seus produtos com IA
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Produto</CardTitle>
          <CardDescription>
            Forneça as informações básicas do produto para análise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Nome do Produto *</Label>
            <Input
              id="productName"
              value={state.formData.productName}
              onChange={(e) => onFormFieldChange('productName', e.target.value)}
              placeholder="Ex: Fone de Ouvido Bluetooth Premium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={state.formData.description}
              onChange={(e) => onFormFieldChange('description', e.target.value)}
              placeholder="Descreva as principais características e benefícios do produto..."
              rows={4}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={state.formData.category} onValueChange={(value) => onFormFieldChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-Alvo *</Label>
            <Input
              id="targetAudience"
              value={state.formData.targetAudience}
              onChange={(e) => onFormFieldChange('targetAudience', e.target.value)}
              placeholder="Ex: Jovens de 18-35 anos, profissionais liberais..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem do Produto</CardTitle>
          <CardDescription>
            Faça upload de uma imagem clara do produto (máx. 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {state.imagePreview ? (
                  <img
                    src={state.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG ou JPEG (máx. 10MB)</p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageUpload}
                />
              </Label>
            </div>

            {state.uploadedImage && (
              <p className="text-sm text-green-600 text-center">
                ✓ Imagem carregada: {state.uploadedImage.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={onFormSubmit}
          disabled={state.loading}
          className="w-full max-w-md"
          size="lg"
        >
          {state.loading ? (
            <ButtonLoader>Analisando produto...</ButtonLoader>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Analisar Produto e Gerar Conceitos
            </>
          )}
        </Button>
      </div>
    </div>
  );
});