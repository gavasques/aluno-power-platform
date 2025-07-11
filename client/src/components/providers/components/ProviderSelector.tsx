// Provider Selector Component - Enhanced with detailed information and status

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { PROVIDERS } from '../constants';
import { ProviderInfo } from '../types';

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  providerStatus?: Record<string, boolean>;
  showDetails?: boolean;
  compact?: boolean;
}

export function ProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  providerStatus = {}, 
  showDetails = false,
  compact = false 
}: ProviderSelectorProps) {
  const selectedProviderInfo = PROVIDERS.find(p => p.value === selectedProvider);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="provider" className="text-sm font-medium">
          Provedor de IA
        </Label>
        <Select value={selectedProvider} onValueChange={onProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um provedor" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {PROVIDERS.map((provider: ProviderInfo) => (
              <SelectItem key={provider.value} value={provider.value} className="flex-col items-start p-3">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{provider.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.label}</span>
                      <Badge className={provider.color}>
                        {providerStatus[provider.value] ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" />Configurado</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" />Não configurado</>
                        )}
                      </Badge>
                    </div>
                    {!compact && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {provider.description}
                      </p>
                    )}
                  </div>
                </div>
                {!compact && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {provider.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.features.length - 3} mais
                      </Badge>
                    )}
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provider Details Card */}
      {showDetails && selectedProviderInfo && (
        <Card className="border-l-4" style={{ borderLeftColor: selectedProviderInfo.color.includes('green') ? '#22c55e' : 
          selectedProviderInfo.color.includes('purple') ? '#a855f7' :
          selectedProviderInfo.color.includes('blue') ? '#3b82f6' :
          selectedProviderInfo.color.includes('orange') ? '#f97316' :
          selectedProviderInfo.color.includes('indigo') ? '#6366f1' : '#14b8a6' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{selectedProviderInfo.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{selectedProviderInfo.label}</h3>
                  {providerStatus[selectedProvider] ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedProviderInfo.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Capacidades
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProviderInfo.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Funcionalidades
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProviderInfo.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}