import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { ConceptData } from '../types';

interface ConceptSelectionStepProps {
  concepts: ConceptData[];
  selectedConceptId?: string;
  onConceptSelect: (conceptId: string) => void;
  onNext: () => void;
}

export const ConceptSelectionStep = memo<ConceptSelectionStepProps>(({
  concepts,
  selectedConceptId,
  onConceptSelect,
  onNext
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Escolha o Conceito do Infográfico</h2>
        <p className="text-muted-foreground">
          Selecione o estilo que melhor representa seu produto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedConceptId === concept.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => onConceptSelect(concept.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{concept.title}</CardTitle>
                  <CardDescription>{concept.subtitle}</CardDescription>
                </div>
                {selectedConceptId === concept.id && (
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {concept.recommended && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Recomendado
                  </Badge>
                )}
                <Badge variant="outline">{concept.focusType}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Key Points */}
                <div>
                  <p className="text-sm font-medium mb-2">Pontos principais:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {concept.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color Palette Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Paleta de cores:</p>
                  <div className="flex gap-1">
                    {Object.values(concept.colorPalette).slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedConceptId && (
        <div className="flex justify-center">
          <Button onClick={onNext} size="lg" className="w-full max-w-md">
            <ArrowRight className="w-4 h-4 mr-2" />
            Continuar com Conceito Selecionado
          </Button>
        </div>
      )}
    </div>
  );
});