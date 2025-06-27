import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Target, CheckCircle } from 'lucide-react';

interface BulletPointsListProps {
  bulletPoints: string[];
  onCopy: (bullet: string) => void;
}

export const BulletPointsList = ({ bulletPoints, onCopy }: BulletPointsListProps) => {
  const copyAllBullets = () => {
    const allBullets = bulletPoints.map((bullet, index) => `• ${bullet}`).join('\n');
    onCopy(allBullets);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bullet Points Otimizados</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {bulletPoints.length} {bulletPoints.length === 1 ? 'bullet point' : 'bullet points'}
          </Badge>
          <Button variant="outline" size="sm" onClick={copyAllBullets}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Todos
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {bulletPoints.map((bullet, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 leading-relaxed">
                      {bullet}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {bullet.length} caracteres
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(bullet)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bulletPoints.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum bullet point foi gerado ainda.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Boas práticas para bullet points:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Destaque benefícios específicos e mensuráveis</p>
              <p>• Use palavras-chave naturalmente no texto</p>
              <p>• Mantenha cada bullet point entre 100-200 caracteres</p>
              <p>• Inclua especificações técnicas quando relevante</p>
              <p>• Foque na proposta de valor única do produto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};