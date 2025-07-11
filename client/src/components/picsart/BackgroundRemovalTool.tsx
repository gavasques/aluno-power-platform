/**
 * Background Removal Tool - Main Picsart Integration Component
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

  // Process background removal mutation
  const processImageMutation = useMutation({
    mutationFn: async (data: { imageData: string; fileName: string; parameters: BackgroundRemovalParams }) => {
      const formData = new FormData();
      
      // Convert base64 to blob and append as file
      const base64Data = data.imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      formData.append('image', blob, data.fileName);
      formData.append('parameters', JSON.stringify(data.parameters));

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/picsart/background-removal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Processing failed');
      }

      return response.json();
    },
    onMutate: () => {
      setProcessingProgress(10);
      console.log('🎨 [BACKGROUND_REMOVAL] Starting processing...');
    },
    onSuccess: (data) => {
      setResult(data.data);
      setProcessingProgress(100);
      console.log('✅ [BACKGROUND_REMOVAL] Processing completed:', data.data);
      
      toast({
        title: "Processamento concluído!",
        description: `Imagem processada em ${(data.data.processingTime / 1000).toFixed(1)}s`,
      });
    },
    onError: (error) => {
      console.error('❌ [BACKGROUND_REMOVAL] Processing failed:', error);
      
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
    console.log(`📤 [BACKGROUND_REMOVAL] Image selected: ${fileName}`);
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
  const handleStartProcessing = useCallback(() => {
    if (!selectedImage || !fileName) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem primeiro",
        variant: "destructive",
      });
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
              Remova backgrounds de imagens com precisão de IA
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Custo por uso: 2 créditos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Processar
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Resultado
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <ImageUploadComponent
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedImage={selectedImage}
            fileName={fileName}
            disabled={processImageMutation.isPending}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Parâmetros de Processamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Output Type */}
              <div className="space-y-2">
                <Label>Tipo de Saída</Label>
                <Select 
                  value={parameters.output_type} 
                  onValueChange={(value: 'cutout' | 'mask') => handleParameterChange('output_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cutout">Cutout (Imagem sem fundo)</SelectItem>
                    <SelectItem value="mask">Mask (Máscara do objeto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <Label>Escala</Label>
                <Select 
                  value={parameters.scale} 
                  onValueChange={(value: 'fit' | 'fill' | 'auto') => handleParameterChange('scale', value)}
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

              {/* Format */}
              <div className="space-y-2">
                <Label>Formato de Saída</Label>
                <Select 
                  value={parameters.format} 
                  onValueChange={(value: 'PNG' | 'JPG' | 'WEBP') => handleParameterChange('format', value)}
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

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Opções Avançadas</h4>
                
                {/* Auto Center */}
                <div className="flex items-center justify-between">
                  <Label>Centralizar Automaticamente</Label>
                  <Switch
                    checked={parameters.auto_center === 'true'}
                    onCheckedChange={(checked) => handleParameterChange('auto_center', checked ? 'true' : 'false')}
                  />
                </div>

                {/* Background Blur */}
                <div className="space-y-2">
                  <Label>Desfoque do Fundo: {parameters.bg_blur}</Label>
                  <Slider
                    value={[parseInt(parameters.bg_blur)]}
                    onValueChange={(value) => handleParameterChange('bg_blur', value[0].toString())}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Shadow */}
                <div className="flex items-center justify-between">
                  <Label>Adicionar Sombra</Label>
                  <Switch
                    checked={parameters.shadow === 'enabled'}
                    onCheckedChange={(checked) => handleParameterChange('shadow', checked ? 'enabled' : 'disabled')}
                  />
                </div>

                {parameters.shadow === 'enabled' && (
                  <div className="ml-4 space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Selected Image Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imagem Selecionada</h3>
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Original
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma imagem selecionada</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Processing Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Processamento</h3>
              
              <ProcessingStatusComponent
                status={getProcessingStatus()}
                progress={processingProgress}
                processingTime={result?.processingTime}
                creditsUsed={result?.creditsUsed}
                sessionId={result?.sessionId}
                error={processImageMutation.error instanceof Error ? processImageMutation.error.message : undefined}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleStartProcessing}
                  disabled={!selectedImage || processImageMutation.isPending}
                  className="flex-1"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {processImageMutation.isPending ? 'Processando...' : 'Remover Fundo'}
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={processImageMutation.isPending}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="space-y-6">
          <ImageDownloadComponent
            processedImageUrl={result?.processedImageUrl}
            processedImageBase64={result?.processedImageBase64}
            originalFileName={result?.originalFileName || fileName}
            sessionId={result?.sessionId}
            processingTime={result?.processingTime}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundRemovalTool;