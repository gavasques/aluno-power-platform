import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Building2, MapPin, Globe } from 'lucide-react';
import type { SupplierInfo } from '../types';

interface BasicInfoSectionProps {
  supplier: SupplierInfo;
  isEditing: boolean;
  formData: any;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveChanges: () => void;
  onFieldChange: (field: string, value: any) => void;
  isUpdating: boolean;
}

const COUNTRIES = [
  'China', 'Estados Unidos', 'Alemanha', 'Japão', 'Reino Unido',
  'França', 'Itália', 'Coreia do Sul', 'Canadá', 'Índia',
  'Brasil', 'México', 'Outros'
];

const CATEGORIES = [
  'Eletrônicos', 'Casa e Jardim', 'Moda e Acessórios',
  'Esportes e Lazer', 'Saúde e Beleza', 'Automotivo',
  'Brinquedos', 'Livros e Mídia', 'Instrumentos Musicais',
  'Escritório e Negócios', 'Outros'
];

export const BasicInfoSection = memo<BasicInfoSectionProps>(({
  supplier,
  isEditing,
  formData,
  onStartEditing,
  onCancelEditing,
  onSaveChanges,
  onFieldChange,
  isUpdating
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informações Básicas
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onStartEditing}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancelEditing} disabled={isUpdating}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={onSaveChanges} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nome Comercial *</Label>
                <Input
                  id="tradeName"
                  value={formData.tradeName || ''}
                  onChange={(e) => onFieldChange('tradeName', e.target.value)}
                  placeholder="Nome comercial"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="corporateName">Razão Social</Label>
                <Input
                  id="corporateName"
                  value={formData.corporateName || ''}
                  onChange={(e) => onFieldChange('corporateName', e.target.value)}
                  placeholder="Razão social"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select value={formData.country || ''} onValueChange={(value) => onFieldChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category || ''} onValueChange={(value) => onFieldChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Descrição do fornecedor..."
                rows={4}
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Nome Comercial</h4>
                <p className="text-lg font-semibold">{supplier.tradeName}</p>
              </div>
              
              {supplier.corporateName && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Razão Social</h4>
                  <p className="text-lg">{supplier.corporateName}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">País</h4>
                  <p>{supplier.country || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Categoria</h4>
                  <p>{supplier.category || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {supplier.description && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Descrição</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{supplier.description}</p>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex gap-2">
              {supplier.isActive && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Ativo
                </Badge>
              )}
              {supplier.isPremium && (
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  Premium
                </Badge>
              )}
              {supplier.isVerified && (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});