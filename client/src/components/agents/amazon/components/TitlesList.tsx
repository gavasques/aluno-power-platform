import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { GeneratedTitle } from '@/types/amazon';

interface TitlesListProps {
  titles: GeneratedTitle[];
  onCopy: (title: string) => void;
}

export const TitlesList = ({ titles, onCopy }: TitlesListProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <Star className="h-4 w-4" />;
    if (score >= 6) return <TrendingUp className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getLengthStatus = (length: number) => {
    if (length <= 200) return { status: 'Ótimo', color: 'text-green-600' };
    if (length <= 250) return { status: 'Bom', color: 'text-yellow-600' };
    return { status: 'Muito longo', color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Títulos Otimizados</h3>
        <Badge variant="secondary">
          {titles.length} {titles.length === 1 ? 'título' : 'títulos'}
        </Badge>
      </div>

      {titles.map((title, index) => {
        const lengthStatus = getLengthStatus(title.length);
        
        return (
          <Card key={title.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreColor(title.score)}`}>
                    {getScoreIcon(title.score)}
                    <span className="text-xs font-medium">{title.score}/10</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${lengthStatus.color}`}>
                    {title.length} chars - {lengthStatus.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(title.title)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="font-medium text-gray-900 leading-relaxed">
                  {title.title}
                </p>
              </div>
              
              {title.reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 mb-1">Por que este título é eficaz:</p>
                  <p className="text-sm text-blue-700">{title.reasoning}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Comprimento:</span> {title.length} caracteres
                </div>
                <div>
                  <span className="font-medium">Score de qualidade:</span> {title.score}/10
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {titles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum título foi gerado ainda.</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Dicas para títulos Amazon:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Mantenha entre 150-200 caracteres para melhor visibilidade</p>
              <p>• Inclua as palavras-chave principais no início</p>
              <p>• Use números e especificações quando relevante</p>
              <p>• Evite palavras promocionais como "melhor" ou "grátis"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};