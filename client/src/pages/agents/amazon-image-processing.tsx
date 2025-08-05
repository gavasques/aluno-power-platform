import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Download, RotateCcw, Image as ImageIcon, Target, Package } from 'lucide-react';
import { useLocation } from 'wouter';

interface FileSlot {
  file: File | null;
  preview: string | null;
  error: string | null;
}

interface ProcessedResult {
  url?: string;
  id?: string;
  status?: string;
  message?: string;
}

export default function AmazonImageProcessing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State para slots de imagens
  const [targetImages, setTargetImages] = useState<FileSlot[]>(
    Array(4).fill(null).map(() => ({ file: null, preview: null, error: null }))
  );
  const [baseImages, setBaseImages] = useState<FileSlot[]>(
    Array(4).fill(null).map(() => ({ file: null, preview: null, error: null }))
  );
  
  // State para campos de texto
  const [sellingPoints, setSellingPoints] = useState('');
  const [productDescription, setProductDescription] = useState('');
  
  // State para processamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  
  // Refs para inputs de arquivo
  const targetInputRefs = useRef<(HTMLInputElement | null)[]>(Array(4).fill(null));
  const baseInputRefs = useRef<(HTMLInputElement | null)[]>(Array(4).fill(null));

  // Validação de arquivo
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minSize = 1024; // 1KB

    if (!validTypes.includes(file.type)) {
      return 'Formato não suportado. Use JPG, JPEG, PNG ou WEBP.';
    }
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Máximo 5MB.';
    }
    if (file.size < minSize) {
      return 'Arquivo muito pequeno. Mínimo 1KB.';
    }
    return null;
  };

  // Handle upload de arquivo
  const handleFileUpload = (
    file: File, 
    index: number, 
    type: 'target' | 'base'
  ) => {
    const error = validateFile(file);
    
    if (error) {
      const updateFunction = type === 'target' ? setTargetImages : setBaseImages;
      updateFunction(prev => {
        const newImages = [...prev];
        newImages[index] = { file: null, preview: null, error };
        return newImages;
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const updateFunction = type === 'target' ? setTargetImages : setBaseImages;
      updateFunction(prev => {
        const newImages = [...prev];
        newImages[index] = {
          file,
          preview: e.target?.result as string,
          error: null
        };
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: 'target' | 'base'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, index, type);
    }
  };

  // Remove arquivo
  const removeFile = (index: number, type: 'target' | 'base') => {
    const updateFunction = type === 'target' ? setTargetImages : setBaseImages;
    const inputRefs = type === 'target' ? targetInputRefs : baseInputRefs;
    
    updateFunction(prev => {
      const newImages = [...prev];
      newImages[index] = { file: null, preview: null, error: null };
      return newImages;
    });

    if (inputRefs.current[index]) {
      inputRefs.current[index]!.value = '';
    }
  };

  // Reset tudo
  const resetAll = () => {
    setTargetImages(Array(4).fill(null).map(() => ({ file: null, preview: null, error: null })));
    setBaseImages(Array(4).fill(null).map(() => ({ file: null, preview: null, error: null })));
    setSellingPoints('');
    setProductDescription('');
    setProcessedResult(null);
    
    // Limpar inputs de arquivo
    [...targetInputRefs.current, ...baseInputRefs.current].forEach(input => {
      if (input) input.value = '';
    });
  };

  // Processar imagens
  const processImages = async () => {
    // Validação - pelo menos uma imagem target e uma base
    const hasTargetImage = targetImages.some(slot => slot.file);
    const hasBaseImage = baseImages.some(slot => slot.file);

    if (!hasTargetImage) {
      toast.error('Pelo menos uma imagem de análise é obrigatória');
      return;
    }

    if (!hasBaseImage) {
      toast.error('Pelo menos uma imagem do produto é obrigatória');
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar FormData
      const formData = new FormData();

      // Adicionar imagens target
      targetImages.forEach((slot, index) => {
        if (slot.file) {
          formData.append(`target_image_${index + 1}`, slot.file);
        }
      });

      // Adicionar imagens base
      baseImages.forEach((slot, index) => {
        if (slot.file) {
          formData.append(`base_image_${index + 1}`, slot.file);
        }
      });

      // Adicionar campos de texto se preenchidos
      if (sellingPoints.trim()) {
        formData.append('selling_points', sellingPoints.trim());
      }
      if (productDescription.trim()) {
        formData.append('product_description', productDescription.trim());
      }

      console.log('🚀 [IMAGE_PROCESSING] Enviando para processamento...');

      // Configurar timeout de 10 minutos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos

      const response = await fetch('/api/agents/amazon-image-processing/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Erro no processamento';
        
        switch (response.status) {
          case 400: errorMessage = 'Dados inválidos enviados'; break;
          case 401: errorMessage = 'Não autorizado'; break;
          case 403: errorMessage = 'Acesso negado'; break;
          case 404: errorMessage = 'Serviço não encontrado'; break;
          case 413: errorMessage = 'Arquivos muito grandes'; break;
          case 415: errorMessage = 'Tipo de arquivo não suportado'; break;
          case 429: errorMessage = 'Muitas requisições'; break;
          case 500: errorMessage = 'Erro interno do servidor'; break;
          case 502:
          case 503: errorMessage = 'Serviço temporariamente indisponível'; break;
          default: errorMessage = `Erro ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ [IMAGE_PROCESSING] Resultado recebido:', result);

      // Processar diferentes tipos de resposta
      let processedUrl: string | null = null;
      let resultData: ProcessedResult = {};

      if (result.body?.data?.url) {
        processedUrl = result.body.data.url;
        resultData = { url: processedUrl, id: result.body.data.id, status: 'success' };
      } else if (result.data?.url) {
        processedUrl = result.data.url;
        resultData = { url: processedUrl, id: result.data.id, status: 'success' };
      } else if (result.url) {
        processedUrl = result.url;
        resultData = { url: processedUrl, status: 'success' };
      } else if (result.body?.status === 'success') {
        resultData = { status: 'success', message: 'Processamento concluído com sucesso' };
      } else if (typeof result === 'string' && result.startsWith('http')) {
        processedUrl = result;
        resultData = { url: processedUrl, status: 'success' };
      }

      setProcessedResult(resultData);

      if (processedUrl) {
        toast.success('Imagem processada com sucesso!');
      } else {
        toast.success('Processamento concluído!');
      }

    } catch (error: any) {
      console.error('❌ [IMAGE_PROCESSING] Erro:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Timeout: Processamento demorou mais que 10 minutos');
      } else {
        toast.error(error.message || 'Erro no processamento');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Download da imagem processada
  const downloadImage = async () => {
    if (!processedResult?.url) return;

    try {
      const response = await fetch(processedResult.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `amazon-processed-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Erro no download');
    }
  };

  // Render de slot de imagem
  const renderImageSlot = (
    slot: FileSlot,
    index: number,
    type: 'target' | 'base',
    label: string,
    required: boolean = false
  ) => {
    const inputRefs = type === 'target' ? targetInputRefs : baseInputRefs;
    
    return (
      <div key={index} className="space-y-2">
        <Label className="flex items-center gap-2">
          {type === 'target' ? <Target className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          {label}
          {required && <Badge variant="destructive" className="text-xs">Obrigatória</Badge>}
        </Label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors">
          {slot.preview ? (
            <div className="relative">
              <img 
                src={slot.preview} 
                alt={label}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeFile(index, type)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div className="text-sm text-gray-500">
                Clique ou arraste uma imagem
              </div>
              <div className="text-xs text-gray-400">
                JPG, PNG, WEBP • Máx. 5MB
              </div>
            </div>
          )}
          
          <input
            ref={el => inputRefs.current[index] = el}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleInputChange(e, index, type)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        {slot.error && (
          <Alert variant="destructive">
            <AlertDescription>{slot.error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/agentes')}
          className="mb-4"
        >
          ← Voltar para Agentes
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-emerald-500 rounded-lg">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Copiador de Fotos</h1>
            <p className="text-gray-600">Copie e recrie fotos com IA para criar versões otimizadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagens Target (Análise) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-500" />
              Imagens Target (Análise)
            </CardTitle>
            <CardDescription>
              Imagens de referência para a IA analisar e usar como base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {targetImages.map((slot, index) => 
              renderImageSlot(
                slot, 
                index, 
                'target', 
                `Análise ${index + 1}`, 
                index === 0
              )
            )}
          </CardContent>
        </Card>

        {/* Imagens Base (Produto) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Imagens Base (Produto)
            </CardTitle>
            <CardDescription>
              Imagens do produto que serão editadas pela IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {baseImages.map((slot, index) => 
              renderImageSlot(
                slot, 
                index, 
                'base', 
                `Ângulo ${index + 1}`, 
                index === 0
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campos de Texto */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
          <CardDescription>
            Dados opcionais para melhorar o processamento da IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="selling-points">Pontos de Venda (máx. 500 caracteres)</Label>
            <Textarea
              id="selling-points"
              placeholder="Ex: Resistente à água, design moderno, fácil instalação..."
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value.slice(0, 500))}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {sellingPoints.length}/500 caracteres
            </div>
          </div>

          <div>
            <Label htmlFor="product-description">Descrição do Produto (máx. 500 caracteres)</Label>
            <Textarea
              id="product-description"
              placeholder="Ex: Suporte para cabeça automotivo com ajuste universal..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value.slice(0, 500))}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {productDescription.length}/500 caracteres
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {processedResult && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-emerald-600">Imagem Processada</CardTitle>
            <CardDescription>
              Resultado do processamento com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedResult.url ? (
              <div className="space-y-4">
                <img 
                  src={processedResult.url} 
                  alt="Imagem processada"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
                <div className="flex justify-center">
                  <Button onClick={downloadImage} className="bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Imagem
                  </Button>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  {processedResult.message || 'Processamento concluído com sucesso!'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 mt-8">
        <Button
          onClick={processImages}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-emerald-600 hover:from-yellow-600 hover:to-emerald-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando... (até 10 min)
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Processar Imagens
            </>
          )}
        </Button>

        <Button
          onClick={resetAll}
          variant="outline"
          disabled={isProcessing}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar Tudo
        </Button>
      </div>

      {/* Aviso sobre timeout */}
      <Alert className="mt-4">
        <AlertDescription>
          <strong>Tempo de processamento:</strong> O processamento pode levar até 10 minutos dependendo da complexidade das imagens. Mantenha a página aberta durante o processo.
        </AlertDescription>
      </Alert>
    </div>
  );
}