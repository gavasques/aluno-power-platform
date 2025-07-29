/**
 * COMPONENTE: BasicInfoStep
 * Etapa de informações básicas do produto
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { Package, Building2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BasicInfoStepProps } from '../../../types';

export const BasicInfoStep = ({
  formData,
  errors,
  onChange,
  onValidate
}: BasicInfoStepProps) => {

  const handleTagAdd = (tagInput: string) => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      onChange('tags', [...formData.tags, tagInput.trim()]);
    }
  };

  const handleTagRemove = (index: number) => {
    if (formData.tags) {
      const newTags = formData.tags.filter((_, i) => i !== index);
      onChange('tags', newTags);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Product Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Identificação do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              onBlur={() => onValidate('name')}
              placeholder="Ex: Smartphone Samsung Galaxy A54"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Código do Produto) *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
              onBlur={() => onValidate('sku')}
              placeholder="Ex: SG-A54-128GB-BLK"
              className={errors.sku ? 'border-red-500' : ''}
            />
            {errors.sku && (
              <p className="text-sm text-red-600">{errors.sku}</p>
            )}
            <p className="text-xs text-gray-500">
              Código único para identificar o produto (apenas letras, números, hífens e sublinhados)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Eletrônicos</SelectItem>
                <SelectItem value="clothing">Roupas e Acessórios</SelectItem>
                <SelectItem value="home">Casa e Jardim</SelectItem>
                <SelectItem value="sports">Esportes e Lazer</SelectItem>
                <SelectItem value="books">Livros e Mídia</SelectItem>
                <SelectItem value="beauty">Beleza e Cuidados</SelectItem>
                <SelectItem value="automotive">Automotivo</SelectItem>
                <SelectItem value="tools">Ferramentas</SelectItem>
                <SelectItem value="toys">Brinquedos</SelectItem>
                <SelectItem value="food">Alimentos e Bebidas</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="Ex: Samsung, Apple, Nike..."
              className={errors.brand ? 'border-red-500' : ''}
            />
            {errors.brand && (
              <p className="text-sm text-red-600">{errors.brand}</p>
            )}
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select
              value={formData.supplier}
              onValueChange={(value) => onChange('supplier', value)}
            >
              <SelectTrigger className={errors.supplier ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier1">Fornecedor 1 - China Electronics</SelectItem>
                <SelectItem value="supplier2">Fornecedor 2 - Global Tech</SelectItem>
                <SelectItem value="supplier3">Fornecedor 3 - Asia Import</SelectItem>
                <SelectItem value="supplier4">Fornecedor 4 - Euro Wholesale</SelectItem>
              </SelectContent>
            </Select>
            {errors.supplier && (
              <p className="text-sm text-red-600">{errors.supplier}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags e Palavras-chave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Tag Input */}
          <div className="space-y-2">
            <Label htmlFor="tag-input">Adicionar Tag</Label>
            <div className="flex gap-2">
              <Input
                id="tag-input"
                placeholder="Ex: smartphone, android, 5g..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Pressione Enter para adicionar uma tag
            </p>
          </div>

          {/* Tags Display */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags Adicionadas</Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleTagRemove(index)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {errors.tags && (
            <p className="text-sm text-red-600">{errors.tags}</p>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'active' | 'inactive') => onChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Produtos em rascunho não aparecem na loja
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};