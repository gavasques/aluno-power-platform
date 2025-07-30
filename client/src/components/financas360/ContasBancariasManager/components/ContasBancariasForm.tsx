import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { ACCOUNT_TYPES, PIX_KEY_TYPES, type ContaBancariaForm } from '../types';

interface ContasBancariasFormProps {
  open: boolean;
  isEditing: boolean;
  formData: ContaBancariaForm;
  empresas: any[];
  isUpdating: boolean;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof ContaBancariaForm, value: any) => void;
}

export const ContasBancariasForm = memo<ContasBancariasFormProps>(({
  open,
  isEditing,
  formData,
  empresas,
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
            {isEditing ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa *</Label>
              <Select 
                value={formData.empresaId.toString()} 
                onValueChange={(value) => onFieldChange('empresaId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nomeFantasia || empresa.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Nome do Banco *</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => onFieldChange('bankName', e.target.value)}
                placeholder="Ex: Banco do Brasil, Itaú, Bradesco..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta *</Label>
              <Select 
                value={formData.accountType} 
                onValueChange={(value) => onFieldChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                value={formData.agency}
                onChange={(e) => onFieldChange('agency', e.target.value)}
                placeholder="0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Conta *</Label>
              <Input
                id="account"
                value={formData.account}
                onChange={(e) => onFieldChange('account', e.target.value)}
                placeholder="00000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountDigit">Dígito da Conta</Label>
              <Input
                id="accountDigit"
                value={formData.accountDigit}
                onChange={(e) => onFieldChange('accountDigit', e.target.value)}
                placeholder="0"
                maxLength={2}
              />
            </div>
          </div>

          {/* PIX Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Informações PIX</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
                <Select 
                  value={formData.pixKeyType} 
                  onValueChange={(value) => onFieldChange('pixKeyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PIX_KEY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  value={formData.pixKey}
                  onChange={(e) => onFieldChange('pixKey', e.target.value)}
                  placeholder="Digite a chave PIX..."
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Informações Financeiras</h4>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Saldo Inicial (R$)</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => onFieldChange('initialBalance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => onFieldChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre a conta..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Conta Ativa</Label>
              <div className="text-sm text-muted-foreground">
                Conta disponível para operações
              </div>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => onFieldChange('isActive', checked)}
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