
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormattedInput } from "@/components/ui/formatted-input";
import { ProductChannels } from "@/types/product";

interface ChannelFormProps {
  channelType: keyof ProductChannels;
  channelData: any;
  title: string;
  productTaxPercent?: number;
  onChannelToggle: (channelType: keyof ProductChannels) => void;
  onChannelInputChange: (channelType: keyof ProductChannels, field: string, value: number | string) => void;
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
            <Label>Comissão (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.commissionPct || 0}
              onChange={(value) => onChannelInputChange(channelType, 'commissionPct', value)}
            />
          </div>
          <div>
            <Label>Taxa Fixa (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.fixedFee || 0}
              onChange={(value) => onChannelInputChange(channelType, 'fixedFee', value)}
            />
          </div>
          <div>
            <Label>Outro Custo (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.otherPct || 0}
              onChange={(value) => onChannelInputChange(channelType, 'otherPct', value)}
            />
          </div>
          <div>
            <Label>Outro Custo (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.otherValue || 0}
              onChange={(value) => onChannelInputChange(channelType, 'otherValue', value)}
            />
          </div>
          <div>
            <Label>Custo com Ads (%)</Label>
            <FormattedInput
              type="percentage"
              value={channelData.adsPct || 0}
              onChange={(value) => onChannelInputChange(channelType, 'adsPct', value)}
            />
          </div>
          <div>
            <Label>Preço de Venda (R$)</Label>
            <FormattedInput
              type="currency"
              value={channelData.salePrice || 0}
              onChange={(value) => onChannelInputChange(channelType, 'salePrice', value)}
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
          
          {/* Campo específico para Site Próprio */}
          {channelType === 'sitePropio' && (
            <div>
              <Label>Gateway de Pagamento (%)</Label>
              <FormattedInput
                type="percentage"
                value={channelData.gatewayPct || 0}
                onChange={(value) => onChannelInputChange(channelType, 'gatewayPct', value)}
              />
            </div>
          )}
          
          {/* Campos específicos por canal */}
          {(channelType === 'amazonFBM' || channelType === 'amazonFBAOnSite' || channelType === 'amazonDBA' || channelType === 'mlFlex' || channelType === 'mlEnvios') && (
            <div>
              <Label>Frete Outbound (R$)</Label>
              <FormattedInput
                type="currency"
                value={channelData.outboundFreight || 0}
                onChange={(value) => onChannelInputChange(channelType, 'outboundFreight', value)}
              />
            </div>
          )}

          {/* Campo específico para Amazon FBM, Amazon FBA On Site, Amazon DBA e ML ME1 - Frete Médio (Se Frete Grátis) */}
          {(channelType === 'amazonFBM' || channelType === 'amazonFBAOnSite' || channelType === 'amazonDBA' || channelType === 'mlME1') && (
            <div>
              <Label>Frete Médio (Se Frete Grátis) (R$)</Label>
              <FormattedInput
                type="currency"
                value={channelData.averageFreightIfFree || 0}
                onChange={(value) => onChannelInputChange(channelType, 'averageFreightIfFree', value)}
              />
            </div>
          )}
          
          {(channelType === 'amazonFBA' || channelType === 'mlFull') && (
            <>
              <div>
                <Label>Frete Inbound (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.inboundFreight || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'inboundFreight', value)}
                />
              </div>
              {/* Frete Outbound específico para Amazon FBA */}
              {channelType === 'amazonFBA' && (
                <div>
                  <Label>Frete Outbound (R$)</Label>
                  <FormattedInput
                    type="currency"
                    value={channelData.outboundFreight || 0}
                    onChange={(value) => onChannelInputChange(channelType, 'outboundFreight', value)}
                  />
                </div>
              )}
              {channelType === 'mlFull' && (
                <div>
                  <Label>Frete Outbound (R$)</Label>
                  <FormattedInput
                    type="currency"
                    value={channelData.outboundFreight || 0}
                    onChange={(value) => onChannelInputChange(channelType, 'outboundFreight', value)}
                  />
                </div>
              )}
              <div>
                <Label>Prep Center (R$)</Label>
                <FormattedInput
                  type="currency"
                  value={channelData.prepCenter || 0}
                  onChange={(value) => onChannelInputChange(channelType, 'prepCenter', value)}
                />
              </div>
            </>
          )}
          
          {channelType === 'mlFlex' && (
            <div>
              <Label>Receita ML Flex (R$)</Label>
              <FormattedInput
                type="currency"
                value={channelData.flexRevenue || 0}
                onChange={(value) => onChannelInputChange(channelType, 'flexRevenue', value)}
              />
            </div>
          )}
        </div>
      </CardContent>
    )}
  </Card>
);
