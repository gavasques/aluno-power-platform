import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Image, Palette, Layout } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { CATEGORIES, LAYOUTS, STYLES, type InfographicFormData } from '../types';

interface InfographicFormProps {
  formData: InfographicFormData;
  loading: boolean;
  onFieldChange: (field: keyof InfographicFormData, value: string) => void;
  onGenerate: () => void;
}

export const InfographicForm = memo<InfographicFormProps>(({
  formData,
  loading,
  onFieldChange,
  onGenerate
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de Infográficos</h1>
        <p className="text-muted-foreground">
          Crie infográficos profissionais para seus produtos
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Informações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => onFieldChange('productName', e.target.value)}
                placeholder="Ex: Smartphone XYZ Pro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => onFieldChange('category', value)}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-alvo *</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => onFieldChange('targetAudience', e.target.value)}
              placeholder="Ex: Profissionais jovens de 25-35 anos"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Características Principais *</Label>
              <Textarea
                id="keyFeatures"
                value={formData.keyFeatures}
                onChange={(e) => onFieldChange('keyFeatures', e.target.value)}
                placeholder="Uma característica por linha&#10;Ex:&#10;Tela OLED 6.7 polegadas&#10;Bateria 5000mAh&#10;Câmera 108MP"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefícios *</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => onFieldChange('benefits', e.target.value)}
                placeholder="Um benefício por linha&#10;Ex:&#10;Maior produtividade&#10;Fotos profissionais&#10;Bateria que dura o dia todo"
                rows={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Configuração Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => onFieldChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => onFieldChange('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => onFieldChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => onFieldChange('secondaryColor', e.target.value)}
                  placeholder="#1E40AF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => onFieldChange('accentColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => onFieldChange('accentColor', e.target.value)}
                  placeholder="#F59E0B"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout and Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Layout e Estilo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={formData.layout} onValueChange={(value) => onFieldChange('layout', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUTS.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value}>
                      <div>
                        <div className="font-medium">{layout.label}</div>
                        <div className="text-sm text-muted-foreground">{layout.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select value={formData.style} onValueChange={(value) => onFieldChange('style', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={loading}
          size="lg"
          className="w-full max-w-md"
        >
          {loading ? (
            <ButtonLoader>Gerando infográfico...</ButtonLoader>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Gerar Infográfico
            </>
          )}
        </Button>
      </div>
    </div>
  );
});