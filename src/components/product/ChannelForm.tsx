
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductChannels } from "@/types/product";

interface ChannelFormProps {
  channelType: keyof ProductChannels;
  channelData: any;
  title: string;
  onChannelToggle: (channelType: keyof ProductChannels) => void;
  onChannelInputChange: (channelType: keyof ProductChannels, field: string, value: number) => void;
}

export const ChannelForm = ({ 
  channelType, 
  channelData, 
  title, 
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Comissão (%)</Label>
            <Input
              type="number"
              value={channelData.commissionPct}
              onChange={(e) => onChannelInputChange(channelType, 'commissionPct', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Taxa Fixa (R$)</Label>
            <Input
              type="number"
              value={channelData.fixedFee}
              onChange={(e) => onChannelInputChange(channelType, 'fixedFee', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Outro Custo (%)</Label>
            <Input
              type="number"
              value={channelData.otherPct}
              onChange={(e) => onChannelInputChange(channelType, 'otherPct', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Outro Custo (R$)</Label>
            <Input
              type="number"
              value={channelData.otherValue}
              onChange={(e) => onChannelInputChange(channelType, 'otherValue', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Custo com Ads (%)</Label>
            <Input
              type="number"
              value={channelData.adsPct}
              onChange={(e) => onChannelInputChange(channelType, 'adsPct', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Preço de Venda (R$)</Label>
            <Input
              type="number"
              value={channelData.salePrice}
              onChange={(e) => onChannelInputChange(channelType, 'salePrice', Number(e.target.value))}
            />
          </div>
          
          {/* Campos específicos por canal */}
          {(channelType === 'amazonFBM' || channelType === 'amazonFBAOnSite' || channelType === 'amazonDBA' || channelType === 'mlFlex' || channelType === 'mlEnvios') && (
            <div>
              <Label>Frete Outbound (R$)</Label>
              <Input
                type="number"
                value={channelData.outboundFreight || 0}
                onChange={(e) => onChannelInputChange(channelType, 'outboundFreight', Number(e.target.value))}
              />
            </div>
          )}
          
          {(channelType === 'amazonFBA' || channelType === 'mlFull') && (
            <>
              <div>
                <Label>Frete Inbound (R$)</Label>
                <Input
                  type="number"
                  value={channelData.inboundFreight || 0}
                  onChange={(e) => onChannelInputChange(channelType, 'inboundFreight', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Prep Center (R$)</Label>
                <Input
                  type="number"
                  value={channelData.prepCenter || 0}
                  onChange={(e) => onChannelInputChange(channelType, 'prepCenter', Number(e.target.value))}
                />
              </div>
            </>
          )}
          
          {channelType === 'mlFlex' && (
            <div>
              <Label>Receita ML Flex (R$)</Label>
              <Input
                type="number"
                value={channelData.flexRevenue || 0}
                onChange={(e) => onChannelInputChange(channelType, 'flexRevenue', Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </CardContent>
    )}
  </Card>
);
