import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, RotateCcw } from 'lucide-react';
import type { InfographicFormData } from '../types';

interface InfographicPreviewProps {
  imageUrl: string;
  formData: InfographicFormData;
  onDownload: () => void;
  onReset: () => void;
  onBack: () => void;
}

export const InfographicPreview = memo<InfographicPreviewProps>(({
  imageUrl,
  formData,
  onDownload,
  onReset,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Infográfico Gerado</h1>
        <p className="text-muted-foreground">
          Seu infográfico para "{formData.productName}" está pronto!
        </p>
      </div>

      {/* Preview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="text-center">
              <img
                src={imageUrl}
                alt={`Infográfico de ${formData.productName}`}
                className="max-w-full h-auto rounded-lg border shadow-lg mx-auto"
                style={{ maxHeight: '600px' }}
              />
            </div>

            {/* Product Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Detalhes do Infográfico</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Produto:</span>
                  <div className="text-muted-foreground">{formData.productName}</div>
                </div>
                <div>
                  <span className="font-medium">Categoria:</span>
                  <div className="text-muted-foreground">{formData.category}</div>
                </div>
                <div>
                  <span className="font-medium">Layout:</span>
                  <div className="text-muted-foreground capitalize">{formData.layout}</div>
                </div>
                <div>
                  <span className="font-medium">Estilo:</span>
                  <div className="text-muted-foreground capitalize">{formData.style}</div>
                </div>
                <div>
                  <span className="font-medium">Público-alvo:</span>
                  <div className="text-muted-foreground">{formData.targetAudience}</div>
                </div>
                <div>
                  <span className="font-medium">Cores:</span>
                  <div className="flex gap-1 mt-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: formData.primaryColor }}
                      title={`Primária: ${formData.primaryColor}`}
                    />
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: formData.secondaryColor }}
                      title={`Secundária: ${formData.secondaryColor}`}
                    />
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: formData.accentColor }}
                      title={`Destaque: ${formData.accentColor}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onDownload} size="lg">
                <Download className="w-4 h-4 mr-2" />
                Baixar Infográfico
              </Button>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Formulário
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Novo Infográfico
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});