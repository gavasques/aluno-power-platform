import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Edit, Save, X } from 'lucide-react';
import type { Supplier, SupplierInfoState, SupplierInfoActions } from '../types';

interface AddressSectionProps {
  supplier: Supplier;
  state: SupplierInfoState;
  actions: SupplierInfoActions;
}

export const AddressSection = memo<AddressSectionProps>(({
  supplier,
  state,
  actions
}) => {
  const isEditing = state.editingSection === 'address';
  const formData = state.formData;

  const hasAddress = supplier.address || supplier.city || supplier.state || supplier.zipCode || supplier.country;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => actions.startEditing('address')}>
              <Edit className="w-4 h-4 mr-2" />
              {hasAddress ? 'Editar' : 'Adicionar'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={actions.cancelEditing}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={actions.saveChanges}
                disabled={state.isSubmitting || !state.hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {state.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => actions.updateFormField('address', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => actions.updateFormField('city', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Província</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => actions.updateFormField('state', e.target.value)}
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP/Código Postal</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => actions.updateFormField('zipCode', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => actions.updateFormField('country', e.target.value)}
                placeholder="País"
              />
            </div>
          </div>
        ) : (
          <div>
            {hasAddress ? (
              <div className="space-y-2">
                {supplier.address && (
                  <p className="text-sm">{supplier.address}</p>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {supplier.city && <span>{supplier.city}</span>}
                  {supplier.state && (
                    <>
                      {supplier.city && <span>•</span>}
                      <span>{supplier.state}</span>
                    </>
                  )}
                  {supplier.zipCode && (
                    <>
                      {(supplier.city || supplier.state) && <span>•</span>}
                      <span>{supplier.zipCode}</span>
                    </>
                  )}
                </div>
                {supplier.country && (
                  <p className="text-sm text-muted-foreground">{supplier.country}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum endereço cadastrado
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});