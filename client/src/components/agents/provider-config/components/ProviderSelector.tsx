// Provider Selector Component - Single responsibility for provider selection

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from '../constants';
import { ProviderInfo } from '../types';

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  providerStatus?: Record<string, boolean>;
}

export function ProviderSelector({ selectedProvider, onProviderChange, providerStatus = {} }: ProviderSelectorProps) {
  return (
    <div>
      <Label htmlFor="provider">Provedor de IA</Label>
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um provedor" />
        </SelectTrigger>
        <SelectContent>
          {PROVIDERS.map((provider: ProviderInfo) => (
            <SelectItem key={provider.value} value={provider.value}>
              <div className="flex items-center gap-2">
                <span>{provider.icon}</span>
                <span>{provider.label}</span>
                <Badge className={provider.color}>
                  {providerStatus[provider.value] ? 'Configurado' : 'Não configurado'}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}