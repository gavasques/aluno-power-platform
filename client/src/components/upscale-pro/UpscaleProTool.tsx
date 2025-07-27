import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, ZoomIn, Check, AlertCircle, CreditCard, Sparkles } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useCreditSystem } from '@/hooks/useCreditSystem';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Schema for form validation
const UpscaleProSchema = z.object({
  upscale_factor: z.number().min(2).max(8),
  format: z.enum(['PNG', 'JPG', 'WEBP']),
});

interface UpscaleProParams {
  upscale_factor: number;
  format: 'PNG' | 'JPG' | 'WEBP';
}

interface ProcessingResult {
  success: boolean;
  processedImageData: string;
  processedImageUrl: string;
  sessionId: string;
  duration: number;
}

const FEATURE_CODE = 'tools.upscale_pro';

export function UpscaleProTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string>('');
  const [parameters, setParameters] = useState<UpscaleProParams>({
    upscale_factor: 2,
    format: 'PNG'
  });
  
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError('Formato não suportado. Use PNG, JPG ou WEBP.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const processImage = async () => {
    if (!selectedFile) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    try {
      // Validate parameters
      const validatedParams = UpscaleProSchema.parse(parameters);
      
      setIsProcessing(true);
      setProgress(0);
      setError('');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('upscale_factor', validatedParams.upscale_factor.toString());
      formData.append('format', validatedParams.format);

      const response = await fetch('/api/picsart/upscale-pro/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no processamento da imagem');
      }

      const responseData = await response.json();
      
      // The backend returns data within a "data" wrapper
      const result: ProcessingResult = {
        success: responseData.success,
        processedImageData: responseData.data.processedImageData,
        processedImageUrl: responseData.data.processedImageUrl,
        sessionId: responseData.data.sessionId,
        duration: responseData.data.duration || responseData.processingTime
      };
      
      setResult(result);

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'picsart',
        model: 'upscale-pro-ai',
        prompt: `Upscale de imagem ${parameters.upscale_factor}x formato ${parameters.format}`,
        response: 'Imagem ampliada com sucesso',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: result.duration || 0
      });

      toast({
        title: 'Sucesso!',
        description: `Imagem ampliada em ${(result.duration / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: 'Erro no processamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = async () => {
    if (!result || !selectedFile) return;

    try {
      console.log('🎨 Iniciando download da imagem processada...');
      
      let downloadUrl = '';
      let fileName = '';
      
      // Determine the file extension
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const extension = parameters.format.toLowerCase() === 'jpg' ? 'jpg' : parameters.format.toLowerCase();
      fileName = `${originalName}_upscale_${parameters.upscale_factor}x.${extension}`;
      
      // Try to use the external URL first if available
      if (result.processedImageUrl && result.processedImageUrl.startsWith('http')) {
        console.log('🎨 Usando URL externa para download:', result.processedImageUrl);
        
        try {
          const response = await fetch(result.processedImageUrl);
          if (response.ok) {
            const blob = await response.blob();
            downloadUrl = URL.createObjectURL(blob);
          } else {
            throw new Error('Falha ao baixar da URL externa');
          }
        } catch (urlError) {
          console.warn('⚠️ Falha no download da URL externa, tentando base64...', urlError);
          // Fallback to base64 conversion
        }
      }
      
      // If external URL failed or not available, use base64 data
      if (!downloadUrl && result.processedImageData) {
        console.log('🎨 Convertendo dados base64 para blob...');
        
        let base64Data = result.processedImageData;
        
        // Check if it's a complete data URL or just base64 data
        if (base64Data.startsWith('data:image/')) {
          base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        
        try {
          // Convert base64 to blob using fetch (more reliable)
          const response = await fetch(`data:image/${extension};base64,${base64Data}`);
          const blob = await response.blob();
          downloadUrl = URL.createObjectURL(blob);
        } catch (base64Error) {
          console.error('❌ Erro na conversão base64:', base64Error);
          throw new Error('Falha na conversão dos dados da imagem');
        }
      }
      
      if (!downloadUrl) {
        throw new Error('Nenhuma fonte de dados disponível para download');
      }
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
      
      toast({
        title: 'Download iniciado',
        description: `Sua imagem ampliada (${fileName}) está sendo baixada`,
      });
      
      console.log('✅ Download iniciado com sucesso:', fileName);
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      // Fallback: open in new tab
      if (result.processedImageUrl && result.processedImageUrl.startsWith('http')) {
        console.log('🔄 Abrindo imagem em nova aba como fallback...');
        window.open(result.processedImageUrl, '_blank');
        
        toast({
          title: 'Download alternativo',
          description: 'Imagem aberta em nova aba. Use "Salvar como..." para baixar',
        });
      } else {
        toast({
          title: 'Erro no download',
          description: error instanceof Error ? error.message : 'Não foi possível baixar a imagem',
          variant: 'destructive',
        });
      }
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    setProgress(0);
    setParameters({
      upscale_factor: 2,
      format: 'PNG'
    });
    
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ZoomIn className="w-6 h-6 text-muted-foreground" />
            <CardTitle className="text-2xl">Upscale PRO</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Amplie suas imagens até 8x com qualidade profissional
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">
              <CreditCard className="w-3 h-3 mr-1" />
              4 créditos por uso
            </Badge>
            <Badge variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Ampliação até 8x
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Selecionar Imagem
            </Label>
            
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(1)} MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Clique para fazer upload ou arraste a imagem aqui
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG, WEBP até 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Input
              id="file-upload"
              type="file"
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Parameters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="upscale-factor">Fator de Ampliação</Label>
              <Select 
                value={parameters.upscale_factor.toString()} 
                onValueChange={(value) => setParameters(prev => ({ ...prev, upscale_factor: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x (Dobrar tamanho)</SelectItem>
                  <SelectItem value="3">3x (Triplicar tamanho)</SelectItem>
                  <SelectItem value="4">4x (Quadruplicar tamanho)</SelectItem>
                  <SelectItem value="6">6x (6 vezes maior)</SelectItem>
                  <SelectItem value="8">8x (8 vezes maior)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato de Saída</Label>
              <Select 
                value={parameters.format} 
                onValueChange={(value: 'PNG' | 'JPG' | 'WEBP') => setParameters(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PNG">PNG (Melhor qualidade)</SelectItem>
                  <SelectItem value="JPG">JPG (Menor tamanho)</SelectItem>
                  <SelectItem value="WEBP">WEBP (Moderno)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium">Processando imagem...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Result */}
          {result && result.processedImageData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Processamento concluído!</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Imagem Original</Label>
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full max-h-48 object-contain border rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Imagem Ampliada ({parameters.upscale_factor}x)</Label>
                  <img
                    src={result.processedImageData}
                    alt="Processed"
                    className="w-full max-h-48 object-contain border rounded-lg mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={processImage}
              disabled={!selectedFile || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <ButtonLoader />
                  Processando...
                </>
              ) : (
                <>
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Ampliar Imagem
                </>
              )}
            </Button>

            {result && (
              <Button
                onClick={downloadResult}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Resultado
              </Button>
            )}

            <Button
              onClick={resetTool}
              variant="outline"
              className="sm:w-auto"
            >
              Resetar
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>• Ampliação máxima: 8x • Formatos suportados: PNG, JPG, WEBP</p>
            <p>• Tamanho máximo: 10MB • Custo: 4 créditos por processamento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}