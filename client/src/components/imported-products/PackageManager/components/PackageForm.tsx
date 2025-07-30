import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Calculator } from 'lucide-react';
import { PACKAGE_TYPES, PACKAGING_MATERIALS, SPECIAL_HANDLING, type ProductPackage } from '../types';

interface PackageFormProps {
  formData: Partial<ProductPackage>;
  onUpdateField: (field: keyof ProductPackage, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  loading: boolean;
}

export const PackageForm = memo<PackageFormProps>(({
  formData,
  onUpdateField,
  onSave,
  onCancel,
  isEditing,
  loading
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {isEditing ? 'Editar Embalagem' : 'Nova Embalagem'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Package Number */}
          <div className="space-y-2">
            <Label htmlFor="packageNumber">Número da Embalagem</Label>
            <Input
              id="packageNumber"
              type="number"
              value={formData.packageNumber || ''}
              onChange={(e) => onUpdateField('packageNumber', parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          {/* Package Type */}
          <div className="space-y-2">
            <Label htmlFor="packageType">Tipo de Embalagem</Label>
            <Select
              value={formData.packageType || ''}
              onValueChange={(value) => onUpdateField('packageType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* EAN */}
          <div className="space-y-2">
            <Label htmlFor="packageEan">EAN da Embalagem</Label>
            <Input
              id="packageEan"
              value={formData.packageEan || ''}
              onChange={(e) => onUpdateField('packageEan', e.target.value)}
              placeholder="Código EAN"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <Label>Dimensões (cm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="length" className="text-sm">Comprimento</Label>
              <Input
                id="length"
                type="number"
                value={formData.dimensionsLength || ''}
                onChange={(e) => onUpdateField('dimensionsLength', parseFloat(e.target.value) || 0)}
                placeholder="cm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="width" className="text-sm">Largura</Label>
              <Input
                id="width"
                type="number"
                value={formData.dimensionsWidth || ''}
                onChange={(e) => onUpdateField('dimensionsWidth', parseFloat(e.target.value) || 0)}
                placeholder="cm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-sm">Altura</Label>
              <Input
                id="height"
                type="number"
                value={formData.dimensionsHeight || ''}
                onChange={(e) => onUpdateField('dimensionsHeight', parseFloat(e.target.value) || 0)}
                placeholder="cm"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          {formData.volumeCbm && (
            <p className="text-sm text-muted-foreground">
              Volume: {formData.volumeCbm.toFixed(4)} m³
            </p>
          )}
        </div>

        {/* Weights and Units */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weightGross">Peso Bruto (kg)</Label>
            <Input
              id="weightGross"
              type="number"
              value={formData.weightGross || ''}
              onChange={(e) => onUpdateField('weightGross', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weightNet">Peso Líquido (kg)</Label>
            <Input
              id="weightNet"
              type="number"
              value={formData.weightNet || ''}
              onChange={(e) => onUpdateField('weightNet', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitsInPackage">Unidades na Embalagem</Label>
            <Input
              id="unitsInPackage"
              type="number"
              value={formData.unitsInPackage || ''}
              onChange={(e) => onUpdateField('unitsInPackage', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
        </div>

        {/* Material and Handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="packagingMaterial">Material da Embalagem</Label>
            <Select
              value={formData.packagingMaterial || ''}
              onValueChange={(value) => onUpdateField('packagingMaterial', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o material" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGING_MATERIALS.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialHandling">Manuseio Especial</Label>
            <Select
              value={formData.specialHandling || ''}
              onValueChange={(value) => onUpdateField('specialHandling', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {SPECIAL_HANDLING.map((handling) => (
                  <SelectItem key={handling} value={handling}>
                    {handling}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contents Description */}
        <div className="space-y-2">
          <Label htmlFor="contentsDescription">Descrição do Conteúdo</Label>
          <Textarea
            id="contentsDescription"
            value={formData.contentsDescription || ''}
            onChange={(e) => onUpdateField('contentsDescription', e.target.value)}
            placeholder="Descreva o conteúdo da embalagem..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});