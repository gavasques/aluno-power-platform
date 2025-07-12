import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ZoomIn, Upload, Clock, Download, Coins } from 'lucide-react';
import ImageUploadComponent from '../background-removal/ImageUploadComponent';
import ProcessingStatusComponent from '../background-removal/ProcessingStatusComponent';
import ImageDownloadComponent from '../background-removal/ImageDownloadComponent';

interface ImageUpscaleParams {
  scale: '2' | '4' | '6' | '8' | '16';
  format?: 'PNG' | 'JPG' | 'WEBP';
}

interface ProcessingResult {
  sessionId: string;
  processedImageUrl: string;
  processedImageBase64: string;
  originalFileName: string;
  parameters: ImageUpscaleParams;
  creditsUsed: number;
  processingTime: number;
  scale: string;
}

const SCALE_OPTIONS = [
  { value: '2', label: '2x (800x600 → 1600x1200)', description: 'Padrão' },
  { value: '4', label: '4x (800x600 → 3200x2400)', description: 'Recomendado' },
  { value: '6', label: '6x (800x600 → 4800x3600)', description: 'Alta qualidade' },
  { value: '8', label: '8x (800x600 → 6400x4800)', description: 'Muito alta' },
  { value: '16', label: '16x (800x600 → 12800x9600)', description: 'Ultra HD' }
];

const FORMAT_OPTIONS = [
  { value: 'PNG', label: 'PNG', description: 'Melhor qualidade' },
  { value: 'JPG', label: 'JPG', description: 'Menor tamanho' },
  { value: 'WEBP', label: 'WEBP', description: 'Otimizado' }
];

export default function ImageUpscaleTool() {
  const [imageData, setImageData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parameters, setParameters] = useState<ImageUpscaleParams>({
    scale: '2',
    format: 'PNG'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps] = useState<number>(4);
  
  const { toast } = useToast();

  const handleImageUpload = (base64Data: string, filename: string) => {
    setImageData(base64Data);
    setFileName(filename);
    setResult(null);
    
    toast({
      title: "Imagem carregada",
      description: `${filename} está pronta para ser processada.`,
      variant: "default"
    });
  };

  const handleImageSelect = (imageData: string, fileName: string) => {
    setImageData(imageData);
    setFileName(fileName);
  };

  const handleImageRemove = () => {
    setImageData('');
    setFileName('');
    setResult(null);
  };

  const handleScaleChange = (value: string) => {
    setParameters(prev => ({
      ...prev,
      scale: value as ImageUpscaleParams['scale']
    }));
  };

  const handleFormatChange = (value: string) => {
    setParameters(prev => ({
      ...prev,
      format: value as ImageUpscaleParams['format']
    }));
  };

  const processImage = async () => {
    if (!imageData) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);
    setResult(null);

    try {
      // Step 1: Validating parameters
      setProcessingStatus('Validando parâmetros...');
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Uploading image
      setProcessingStatus('Enviando imagem para processamento...');
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Processing with AI
      setProcessingStatus(`Melhorando qualidade da imagem ${parameters.scale}x...`);
      setCurrentStep(3);

      const response = await fetch('/api/picsart/image-upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          imageData: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
          fileName,
          parameters
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      // Step 4: Complete
      setProcessingStatus('Processamento concluído!');
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      setResult(data.data);

      toast({
        title: "Sucesso!",
        description: `Imagem aumentada ${parameters.scale}x com qualidade IA! ${data.data.creditsUsed} créditos utilizados.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error processing image:', error);
      
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      });
      
      setProcessingStatus('');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setImageData('');
    setFileName('');
    setResult(null);
    setProcessingStatus('');
    setCurrentStep(0);
    setParameters({
      scale: '2',
      format: 'PNG'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <ZoomIn className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upscale PRO</h1>
            <p className="text-muted-foreground">Aumente a qualidade das suas imagens com IA</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
          <Coins className="h-4 w-4" />
          4 créditos por uso
        </Badge>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Parameters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload da Imagem
              </CardTitle>
              <CardDescription>
                Faça upload da imagem que deseja melhorar (PNG, JPG, WEBP até 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadComponent
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                selectedImage={imageData}
                fileName={fileName}
                maxFileSize={10 * 1024 * 1024}
                supportedFormats={['PNG', 'JPG', 'JPEG', 'WEBP']}
                disabled={isProcessing}
              />
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para o upscale da imagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scale Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fator de Aumento</label>
                <Select value={parameters.scale} onValueChange={handleScaleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCALE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha o fator de aumento da resolução
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato de Saída</label>
                <Select value={parameters.format} onValueChange={handleFormatChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Processing & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Processing Status */}
          {(isProcessing || result) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isProcessing ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  {isProcessing ? 'Processando' : 'Resultado'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessing && (
                  <ProcessingStatusComponent
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    status={processingStatus}
                    onCancel={() => setIsProcessing(false)}
                  />
                )}

                {result && !isProcessing && (
                  <ImageDownloadComponent
                    originalImageData={`data:image/png;base64,${imageData}`}
                    processedImageData={result.processedImageBase64}
                    originalFileName={result.originalFileName}
                    processedFileName={`${result.originalFileName.replace(/\.[^/.]+$/, '')}_upscaled_${parameters.scale}x`}
                    processingTime={result.processingTime}
                    creditsUsed={result.creditsUsed}
                    onStartNew={resetTool}
                    additionalInfo={[
                      { label: 'Aumento', value: `${result.scale}x` },
                      { label: 'Formato', value: parameters.format || 'PNG' }
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          {!result && !isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <button
                  onClick={processImage}
                  disabled={!imageData || isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Melhorar com IA
                  <Badge variant="secondary" className="ml-2">
                    4 créditos
                  </Badge>
                </button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  A imagem será aumentada {parameters.scale}x usando inteligência artificial
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}