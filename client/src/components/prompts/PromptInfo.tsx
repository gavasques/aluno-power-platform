
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Lightbulb } from 'lucide-react';

interface PromptInfoProps {
  description?: string;
  usageExamples?: string;
  categoryName: string;
}

export const PromptInfo = ({ description, usageExamples, categoryName }: PromptInfoProps) => {
  return (
    <>
      {/* Descrição */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      )}

      {/* Exemplos de Uso */}
      {usageExamples && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              Exemplos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{usageExamples}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Categoria:</span> {categoryName}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
