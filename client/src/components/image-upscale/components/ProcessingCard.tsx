/**
 * Processing status and results card component
 */

import { Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import ProcessingStatusComponent from '@/components/background-removal/ProcessingStatusComponent';
import ImageDownloadComponent from '@/components/background-removal/ImageDownloadComponent';
import type { ProcessingState, UpscaleResult, ImageUpscaleParams } from '../types';
import { UPSCALE_CONFIG } from '../constants';

interface ProcessingCardProps {
  processing: ProcessingState;
  result: UpscaleResult | null;
  imageData: string;
  parameters: ImageUpscaleParams;
  onReset: () => void;
}

export const ProcessingCard = ({
  processing,
  result,
  imageData,
  parameters,
  onReset
}: ProcessingCardProps) => {
  if (!processing.isProcessing && !result) {
    return null;
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {processing.isProcessing ? (
            <Clock className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {processing.isProcessing ? 'Processando' : 'Resultado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processing.isProcessing && (
          <ProcessingStatusComponent
            currentStep={processing.currentStep}
            totalSteps={UPSCALE_CONFIG.totalSteps}
            status={processing.status}
            onCancel={() => {}} // Processing cannot be cancelled for upscale
          />
        )}

        {result && !processing.isProcessing && (
          <ImageDownloadComponent
            originalImageData={`data:image/png;base64,${imageData}`}
            processedImageData={result.processedImageBase64}
            originalFileName={result.originalFileName}
            processedFileName={`${result.originalFileName.replace(/\.[^/.]+$/, '')}_upscaled_${parameters.scale}x`}
            processingTime={result.processingTime}
            creditsUsed={result.creditsUsed}
            onStartNew={onReset}
            additionalInfo={[
              { label: 'Aumento', value: `${result.scale}x` },
              { label: 'Formato', value: parameters.format || 'PNG' }
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
};