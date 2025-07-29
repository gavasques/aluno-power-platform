import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProviderStatus } from '@/types/agent';
import { PROVIDERS } from '@/types/agent';

interface ProviderStatusCardProps {
  status: ProviderStatus;
}

export const ProviderStatusCard: React.FC<ProviderStatusCardProps> = ({ status }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Status dos Provedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const isActive = status[provider.value as keyof ProviderStatus];
            return (
              <div key={provider.value} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-xl">{provider.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{provider.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Não configurado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Configure as chaves de API nas variáveis de ambiente para ativar os provedores.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};