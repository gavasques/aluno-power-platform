import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X, DollarSign, Clock, Package } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import type { SupplierFormData } from '../types';

interface SupplierFormProps {
  open: boolean;
  isEditing: boolean;
  formData: SupplierFormData;
  availableSuppliers: any[];
  isUpdating: boolean;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof SupplierFormData, value: any) => void;
}

export const SupplierForm = memo<SupplierFormProps>(({
  open,
  isEditing,
  formData,
  availableSuppliers,
  isUpdating,
  onSave,
  onCancel,
  onFieldChange
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label htmlFor="supplierId">Fornecedor *</Label>
            <Select 
              value={formData.supplierId.toString()} 
              onValueChange={(value) => onFieldChange('supplierId', parseInt(value))}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {availableSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{supplier.name}</span>
                      {supplier.company && (
                        <span className="text-sm text-muted-foreground">{supplier.company}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main Supplier Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Fornecedor Principal</Label>
              <div className="text-sm text-muted-foreground">
                Este é o fornecedor principal para este produto
              </div>
            </div>
            <Switch
              checked={formData.isMainSupplier}
              onCheckedChange={(checked) => onFieldChange('isMainSupplier', checked)}
            />
          </div>

          {/* Commercial Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Informações Comerciais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo (USD)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => onFieldChange('costPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Pedido Mínimo (unidades)</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  value={formData.minimumOrder}
                  onChange={(e) => onFieldChange('minimumOrder', parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Logistics Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Informações Logísticas
            </h4>
            <div className="space-y-2">
              <Label htmlFor="leadTime">Tempo de Entrega (dias)</Label>
              <Input
                id="leadTime"
                type="number"
                value={formData.leadTime}
                onChange={(e) => onFieldChange('leadTime', parseInt(e.target.value) || 7)}
                placeholder="7"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              placeholder="Observações sobre este fornecedor..."
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
                  {isEditing ? 'Atualizar' : 'Adicionar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});