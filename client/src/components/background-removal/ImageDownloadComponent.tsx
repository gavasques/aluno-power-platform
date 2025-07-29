/**
 * Reusable Image Download Component for Background Removal
 * 
 * Features:
 * - Download processed images
 * - Base64 to file conversion
 * - Copy to clipboard
 * - Image preview
 * - Multiple format support
 */

import React, { useCallback, useState } from 'react';
import { Download, Copy, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ImageDownloadComponentProps {
  processedImageUrl?: string;
  processedImageBase64?: string;
  originalFileName?: string;
  sessionId?: string;
  processingTime?: number;
  className?: string;
}

const ImageDownloadComponent: React.FC<ImageDownloadComponentProps> = ({
  processedImageUrl,
  processedImageBase64,
  originalFileName = 'processed_image.png',
  sessionId,
  processingTime,
  className = ''
}) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Check if we have processed image data
  const hasProcessedImage = processedImageUrl || processedImageBase64;
  const imageSource = processedImageBase64 || processedImageUrl;

  // Convert base64 to blob
  const base64ToBlob = useCallback((base64Data: string, mimeType: string): Blob => {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }, []);

  // Generate download filename
  const generateFileName = useCallback((extension: string = 'png'): string => {
    const baseName = originalFileName.replace(/\.[^/.]+$/, ''); // Remove original extension
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}_background_removed_${timestamp}.${extension}`;
  }, [originalFileName]);

  // Download image
  const downloadImage = useCallback(async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    if (!hasProcessedImage) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      let blob: Blob;
      const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;

      if (processedImageBase64) {
        // Convert base64 to blob
        blob = base64ToBlob(processedImageBase64, mimeType);
      } else if (processedImageUrl) {
        // Download from URL
        const response = await fetch(processedImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.status}`);
        }
        blob = await response.blob();
      } else {
        throw new Error('No image data available');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFileName(format);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: `Imagem salva como ${link.download}`,
      });

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setDownloadError(`Erro no download: ${errorMessage}`);
      
      toast({
        title: "Erro no download",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [hasProcessedImage, processedImageBase64, processedImageUrl, base64ToBlob, generateFileName, toast]);

  // Copy image to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!processedImageBase64) {
      toast({
        title: "Erro",
        description: "Dados de imagem não disponíveis para cópia",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Modern approach - copy actual image
        const base64 = processedImageBase64.replace(/^data:[^;]+;base64,/, '');
        const blob = base64ToBlob(processedImageBase64, 'image/png');
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        toast({
          title: "Copiado!",
          description: "Imagem copiada para a área de transferência",
        });
      } else {
        // Fallback - copy base64 string
        await navigator.clipboard.writeText(processedImageBase64);
        
        toast({
          title: "Copiado!",
          description: "Dados da imagem copiados como base64",
        });
      }

    } catch (error) {

      
      toast({
        title: "Erro na cópia",
        description: "Não foi possível copiar a imagem",
        variant: "destructive",
      });
    }
  }, [processedImageBase64, base64ToBlob, toast]);

  // Show empty state if no processed image
  if (!hasProcessedImage) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Nenhuma imagem processada
          </h3>
          <p className="text-sm text-gray-400">
            A imagem processada aparecerá aqui após o processamento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Imagem Processada
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={imageSource}
              alt="Processed result"
              className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm"
            />
          </div>

          {/* Processing Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Arquivo:</span>
              <span className="font-medium">{generateFileName()}</span>
            </div>
            
            {processingTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tempo de processamento:</span>
                <span className="font-medium">{(processingTime / 1000).toFixed(1)}s</span>
              </div>
            )}
            
            {sessionId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID da sessão:</span>
                <span className="font-mono text-xs">{sessionId.slice(0, 8)}...</span>
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => downloadImage('png')}
              disabled={isDownloading}
              className="flex-1 min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Baixando...' : 'PNG'}
            </Button>
            
            <Button
              onClick={() => downloadImage('jpg')}
              disabled={isDownloading}
              variant="outline"
              className="flex-1 min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              JPG
            </Button>
            
            <Button
              onClick={() => downloadImage('webp')}
              disabled={isDownloading}
              variant="outline"
              className="flex-1 min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              WEBP
            </Button>
          </div>

          {/* Copy to Clipboard */}
          {processedImageBase64 && (
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar para Área de Transferência
            </Button>
          )}

          {/* Error Display */}
          {downloadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{downloadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageDownloadComponent;