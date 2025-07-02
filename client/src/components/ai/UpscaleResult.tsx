import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  ExternalLink, 
  RotateCcw, 
  Zap,
  Eye,
  Copy,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpscaleData {
  id: string;
  originalImageUrl: string;
  upscaledImageUrl: string;
  scale: number;
  processingTime: number;
  cost: string;
}

interface UpscaleResultProps {
  result: UpscaleData;
  onNewUpscale: () => void;
}

export function UpscaleResult({ result, onNewUpscale }: UpscaleResultProps) {
  const { toast } = useToast();
  const [imageComparison, setImageComparison] = useState<'original' | 'upscaled' | 'side-by-side'>('side-by-side');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(result.upscaledImageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `upscaled-${result.scale}x-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado!",
        description: "Sua imagem upscaled está sendo baixada",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    // Create a temporary HTML page with the image for better viewing
    const imageWindow = window.open('', '_blank');
    if (imageWindow) {
      imageWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imagem Upscaled - ${result.scale}x</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #f5f5f5; 
                font-family: Arial, sans-serif;
              }
              img { 
                max-width: 100%; 
                max-height: 90vh; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
                border-radius: 8px;
              }
              .info {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <img src="${result.upscaledImageUrl}" alt="Imagem Upscaled ${result.scale}x" />
            <div class="info">Upscaled ${result.scale}x</div>
          </body>
        </html>
      `);
      imageWindow.document.close();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.upscaledImageUrl);
      toast({
        title: "URL copiada!",
        description: "Link da imagem copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o URL",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Upscale Concluído com Sucesso!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Sua imagem foi processada e está pronta para download
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Comparação Visual
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={imageComparison === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageComparison('original')}
              >
                Original
              </Button>
              <Button
                variant={imageComparison === 'upscaled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageComparison('upscaled')}
              >
                Upscaled
              </Button>
              <Button
                variant={imageComparison === 'side-by-side' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageComparison('side-by-side')}
              >
                Lado a Lado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "space-y-4",
            imageComparison === 'side-by-side' && "grid md:grid-cols-2 gap-4 space-y-0"
          )}>
            {(imageComparison === 'original' || imageComparison === 'side-by-side') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Imagem Original</h4>
                  <Badge variant="secondary">Original</Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden border bg-muted group">
                  <img
                    src={result.originalImageUrl}
                    alt="Imagem original"
                    className="w-full h-64 object-contain transition-transform group-hover:scale-105"
                  />
                </div>
              </div>
            )}

            {(imageComparison === 'upscaled' || imageComparison === 'side-by-side') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Imagem Upscaled</h4>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                    {result.scale}x Upscaled
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden border bg-muted group">
                  <img
                    src={result.upscaledImageUrl}
                    alt="Imagem upscaled"
                    className="w-full h-64 object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{result.scale}x Upscale</p>
              <p className="text-sm text-muted-foreground">Escala aplicada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isDownloading ? (
            <>
              <Download className="mr-2 h-5 w-5 animate-pulse" />
              Baixando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Baixar Imagem
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenInNewTab}
            variant="outline"
            className="flex-1 h-12"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir
          </Button>
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            className="flex-1 h-12"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar URL
          </Button>
        </div>
      </div>

      {/* New Upscale Button */}
      <Button
        onClick={onNewUpscale}
        variant="outline"
        className="w-full h-12"
      >
        <RotateCcw className="mr-2 h-5 w-5" />
        Fazer Novo Upscale
      </Button>


    </div>
  );
}