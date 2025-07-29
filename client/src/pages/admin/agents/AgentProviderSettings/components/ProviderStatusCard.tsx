import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { PROVIDERS } from '../types';
import type { ProviderStatusCardProps } from '../types';

/**
 * PROVIDER STATUS CARD - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para status dos provedores
 * Responsabilidade única: Exibir status de conectividade dos provedores de IA
 */
export function ProviderStatusCard({ status, isLoading }: ProviderStatusCardProps) {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Status dos Provedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              {PROVIDERS.map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Status dos Provedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PROVIDERS.map((provider) => {
            const isConfigured = status[provider.value as keyof typeof status];
            
            return (
              <div
                key={provider.value}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                    <span className="text-lg">{provider.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {provider.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {provider.value.charAt(0).toUpperCase() + provider.value.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isConfigured ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Configurado
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <Badge variant="outline" className="text-yellow-800 border-yellow-300">
                        Não Configurado
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(status).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Configurados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(status).filter(s => !s).length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}