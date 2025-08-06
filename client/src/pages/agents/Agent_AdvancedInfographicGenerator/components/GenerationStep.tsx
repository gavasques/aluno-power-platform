import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Download, ArrowLeft } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import type { InfographicSession, ConceptData } from '../types';

interface GenerationStepProps {
  session: InfographicSession;
  selectedConcept?: ConceptData;
  showProcessingModal: boolean;
  loading: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  onReset: () => void;
}

export const GenerationStep = memo<GenerationStepProps>(({
  session,
  selectedConcept,
  showProcessingModal,
  loading,
  onGenerate,
  onDownload,
  onReset
}) => {
  if (session.step === 'completed') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Infográfico Concluído!</h2>
          <p className="text-muted-foreground">
            Seu infográfico foi gerado com sucesso
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {session.finalImageUrl && (
                <div className="text-center">
                  <img
                    src={session.finalImageUrl}
                    alt="Infográfico gerado"
                    className="max-w-full h-auto rounded-lg border shadow-lg mx-auto"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={onDownload} size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Infográfico
                </Button>
                <Button variant="outline" onClick={onReset}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Criar Novo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.step === 'generating') {
    return (
      <>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Gerando Infográfico...</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto criamos seu infográfico profissional
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Progress value={75} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Aplicando conceito visual e otimizando layout...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showProcessingModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Processando Infográfico</DialogTitle>
              <DialogDescription>
                Estamos aplicando o conceito selecionado ao seu produto. Este processo pode levar alguns minutos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Gerando layout profissional...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Gerar Infográfico</h2>
        <p className="text-muted-foreground">
          Confirme os detalhes e gere seu infográfico personalizado
        </p>
      </div>

      {/* Selected Concept Summary */}
      {selectedConcept && (
        <Card>
          <CardHeader>
            <CardTitle>Conceito Selecionado</CardTitle>
            <CardDescription>{selectedConcept.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">{selectedConcept.title}</p>
                <p className="text-sm text-muted-foreground">Foco: {selectedConcept.focusType}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Elementos principais:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedConcept.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Paleta de cores:</p>
                <div className="flex gap-1">
                  {Object.entries(selectedConcept.colorPalette).map(([name, color], index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={`${name}: ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Summary */}
      {session.productData && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Nome:</p>
                <p className="text-muted-foreground">{session.productData.name}</p>
              </div>
              <div>
                <p className="font-medium">Categoria:</p>
                <p className="text-muted-foreground">{session.productData.category}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium">Público-alvo:</p>
                <p className="text-muted-foreground">{session.productData.targetAudience}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={loading}
          size="lg"
          className="w-full max-w-md"
        >
          {loading ? (
            <ButtonLoader>Gerando infográfico...</ButtonLoader>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Gerar Infográfico Personalizado
            </>
          )}
        </Button>
      </div>
    </div>
  );
});