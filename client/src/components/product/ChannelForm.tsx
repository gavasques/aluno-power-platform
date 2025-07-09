
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormattedInput } from "@/components/ui/formatted-input";
import { ProductChannels } from "@/types/product";

interface ChannelFormProps {
  channelType: string;
  channelData: any;
  title: string;
  productTaxPercent?: number;
  onChannelToggle: (channelType: string) => void;
  onChannelInputChange: (channelType: string, field: string, value: number | string) => void;
}

export const ChannelForm = ({ 
  channelType, 
  channelData, 
  title, 
  productTaxPercent = 0,
  onChannelToggle, 
  onChannelInputChange 
}: ChannelFormProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Switch
          checked={channelData?.enabled || false}
          onCheckedChange={() => onChannelToggle(channelType)}
        />
      </div>
    </CardHeader>
    {channelData?.enabled && (
      <CardContent className="space-y-4">
        {/* Código do Produto no Canal */}
        <div className="col-span-2">
          <Label>Código do Produto no Canal</Label>
          <Input
            placeholder="Ex: PROD-001-AMZ"
            value={channelData.productCode || ""}
            onChange={(e) => onChannelInputChange(channelType, 'productCode', e.target.value)}
          />
        </div>

        {/* Campo FNSKU específico para Amazon FBA */}
        {channelType === 'amazonFBA' && (
          <div className="col-span-2">
            <Label>Código FNSKU</Label>
            <Input
              placeholder="Ex: X001ABC123DEF"
              value={channelData.fnsku || ""}
              onChange={(e) => onChannelInputChange(channelType, 'fnsku', e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Preço de Venda (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.price || 0}
              onChange={(value) => onChannelInputChange(channelType, 'price', value)}
            />
          </div>
          <div>
            <Label>Comissão (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.commissionPercent || 0}
              onChange={(value) => onChannelInputChange(channelType, 'commissionPercent', value)}
            />
          </div>
          <div>
            <Label>Custo de Envio (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.shippingCost || 0}
              onChange={(value) => onChannelInputChange(channelType, 'shippingCost', value)}
            />
          </div>
          <div>
            <Label>Outros Custos (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.otherCostValue || 0}
              onChange={(value) => onChannelInputChange(channelType, 'otherCostValue', value)}
            />
          </div>
          <div>
            <Label>Custo Fixo (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.fixedCostPercent || 0}
              onChange={(value) => onChannelInputChange(channelType, 'fixedCostPercent', value)}
            />
          </div>
          <div>
            <Label>Outros Custos (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.otherCostPercent || 0}
              onChange={(value) => onChannelInputChange(channelType, 'otherCostPercent', value)}
            />
          </div>
          {/* Campo de Impostos Global (Somente Leitura) */}
          <div>
            <Label>Impostos (%) - Global do Produto</Label>
            <Input
              value={`${productTaxPercent}%`}
              readOnly
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          
          {/* Campos específicos para Site Próprio */}
          {channelType === 'SITE_PROPRIO' && (
            <>
              <div>
                <Label>Embalagem (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.packagingCostValue || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'packagingCostValue', value)}
                />
              </div>
              <div>
                <Label>Custo Financeiro (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.financialCostPercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'financialCostPercent', value)}
                />
              </div>
              <div>
                <Label>Marketing (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.marketingCostPercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'marketingCostPercent', value)}
                />
              </div>
            </>
          )}
          
          {/* Campos específicos para Amazon FBA On Site */}
          {channelType === 'AMAZON_FBA_ONSITE' && (
            <>
              <div>
                <Label>Valor de Desconto (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.rebateValue || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'rebateValue', value)}
                />
              </div>
              <div>
                <Label>Desconto (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.rebatePercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'rebatePercent', value)}
                />
              </div>
              <div>
                <Label>Tacos (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.tacosCostPercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'tacosCostPercent', value)}
                />
              </div>
              <div>
                <Label>Parcelamento (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.installmentPercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'installmentPercent', value)}
                />
              </div>
              <div>
                <Label>Embalagem (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.packagingCostValue || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'packagingCostValue', value)}
                />
              </div>
            </>
          )}

          {/* Campos específicos para Amazon FBA */}
          {channelType === 'AMAZON_FBA' && (
            <div>
              <Label>Custo do Produto FBA (R$)</Label>
              <FormattedInput
                type="currency"
                value={channelData.productCostFBA || 0}
                onChange={(value) => onChannelInputChange(channelType, 'productCostFBA', value)}
              />
            </div>
          )}

          {/* Campos específicos para Mercado Livre Full */}
          {channelType === 'MERCADO_LIVRE_FULL' && (
            <>
              <div>
                <Label>Tacos (%)</Label>
                <FormattedInput
                  type="percentage"
                  value={channelData.tacosCostPercent || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'tacosCostPercent', value)}
                />
              </div>
              <div>
                <Label>Custo do Produto ML Full (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.productCostMLFull || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'productCostMLFull', value)}
                />
              </div>
            </>
          )}

        </div>
      </CardContent>
    )}
  </Card>
);
