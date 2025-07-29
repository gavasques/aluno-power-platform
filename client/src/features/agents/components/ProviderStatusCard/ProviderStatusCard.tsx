/**
 * Componente de apresentação para status dos providers
 * Exibe conectividade e saúde de cada provider de IA
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { PROVIDERS } from '../../types/agent.types';
import type { ProviderStatusProps } from '../../types/agent.types';

export const ProviderStatusCard = ({ 
  status, 
  onRefresh, 
  isLoading = false 
}: ProviderStatusProps) => {
  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (isConnected: boolean) => {
    return (
      <Badge 
        variant={isConnected ? "secondary" : "destructive"}
        className={isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
      >
        {isConnected ? "Configurado" : "Não configurado"}
      </Badge>
    );
  };

  const connectedCount = Object.values(status).filter(Boolean).length;
  const totalProviders = PROVIDERS.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Status dos Providers
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo geral */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">
            Providers Conectados
          </div>
          <div className="text-lg font-bold">
            {connectedCount}/{totalProviders}
          </div>
        </div>

        {/* Lista de providers */}
        <div className="space-y-3">
          {PROVIDERS.map((provider) => {
            const isConnected = status[provider.value] || false;
            
            return (
              <div 
                key={provider.value} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{provider.icon}</div>
                  <div>
                    <div className="font-medium">{provider.label}</div>
                    {provider.description && (
                      <div className="text-xs text-gray-600">{provider.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(isConnected)}
                  {getStatusBadge(isConnected)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dica de configuração */}
        {connectedCount === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 mb-1">
                  Nenhum provider configurado
                </div>
                <div className="text-yellow-700">
                  Para usar os agentes, configure pelo menos um provider de IA nas variáveis de ambiente.
                  Exemplo: OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Links úteis */}
        <div className="pt-4 border-t">
          <div className="text-xs text-gray-600 mb-2">Links úteis:</div>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.filter(p => status[p.value]).map((provider) => (
              <a
                key={provider.value}
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {provider.label}
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};