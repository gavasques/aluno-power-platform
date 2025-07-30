import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Calculator } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { PACKAGE_STATUSES, type PackageFormData } from '../types';

interface PackageFormProps {
  open: boolean;
  isEditing: boolean;
  formData: PackageFormData;
  isUpdating: boolean;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof PackageFormData, value: any) => void;
}

export const PackageForm = memo<PackageFormProps>(({
  open,
  isEditing,
  formData,
  isUpdating,
  onSave,
  onCancel,
  onFieldChange
}) => {
  const totalCost = formData.totalValue + formData.shippingCost + formData.customsCost + formData.otherCosts;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Pacote' : 'Novo Pacote'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pacote *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                placeholder="Ex: Eletrônicos Dezembro 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => onFieldChange('supplier', e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Descrição detalhada do pacote..."
                rows={3}
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Informações Financeiras
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor dos Produtos (USD)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  value={formData.totalValue}
                  onChange={(e) => onFieldChange('totalValue', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalWeight">Peso Total (kg)</Label>
                <Input
                  id="totalWeight"
                  type="number"
                  step="0.01"
                  value={formData.totalWeight}
                  onChange={(e) => onFieldChange('totalWeight', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCost">Custo de Envio (USD)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={(e) => onFieldChange('shippingCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customsCost">Taxa Alfandegária (USD)</Label>
                <Input
                  id="customsCost"
                  type="number"
                  step="0.01"
                  value={formData.customsCost}
                  onChange={(e) => onFieldChange('customsCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherCosts">Outros Custos (USD)</Label>
                <Input
                  id="otherCosts"
                  type="number"
                  step="0.01"
                  value={formData.otherCosts}
                  onChange={(e) => onFieldChange('otherCosts', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Custo Total (USD)</Label>
                <div className="text-lg font-semibold text-green-600 p-2 bg-green-50 rounded">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Informações de Envio</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => onFieldChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                <Input
                  id="trackingCode"
                  value={formData.trackingCode}
                  onChange={(e) => onFieldChange('trackingCode', e.target.value)}
                  placeholder="Ex: BR123456789US"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Data do Pedido</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => onFieldChange('orderDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Entrega Prevista</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => onFieldChange('expectedDelivery', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              placeholder="Observações adicionais sobre o pacote..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={isUpdating}>
              {isUpdating ? (
                <ButtonLoader>Salvando...</ButtonLoader>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});