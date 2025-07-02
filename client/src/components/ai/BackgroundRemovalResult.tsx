import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Download, Eye, Split } from "lucide-react";
import { downloadProcessedImage } from '@/utils/background-removal';

import type { ProcessedImage } from "@/types/ai-image";

interface BackgroundRemovalResultProps {
  originalImage: string;
  processedImage: ProcessedImage;
  processingDuration?: number;
  originalFileName?: string;
}

type ViewMode = 'original' | 'processed' | 'comparison';

const ViewModeSelector = ({ viewMode, onViewModeChange }: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) => (
  <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as ViewMode)}>
    <ToggleGroupItem value="original" aria-label="Ver original">
      <Eye className="h-4 w-4 mr-2" />
      Original
    </ToggleGroupItem>
    <ToggleGroupItem value="processed" aria-label="Ver sem fundo">
      <Eye className="h-4 w-4 mr-2" />
      Sem Fundo
    </ToggleGroupItem>
    <ToggleGroupItem value="comparison" aria-label="Comparar">
      <Split className="h-4 w-4 mr-2" />
      Comparar
    </ToggleGroupItem>
  </ToggleGroup>
);

const ComparisonView = ({ originalImage, processedImage }: {
  originalImage: string;
  processedImage: string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-center">Original</h4>
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        <img
          src={originalImage}
          alt="Imagem original"
          className="w-full h-auto max-h-96 object-contain"
        />
      </div>
    </div>
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-center">Sem Fundo</h4>
      <div className="relative overflow-hidden rounded-lg border bg-transparent" style={{
        backgroundImage: `
          linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}>
        <img
          src={processedImage}
          alt="Imagem sem fundo"
          className="w-full h-auto max-h-96 object-contain"
        />
      </div>
    </div>
  </div>
);

const SingleImageView = ({ imageUrl, alt, showTransparentBg = false }: {
  imageUrl: string;
  alt: string;
  showTransparentBg?: boolean;
}) => (
  <div className={`relative overflow-hidden rounded-lg border ${showTransparentBg ? 'bg-transparent' : 'bg-muted'}`} style={showTransparentBg ? {
    backgroundImage: `
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  } : {}}>
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-auto max-h-96 object-contain mx-auto"
    />
  </div>
);

const ActionButtons = ({ processedImage, originalFileName }: {
  processedImage: string;
  originalFileName?: string;
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <Button
      onClick={() => downloadProcessedImage(processedImage, originalFileName || 'imagem')}
      className="flex-1"
    >
      <Download className="mr-2 h-4 w-4" />
      Baixar PNG Transparente
    </Button>
  </div>
);

const QualityTips = ({ processingDuration }: { processingDuration?: number }) => (
  <div className="space-y-2 text-xs text-muted-foreground">
    {processingDuration && (
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 bg-green-500 rounded-full" />
        <span>Processamento concluído em {Math.round(processingDuration / 1000)}s</span>
      </div>
    )}
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 bg-blue-500 rounded-full" />
      <span>Formato PNG com transparência preservada</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 bg-purple-500 rounded-full" />
      <span>Qualidade otimizada para uso profissional</span>
    </div>
  </div>
);

export function BackgroundRemovalResult({
  originalImage,
  processedImage,
  processingDuration,
  originalFileName,
}: BackgroundRemovalResultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resultado</span>
          <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Display */}
        {viewMode === 'comparison' && (
          <ComparisonView originalImage={originalImage} processedImage={processedImage.url} />
        )}
        {viewMode === 'original' && (
          <SingleImageView imageUrl={originalImage} alt="Imagem original" />
        )}
        {viewMode === 'processed' && (
          <SingleImageView imageUrl={processedImage.url} alt="Imagem sem fundo" showTransparentBg={true} />
        )}

        {/* Action Buttons */}
        <ActionButtons processedImage={processedImage.url} originalFileName={originalFileName} />

        {/* Quality Tips */}
        <QualityTips processingDuration={processingDuration} />
      </CardContent>
    </Card>
  );
}