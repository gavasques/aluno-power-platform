/**
 * Channel Form Component
 * Comprehensive form for channel cost configuration
 * Following interface segregation and single responsibility
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SalesChannel, ChannelCostData } from '@/shared/types/channels';
import { ChannelMetadata } from '@/shared/constants/channels';

interface ChannelFormProps {
  channel: SalesChannel;
  metadata: ChannelMetadata;
  onUpdateData: (data: Partial<ChannelCostData>) => void;
}

export const ChannelForm: React.FC<ChannelFormProps> = ({
  channel,
  metadata,
  onUpdateData,
}) => {
  const { data } = channel;

  const handleInputChange = (field: keyof ChannelCostData, value: string) => {
    const numericValue = parseFloat(value) || 0;
    onUpdateData({ [field]: numericValue });
  };

  const handleProductCodeChange = (field: string, value: string) => {
    onUpdateData({
      productCodes: {
        ...data.productCodes,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Codes Section */}
      {metadata.productCodeFields.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Códigos do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metadata.productCodeFields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`${channel.type}-${field}`} className="text-sm font-medium">
                    {getProductCodeLabel(field)}
                  </Label>
                  <Input
                    id={`${channel.type}-${field}`}
                    type="text"
                    value={data.productCodes?.[field] || ''}
                    onChange={(e) => handleProductCodeChange(field, e.target.value)}
                    placeholder={`Digite o ${getProductCodeLabel(field).toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Precificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-price`} className="text-sm font-medium">
                Preço de Venda *
              </Label>
              <Input
                id={`${channel.type}-price`}
                type="number"
                step="0.01"
                min="0"
                value={data.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Rebate */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-rebate`} className="text-sm font-medium">
                Rebate (Receita)
              </Label>
              <Input
                id={`${channel.type}-rebate`}
                type="number"
                step="0.01"
                min="0"
                value={data.rebateValue || ''}
                onChange={(e) => handleInputChange('rebateValue', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estrutura de Comissão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Commission */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-commission`} className="text-sm font-medium">
                Comissão (%)
              </Label>
              <Input
                id={`${channel.type}-commission`}
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={data.commissionPercent || ''}
                onChange={(e) => handleInputChange('commissionPercent', e.target.value)}
                placeholder="0,0"
              />
            </div>

            {/* Commission Up To Value */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-commission-up-to`} className="text-sm font-medium">
                Até o valor (R$)
              </Label>
              <Input
                id={`${channel.type}-commission-up-to`}
                type="number"
                step="0.01"
                min="0"
                value={data.commissionUpToValue || ''}
                onChange={(e) => handleInputChange('commissionUpToValue', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Commission Above Value */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-commission-above`} className="text-sm font-medium">
                Acima do valor (%)
              </Label>
              <Input
                id={`${channel.type}-commission-above`}
                type="number"
                step="0.1"
                min="0"
                value={data.commissionAboveValue || ''}
                onChange={(e) => handleInputChange('commissionAboveValue', e.target.value)}
                placeholder="0,0"
              />
            </div>

            {/* Commission Min Value */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-commission-min`} className="text-sm font-medium">
                Comissão mínima (R$)
              </Label>
              <Input
                id={`${channel.type}-commission-min`}
                type="number"
                step="0.01"
                min="0"
                value={data.commissionMinValue || ''}
                onChange={(e) => handleInputChange('commissionMinValue', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Commission Max Value */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-commission-max`} className="text-sm font-medium">
                Comissão máxima (R$)
              </Label>
              <Input
                id={`${channel.type}-commission-max`}
                type="number"
                step="0.01"
                min="0"
                value={data.commissionMaxValue || ''}
                onChange={(e) => handleInputChange('commissionMaxValue', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Structure Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estrutura de Custos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Packaging Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-packaging`} className="text-sm font-medium">
                Custo de Embalagem (R$) *
              </Label>
              <Input
                id={`${channel.type}-packaging`}
                type="number"
                step="0.01"
                min="0"
                value={data.packagingCostValue || ''}
                onChange={(e) => handleInputChange('packagingCostValue', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Fixed Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-fixed`} className="text-sm font-medium">
                Custo Fixo (%) *
              </Label>
              <Input
                id={`${channel.type}-fixed`}
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={data.fixedCostPercent || ''}
                onChange={(e) => handleInputChange('fixedCostPercent', e.target.value)}
                placeholder="0,0"
              />
            </div>

            {/* Marketing Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-marketing`} className="text-sm font-medium">
                Marketing/TACoS (%) *
              </Label>
              <Input
                id={`${channel.type}-marketing`}
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={data.marketingCostPercent || ''}
                onChange={(e) => handleInputChange('marketingCostPercent', e.target.value)}
                placeholder="0,0"
              />
            </div>

            {/* Financial Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-financial`} className="text-sm font-medium">
                Custo Financeiro (%)
              </Label>
              <Input
                id={`${channel.type}-financial`}
                type="number"
                step="0.1"
                min="0"
                value={data.financialCostPercent || ''}
                onChange={(e) => handleInputChange('financialCostPercent', e.target.value)}
                placeholder="0,0"
              />
            </div>

            {/* Shipping Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-shipping`} className="text-sm font-medium">
                Custo de Envio (R$)
              </Label>
              <Input
                id={`${channel.type}-shipping`}
                type="number"
                step="0.01"
                min="0"
                value={data.shippingCostValue || ''}
                onChange={(e) => handleInputChange('shippingCostValue', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Prep Center Cost */}
            <div className="space-y-2">
              <Label htmlFor={`${channel.type}-prep`} className="text-sm font-medium">
                Prep Center (R$)
              </Label>
              <Input
                id={`${channel.type}-prep`}
                type="number"
                step="0.01"
                min="0"
                value={data.prepCenterCostValue || ''}
                onChange={(e) => handleInputChange('prepCenterCostValue', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get product code labels
function getProductCodeLabel(field: string): string {
  const labels: Record<string, string> = {
    fnsku: 'FNSKU',
    asin: 'ASIN',
    mlb: 'MLB',
    mlbCatalog: 'MLB Catálogo',
    idProduto: 'ID Produto',
    skuMgl: 'SKU Magalu',
    codigoSite: 'Código Site',
  };
  return labels[field] || field;
}