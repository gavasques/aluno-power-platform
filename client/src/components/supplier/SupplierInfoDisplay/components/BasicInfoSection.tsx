import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Edit, Save, X, Mail, Phone, Globe, User } from 'lucide-react';
import type { Supplier, SupplierInfoState, SupplierInfoActions } from '../types';

interface BasicInfoSectionProps {
  supplier: Supplier;
  state: SupplierInfoState;
  actions: SupplierInfoActions;
}

export const BasicInfoSection = memo<BasicInfoSectionProps>(({
  supplier,
  state,
  actions
}) => {
  const isEditing = state.editingSection === 'basic';
  const formData = state.formData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => actions.startEditing('basic')}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
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
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => actions.updateFormField('name', e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Razão Social</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) => actions.updateFormField('companyName', e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => actions.updateFormField('email', e.target.value)}
                placeholder="email@fornecedor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => actions.updateFormField('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => actions.updateFormField('website', e.target.value)}
                placeholder="https://www.fornecedor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Pessoa de Contato</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => actions.updateFormField('contactPerson', e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Name and Company */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                {supplier.companyName && (
                  <p className="text-muted-foreground">{supplier.companyName}</p>
                )}
              </div>
              <Badge variant={supplier.isActive ? "default" : "secondary"}>
                {supplier.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
              {supplier.contactPerson && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.contactPerson}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});