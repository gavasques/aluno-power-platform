import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Handshake, Edit, Save, X, Clock, Package, DollarSign, Calendar } from 'lucide-react';
import type { Supplier, SupplierInfoState, SupplierInfoActions } from '../types';

interface CommercialSectionProps {
  supplier: Supplier;
  state: SupplierInfoState;
  actions: SupplierInfoActions;
}

export const CommercialSection = memo<CommercialSectionProps>(({
  supplier,
  state,
  actions
}) => {
  const isEditing = state.editingSection === 'commercial';
  const formData = state.formData;

  const hasCommercialInfo = supplier.commercialTerms || supplier.paymentTerms || 
                            supplier.deliveryTerms || supplier.minimumOrder || supplier.leadTime;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Termos Comerciais
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => actions.startEditing('commercial')}>
              <Edit className="w-4 h-4 mr-2" />
              {hasCommercialInfo ? 'Editar' : 'Adicionar'}
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
              <Label htmlFor="commercialTerms">Termos Comerciais</Label>
              <Textarea
                id="commercialTerms"
                value={formData.commercialTerms || ''}
                onChange={(e) => actions.updateFormField('commercialTerms', e.target.value)}
                placeholder="Descrição dos termos comerciais gerais"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => actions.updateFormField('paymentTerms', e.target.value)}
                  placeholder="Ex: 30 dias, à vista, parcelado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTerms">Condições de Entrega</Label>
                <Input
                  id="deliveryTerms"
                  value={formData.deliveryTerms || ''}
                  onChange={(e) => actions.updateFormField('deliveryTerms', e.target.value)}
                  placeholder="Ex: FOB, CIF, DDP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Pedido Mínimo (R$)</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  value={formData.minimumOrder || ''}
                  onChange={(e) => actions.updateFormField('minimumOrder', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTime">Prazo de Entrega (dias)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.leadTime || ''}
                  onChange={(e) => actions.updateFormField('leadTime', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {hasCommercialInfo ? (
              <div className="space-y-4">
                {supplier.commercialTerms && (
                  <div>
                    <h4 className="font-medium mb-2">Termos Comerciais</h4>
                    <p className="text-sm text-muted-foreground">{supplier.commercialTerms}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.paymentTerms && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Pagamento</p>
                        <p className="text-xs text-muted-foreground">{supplier.paymentTerms}</p>
                      </div>
                    </div>
                  )}
                  
                  {supplier.deliveryTerms && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Entrega</p>
                        <p className="text-xs text-muted-foreground">{supplier.deliveryTerms}</p>
                      </div>
                    </div>
                  )}
                  
                  {supplier.minimumOrder && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Pedido Mínimo</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {supplier.minimumOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {supplier.leadTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Prazo de Entrega</p>
                        <p className="text-xs text-muted-foreground">
                          {supplier.leadTime} {supplier.leadTime === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma informação comercial cadastrada
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});