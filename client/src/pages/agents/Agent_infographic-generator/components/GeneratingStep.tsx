import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Image, Palette, Layout, Zap } from 'lucide-react';

export const GeneratingStep = memo(() => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerando Infográfico</h1>
        <p className="text-muted-foreground">
          Aguarde enquanto criamos seu infográfico personalizado
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={65} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Aplicando design e organizando elementos...
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Image className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Processando conteúdo ✓</span>
              </div>

              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Aplicando cores e estilo ⏳</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Layout className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Organizando layout</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Finalizando detalhes</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dica</h4>
              <p className="text-sm text-blue-800">
                Estamos criando um infográfico único baseado nas suas especificações. 
                O processo pode levar alguns minutos para garantir a melhor qualidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});