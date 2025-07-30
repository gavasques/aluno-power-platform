import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { User } from 'lucide-react';
import { COUNTRIES, CATEGORIES, type SupplierFormData } from '../types';

interface BasicInfoFormProps {
  formData: SupplierFormData;
  onFieldChange: (field: keyof SupplierFormData, value: any) => void;
}

export const BasicInfoForm = memo<BasicInfoFormProps>(({
  formData,
  onFieldChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tradeName">Nome Comercial *</Label>
            <Input
              id="tradeName"
              value={formData.tradeName}
              onChange={(e) => onFieldChange('tradeName', e.target.value)}
              placeholder="Nome comercial do fornecedor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corporateName">Razão Social</Label>
            <Input
              id="corporateName"
              value={formData.corporateName}
              onChange={(e) => onFieldChange('corporateName', e.target.value)}
              placeholder="Razão social da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País *</Label>
            <Select value={formData.country} onValueChange={(value) => onFieldChange('country', value)}>
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
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => onFieldChange('category', value)}>
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
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder="Descrição detalhada do fornecedor e seus produtos..."
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Fornecedor Ativo</Label>
              <div className="text-sm text-muted-foreground">
                Fornecedor disponível para novos pedidos
              </div>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => onFieldChange('isActive', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Fornecedor Premium</Label>
              <div className="text-sm text-muted-foreground">
                Fornecedor com status premium (destaque)
              </div>
            </div>
            <Switch
              checked={formData.isPremium}
              onCheckedChange={(checked) => onFieldChange('isPremium', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Fornecedor Verificado</Label>
              <div className="text-sm text-muted-foreground">
                Fornecedor passou por processo de verificação
              </div>
            </div>
            <Switch
              checked={formData.isVerified}
              onCheckedChange={(checked) => onFieldChange('isVerified', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});