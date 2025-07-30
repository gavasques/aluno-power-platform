/**
 * PRESENTATION: SupplierInfoPresentation
 * Pure UI component for supplier information display
 * Extracted from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Star, MapPin, Globe2 } from 'lucide-react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { EditableSection } from './components/EditableSection';
import type { SupplierInfoPresentationProps } from './types';

export const SupplierInfoPresentation = memo<SupplierInfoPresentationProps>(({
  supplier,
  departments,
  editState,
  formData,
  actions,
  isUpdating
}) => {
  const formatRating = (rating: string | null) => {
    if (!rating || rating === '0.00') return 'Sem avaliação';
    return `${parseFloat(rating).toFixed(1)} ⭐`;
  };

  const getLocationDisplay = () => {
    const parts = [supplier.city, supplier.state, supplier.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Localização não informada';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{supplier.tradeName || supplier.corporateName}</CardTitle>
                {supplier.tradeName && supplier.corporateName && supplier.tradeName !== supplier.corporateName && (
                  <p className="text-sm text-muted-foreground">{supplier.corporateName}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {supplier.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {supplier.supplierType?.charAt(0).toUpperCase() + supplier.supplierType?.slice(1) || 'Tipo não definido'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                {formatRating(supplier.averageRating)}
              </div>
              {supplier.totalReviews > 0 && (
                <p className="text-xs text-muted-foreground">
                  {supplier.totalReviews} avaliação{supplier.totalReviews !== 1 ? 'ões' : ''}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {getLocationDisplay()}
            </div>
            {supplier.cnpj && (
              <div className="flex items-center gap-1">
                <Globe2 className="w-4 h-4" />
                CNPJ: {supplier.cnpj}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6">
          <BasicInfoSection
            supplier={supplier}
            departments={departments}
            isEditing={editState.editingBasic}
            formData={formData.basic}
            onEdit={() => actions.setEditingSection('editingBasic', true)}
            onSave={() => actions.saveSection('basic')}
            onCancel={() => actions.setEditingSection('editingBasic', false)}
            onFormChange={(data) => actions.updateFormData('basic', data)}
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <EditableSection
            title="Descrição"
            value={formData.description.description}
            isEditing={editState.editingDescription}
            onEdit={() => actions.setEditingSection('editingDescription', true)}
            onSave={() => actions.saveSection('description')}
            onCancel={() => actions.setEditingSection('editingDescription', false)}
            onChange={(value) => actions.updateFormData('description', { description: value })}
            placeholder="Descreva o fornecedor, produtos oferecidos, especialidades..."
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardContent className="pt-6">
          <EditableSection
            title="Informações Adicionais"
            value={formData.additionalInfo.additionalInfo}
            isEditing={editState.editingAdditionalInfo}
            onEdit={() => actions.setEditingSection('editingAdditionalInfo', true)}
            onSave={() => actions.saveSection('additionalInfo')}
            onCancel={() => actions.setEditingSection('editingAdditionalInfo', false)}
            onChange={(value) => actions.updateFormData('additionalInfo', { additionalInfo: value })}
            placeholder="Informações gerais, observações, contatos adicionais..."
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>

      {/* Commercial Terms */}
      <Card>
        <CardContent className="pt-6">
          <EditableSection
            title="Condições Comerciais"
            value={formData.commercialTerms.paymentTerm + (formData.commercialTerms.deliveryTerm ? '\n\nPrazo de Entrega:\n' + formData.commercialTerms.deliveryTerm : '')}
            isEditing={editState.editingCommercialTerms}
            onEdit={() => actions.setEditingSection('editingCommercialTerms', true)}
            onSave={() => actions.saveSection('commercialTerms')}
            onCancel={() => actions.setEditingSection('editingCommercialTerms', false)}
            onChange={(value) => {
              const [payment, ...delivery] = value.split('\n\nPrazo de Entrega:\n');
              actions.updateFormData('commercialTerms', { 
                paymentTerm: payment, 
                deliveryTerm: delivery.join('\n\nPrazo de Entrega:\n') 
              });
            }}
            placeholder="Condições de pagamento, prazo de entrega, política de desconto..."
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>

      {/* Banking Data */}
      <Card>
        <CardContent className="pt-6">
          <EditableSection
            title="Dados Bancários"
            value={formData.bankingData.bankingData}
            isEditing={editState.editingBankingData}
            onEdit={() => actions.setEditingSection('editingBankingData', true)}
            onSave={() => actions.saveSection('bankingData')}
            onCancel={() => actions.setEditingSection('editingBankingData', false)}
            onChange={(value) => actions.updateFormData('bankingData', { bankingData: value })}
            placeholder="Dados bancários para transferências, PIX, informações financeiras..."
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
});