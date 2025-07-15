/**
 * Background Removal Tool - AI-Powered Background Removal Component
 * 
 * Features:
 * - Complete background removal workflow
 * - Reusable components integration
 * - Real-time processing status
 * - Advanced parameter controls
 * - Credit management
 * - Session tracking
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Settings, Palette, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import { useCreditSystem } from '@/hooks/useCreditSystem';

// Reusable components
import ImageUploadComponent from './ImageUploadComponent';
import ProcessingStatusComponent from './ProcessingStatusComponent';
import ImageDownloadComponent from './ImageDownloadComponent';

interface BackgroundRemovalParams {
  output_type: 'cutout' | 'mask';
  bg_blur: string;
  scale: 'fit' | 'fill' | 'auto';
  auto_center: 'true' | 'false';
  stroke_size: string;
  stroke_color: string;
  stroke_opacity: string;
  shadow: 'disabled' | 'enabled';
  shadow_opacity: string;
  shadow_blur: string;
  format: 'PNG' | 'JPG' | 'WEBP';
}

interface ProcessingResult {
  sessionId: string;
  processedImageUrl: string;
  processedImageBase64: string;
  originalFileName: string;
  parameters: BackgroundRemovalParams;
  creditsUsed: number;
  processingTime: number;
  totalTime: number;
}

const FEATURE_CODE = 'tools.picsart_background_removal';

const BackgroundRemovalTool: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parameters, setParameters] = useState<BackgroundRemovalParams>({
    output_type: 'cutout',
    bg_blur: '0',
    scale: 'fit',
    auto_center: 'false',
    stroke_size: '0',
    stroke_color: 'FFFFFF',
    stroke_opacity: '100',
    shadow: 'disabled',
    shadow_opacity: '20',
    shadow_blur: '50',
    format: 'PNG'
  });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  // Process image mutation
  const processImageMutation = useMutation({
    mutationFn: async ({ imageData, fileName, parameters }: { imageData: string; fileName: string; parameters: BackgroundRemovalParams }) => {
      logger.debug('🚀 [BACKGROUND_REMOVAL] Starting processing...');
      
      const response = await fetch('/api/picsart/background-removal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          imageData,
          fileName,
          parameters
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();
      logger.debug('✅ [BACKGROUND_REMOVAL] Processing completed successfully');
      return data;
    },
    onSuccess: async (data) => {
      setResult(data);
      setProcessingProgress(100);

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'picsart',
        model: 'background-removal-ai',
        prompt: 'Remoção de fundo profissional',
        response: 'Imagem processada com sucesso',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: data.processingTime || 0
      });
      
      toast({
        title: "Processamento concluído",
        description: `Imagem processada com sucesso! Créditos usados: ${data.creditsUsed}`,
      });
    },
    onError: (error) => {
      logger.error('❌ [BACKGROUND_REMOVAL] Processing failed:', error);
      
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    }
  });

  // Handle image selection
  const handleImageSelect = useCallback((imageData: string, fileName: string) => {
    setSelectedImage(imageData);
    setFileName(fileName);
    setResult(null);
    setProcessingProgress(0);
    logger.debug(`📤 [BACKGROUND_REMOVAL] Image selected: ${fileName}`);
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback(() => {
    setSelectedImage('');
    setFileName('');
    setResult(null);
    setProcessingProgress(0);
  }, []);

  // Handle parameter changes
  const handleParameterChange = useCallback((key: keyof BackgroundRemovalParams, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Start processing
  const handleStartProcessing = useCallback(async () => {
    if (!selectedImage || !fileName) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setResult(null);
    setProcessingProgress(0);
    
    // Simulate progress during processing
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    processImageMutation.mutate({
      imageData: selectedImage,
      fileName,
      parameters
    });
  }, [selectedImage, fileName, parameters, processImageMutation, toast]);

  // Get processing status
  const getProcessingStatus = (): 'idle' | 'uploading' | 'processing' | 'completed' | 'failed' => {
    if (processImageMutation.isPending) {
      return processingProgress < 20 ? 'uploading' : 'processing';
    }
    if (processImageMutation.isError) return 'failed';
    if (result) return 'completed';
    return 'idle';
  };

  // Reset tool
  const handleReset = useCallback(() => {
    handleImageRemove();
    processImageMutation.reset();
    setParameters({
      output_type: 'cutout',
      bg_blur: '0',
      scale: 'fit',
      auto_center: 'false',
      stroke_size: '0',
      stroke_color: 'FFFFFF',
      stroke_opacity: '100',
      shadow: 'disabled',
      shadow_opacity: '20',
      shadow_blur: '50',
      format: 'PNG'
    });
  }, [handleImageRemove, processImageMutation]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Remover de Fundo PRO
            </h1>
            <p className="text-gray-600">
              Remova backgrounds de imagens com precisão profissional usando inteligência artificial
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full w-fit mx-auto">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">2 créditos por uso</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Image Upload and Processing */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Upload da Imagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadComponent
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                selectedImage={selectedImage}
                fileName={fileName}
              />
            </CardContent>
          </Card>

          {/* Processing Status */}
          <ProcessingStatusComponent
            status={getProcessingStatus()}
            progress={processingProgress}
            fileName={fileName}
          />

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button
                  onClick={handleStartProcessing}
                  disabled={!selectedImage || processImageMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  {processImageMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Remover Fundo
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                  disabled={processImageMutation.isPending}
                >
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Parameters and Results */}
        <div className="space-y-6">
          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Saída</Label>
                    <Select
                      value={parameters.output_type}
                      onValueChange={(value) => handleParameterChange('output_type', value as 'cutout' | 'mask')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cutout">Recorte (Cutout)</SelectItem>
                        <SelectItem value="mask">Máscara (Mask)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato de Saída</Label>
                    <Select
                      value={parameters.format}
                      onValueChange={(value) => handleParameterChange('format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PNG">PNG (Recomendado)</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                        <SelectItem value="WEBP">WEBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Escala</Label>
                    <Select
                      value={parameters.scale}
                      onValueChange={(value) => handleParameterChange('scale', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Ajustar</SelectItem>
                        <SelectItem value="fill">Preencher</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-center"
                      checked={parameters.auto_center === 'true'}
                      onCheckedChange={(checked) => handleParameterChange('auto_center', checked ? 'true' : 'false')}
                    />
                    <Label htmlFor="auto-center">Centralizar Automaticamente</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Desfoque de Fundo: {parameters.bg_blur}</Label>
                    <Slider
                      value={[parseInt(parameters.bg_blur)]}
                      onValueChange={(value) => handleParameterChange('bg_blur', value[0].toString())}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho da Borda: {parameters.stroke_size}</Label>
                    <Slider
                      value={[parseInt(parameters.stroke_size)]}
                      onValueChange={(value) => handleParameterChange('stroke_size', value[0].toString())}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor da Borda</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={`#${parameters.stroke_color}`}
                        onChange={(e) => handleParameterChange('stroke_color', e.target.value.replace('#', ''))}
                        className="h-10 w-20 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">#{parameters.stroke_color}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Opacidade da Borda: {parameters.stroke_opacity}%</Label>
                    <Slider
                      value={[parseInt(parameters.stroke_opacity)]}
                      onValueChange={(value) => handleParameterChange('stroke_opacity', value[0].toString())}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shadow"
                      checked={parameters.shadow === 'enabled'}
                      onCheckedChange={(checked) => handleParameterChange('shadow', checked ? 'enabled' : 'disabled')}
                    />
                    <Label htmlFor="shadow">Adicionar Sombra</Label>
                  </div>

                  {parameters.shadow === 'enabled' && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div className="space-y-2">
                        <Label>Opacidade da Sombra: {parameters.shadow_opacity}%</Label>
                        <Slider
                          value={[parseInt(parameters.shadow_opacity)]}
                          onValueChange={(value) => handleParameterChange('shadow_opacity', value[0].toString())}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Desfoque da Sombra: {parameters.shadow_blur}</Label>
                        <Slider
                          value={[parseInt(parameters.shadow_blur)]}
                          onValueChange={(value) => handleParameterChange('shadow_blur', value[0].toString())}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageDownloadComponent
                  processedImageUrl={result.processedImageUrl}
                  processedImageBase64={result.processedImageBase64}
                  originalFileName={result.originalFileName}
                  processingTime={result.processingTime}
                  creditsUsed={result.creditsUsed}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalTool;