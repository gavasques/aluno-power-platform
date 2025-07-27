import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Download, Upload, Zap, Star, Image as ImageIcon, Clock, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";

interface UltraEnhanceParams {
  upscale_factor: number;
  format: 'JPG' | 'PNG' | 'WEBP';
}

interface UltraEnhanceResult {
  processedImageUrl: string;
  processedImageData: string;
  sessionId: string;
  duration: number;
}

interface ProcessingResult {
  success: boolean;
  processedImageData?: string;
  processedImageUrl?: string;
  sessionId?: string;
  duration?: number;
}

export function UltraEnhanceTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [parameters, setParameters] = useState<UltraEnhanceParams>({
    upscale_factor: 2,
    format: 'JPG'
  });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Simulate file input change
    const event = {
      target: {
        files: [file]
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(event);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      console.log('🚀 Iniciando processamento Ultra Enhance:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        parameters
      });

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('upscale_factor', parameters.upscale_factor.toString());
      formData.append('format', parameters.format);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/picsart/ultra-enhance', {
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
      console.log('🔍 Response data received:', responseData);
      
      // The backend returns data within a "data" wrapper
      const result: ProcessingResult = {
        success: responseData.success,
        processedImageData: responseData.data?.processedImageData,
        processedImageUrl: responseData.data?.processedImageUrl,
        sessionId: responseData.data?.sessionId,
        duration: responseData.data?.duration || responseData.processingTime
      };
      
      console.log('🎨 Processed result:', result);
      console.log('🖼️ Image data length:', result.processedImageData?.length);
      console.log('🔗 Image URL:', result.processedImageUrl);
      setResult(result);

      // Registrar log de uso com dedução automática de créditos
      const logResponse = await fetch('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          userId: 2, // Placeholder - should come from auth context
          provider: 'picsart',
          model: 'ultra-enhance-ai',
          prompt: `Ultra Enhance de imagem ${parameters.upscale_factor}x formato ${parameters.format}`,
          response: 'Imagem ampliada com sucesso',
          promptCharacters: 50,
          responseCharacters: 27,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
          duration: result.duration || 0,
          creditsUsed: 0,
          feature: 'tools.ultra_enhance'
        })
      });

      if (logResponse.ok) {
        const logData = await logResponse.json();
        console.log('💾 Log AI salvo - Feature: tools.ultra_enhance, Créditos: 4, Usuário: 2');
      }

      toast({
        title: "Sucesso!",
        description: `Imagem melhorada com sucesso! Factor: ${parameters.upscale_factor}x`,
      });

    } catch (error) {
      console.error('❌ Ultra enhance error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar imagem",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadProcessedImage = () => {
    if (!result) return;

    console.log('📥 Iniciando download da imagem processada...');
    console.log('🔍 Dados disponíveis:', {
      hasProcessedImageData: !!result.processedImageData,
      hasProcessedImageUrl: !!result.processedImageUrl,
      dataLength: result.processedImageData?.length,
      url: result.processedImageUrl
    });

    const link = document.createElement('a');
    
    if (result.processedImageData) {
      // Usar dados base64 se disponíveis
      const imageData = result.processedImageData.startsWith('data:') 
        ? result.processedImageData 
        : `data:image/${parameters.format.toLowerCase()};base64,${result.processedImageData}`;
      link.href = imageData;
      console.log('💾 Download usando dados base64');
    } else if (result.processedImageUrl) {
      // Fallback para URL se base64 não estiver disponível
      link.href = result.processedImageUrl;
      console.log('💾 Download usando URL externa');
    } else {
      console.error('❌ Nenhum dado de imagem disponível para download');
      toast({
        title: "Erro no Download",
        description: "Imagem processada não está disponível",
        variant: "destructive",
      });
      return;
    }

    link.download = `ultra_enhanced_${parameters.upscale_factor}x_${selectedFile?.name || 'image'}.${parameters.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Download iniciado com sucesso');
    toast({
      title: "Download Iniciado",
      description: `Imagem melhorada ${parameters.upscale_factor}x baixada com sucesso`,
    });
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Ultra Melhorador PRO</h2>
            </div>
            <p className="text-muted-foreground">
              Melhore e amplie suas imagens com IA de última geração
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">
                <CreditCard className="w-3 h-3 mr-1" />
                4 créditos por uso
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para o melhoramento da imagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label>Selecionar Imagem</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Clique ou arraste uma imagem aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP até 10MB
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTool}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upscale_factor">Fator de Ampliação</Label>
                <Select
                  value={parameters.upscale_factor.toString()}
                  onValueChange={(value) => setParameters(prev => ({ ...prev, upscale_factor: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2x - Dobro do tamanho</SelectItem>
                    <SelectItem value="3">3x - Triplo do tamanho</SelectItem>
                    <SelectItem value="4">4x - Quatro vezes maior</SelectItem>
                    <SelectItem value="6">6x - Seis vezes maior</SelectItem>
                    <SelectItem value="8">8x - Oito vezes maior</SelectItem>
                    <SelectItem value="10">10x - Dez vezes maior</SelectItem>
                    <SelectItem value="12">12x - Doze vezes maior</SelectItem>
                    <SelectItem value="16">16x - Dezesseis vezes maior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato da Saída</Label>
                <Select
                  value={parameters.format}
                  onValueChange={(value) => setParameters(prev => ({ ...prev, format: value as 'JPG' | 'PNG' | 'WEBP' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPG">JPG - Menor tamanho</SelectItem>
                    <SelectItem value="PNG">PNG - Melhor qualidade</SelectItem>
                    <SelectItem value="WEBP">WEBP - Balanceado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Process Button */}
            <Button
              onClick={processImage}
              disabled={!selectedFile || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <ButtonLoader />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Melhorar Imagem
                </>
              )}
            </Button>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Melhorando imagem... {progress}%
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Preview/Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Visualização
            </CardTitle>
            <CardDescription>
              Prévia da imagem original e resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewUrl && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagem Original</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-60 object-contain"
                    />
                  </div>
                </div>

                {result && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Imagem Melhorada ({parameters.upscale_factor}x)
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      {result.processedImageData ? (
                        <img
                          src={result.processedImageData.startsWith('data:') 
                            ? result.processedImageData 
                            : `data:image/${parameters.format.toLowerCase()};base64,${result.processedImageData}`}
                          alt="Enhanced"
                          className="w-full h-auto max-h-60 object-contain"
                          onError={(e) => {
                            console.error('❌ Erro ao carregar imagem base64');
                            // Fallback para URL se base64 falhar
                            if (result.processedImageUrl) {
                              console.log('🔄 Tentando carregar da URL:', result.processedImageUrl);
                              e.currentTarget.src = result.processedImageUrl;
                            }
                          }}
                        />
                      ) : result.processedImageUrl ? (
                        <img
                          src={result.processedImageUrl}
                          alt="Enhanced"
                          className="w-full h-auto max-h-60 object-contain"
                          onError={() => console.error('❌ Erro ao carregar imagem da URL')}
                        />
                      ) : (
                        <div className="w-full h-60 bg-gray-100 border rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">Imagem não disponível</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Melhoramento concluído
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        {(result.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                    <Button
                      onClick={downloadProcessedImage}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Imagem Melhorada
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!previewUrl && (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma imagem para ver a visualização</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}