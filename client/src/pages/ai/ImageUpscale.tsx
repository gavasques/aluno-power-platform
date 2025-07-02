import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ai/ImageUploader";
import { UpscaleControls } from "@/components/ai/UpscaleControls";
import { UpscaleResult } from "@/components/ai/UpscaleResult";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Zap } from "lucide-react";

interface UpscaleData {
  id: string;
  originalImageUrl: string;
  upscaledImageUrl: string;
  scale: number;
  processingTime: number;
  cost: string;
}

function ImageUpscale() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<{ id: string; url: string; name: string } | null>(null);
  const [selectedScale, setSelectedScale] = useState<2 | 4>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UpscaleData | null>(null);

  const handleImageUploaded = (imageData: { id: string; url: string; name: string }) => {
    setUploadedImage(imageData);
    setResult(null); // Clear previous results
  };

  const handleUpscale = async () => {
    if (!uploadedImage) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/image-upscale/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: uploadedImage.id,
          scale: selectedScale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no processamento');
      }

      const data = await response.json();
      
      setResult(data.data);
      
      toast({
        title: "Sucesso!",
        description: `Imagem upscaled ${selectedScale}x com sucesso em ${(data.data.processingTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      console.error('Upscale error:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewUpscale = () => {
    setUploadedImage(null);
    setResult(null);
    setSelectedScale(2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Upscale AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Aumente a resolução das suas imagens usando inteligência artificial. 
          Transforme imagens pequenas em versões de alta qualidade em 2x ou 4x.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload da Imagem
              </CardTitle>
              <CardDescription>
                Faça upload da imagem que deseja fazer upscale (máx. 25MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader 
                onImageUploaded={handleImageUploaded}
                uploadedImage={uploadedImage}
              />
            </CardContent>
          </Card>

          {uploadedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Configurações do Upscale
                </CardTitle>
                <CardDescription>
                  Escolha o nível de ampliação desejado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpscaleControls
                  selectedScale={selectedScale}
                  onScaleChange={setSelectedScale}
                  onUpscale={handleUpscale}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Result or Placeholder */}
        <div>
          {result ? (
            <UpscaleResult
              result={result}
              onNewUpscale={handleNewUpscale}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Resultado do Upscale</h3>
                <p className="text-muted-foreground">
                  O resultado aparecerá aqui após o processamento
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Formatos Suportados</h3>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, JPEG, WEBP até 25MB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Processamento Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Resultados em segundos com IA avançada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Alta Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Preserva detalhes e melhora a nitidez
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}