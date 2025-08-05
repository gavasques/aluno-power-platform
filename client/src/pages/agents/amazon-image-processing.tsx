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

  // Compressão automática de imagem
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem comprimida
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para JPEG com 85% de qualidade
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            console.log(`🗜️ [COMPRESS] ${file.name}: ${(file.size/1024).toFixed(1)}KB → ${(compressedFile.size/1024).toFixed(1)}KB`);
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle upload de arquivo
  const handleFileUpload = async (
    file: File, 
    index: number, 
    type: 'target' | 'base'
  ) => {
    console.log(`🚀 [UPLOAD] Processing: ${type} slot ${index} - ${file.name}`);
    const error = validateFile(file);
    
    if (error) {
      console.log(`❌ [UPLOAD] Validation error: ${error}`);
      const updateFunction = type === 'target' ? setTargetImages : setBaseImages;
      updateFunction(prev => {
        const newImages = [...prev];
        newImages[index] = { file: null, preview: null, error };
        return newImages;
      });
      return;
    }

    try {
      // Comprimir imagem automaticamente
      const compressedFile = await compressImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`✅ [UPLOAD] File loaded and compressed: ${type} slot ${index}`);
        const updateFunction = type === 'target' ? setTargetImages : setBaseImages;
        updateFunction(prev => {
          const newImages = [...prev];
          newImages[index] = {
            file: compressedFile,
            preview: e.target?.result as string,
            error: null
          };
          console.log(`📦 [UPLOAD] State updated: ${type} slot ${index}`, { hasFile: !!compressedFile, hasPreview: !!e.target?.result });
          return newImages;
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (compressionError) {
      console.error('❌ [COMPRESS] Error compressing image:', compressionError);
      // Fallback: usar arquivo original
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
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: 'target' | 'base'
  ) => {
    const file = e.target.files?.[0];
    console.log(`📎 [UPLOAD] Input change: ${type} slot ${index}`, file?.name);
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
      toast({
        title: "Erro",
        description: 'Pelo menos uma imagem de análise é obrigatória',
        variant: "destructive"
      });
      return;
    }

    if (!hasBaseImage) {
      toast({
        title: "Erro", 
        description: 'Pelo menos uma imagem do produto é obrigatória',
        variant: "destructive"
      });
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
        resultData = { url: processedUrl || undefined, id: result.body.data.id, status: 'success' };
      } else if (result.data?.url) {
        processedUrl = result.data.url;
        resultData = { url: processedUrl || undefined, id: result.data.id, status: 'success' };
      } else if (result.url) {
        processedUrl = result.url;
        resultData = { url: processedUrl || undefined, status: 'success' };
      } else if (result.body?.status === 'success') {
        resultData = { status: 'success', message: 'Processamento concluído com sucesso' };
      } else if (typeof result === 'string' && result.startsWith('http')) {
        processedUrl = result;
        resultData = { url: processedUrl || undefined, status: 'success' };
      }

      setProcessedResult(resultData);

      if (processedUrl) {
        toast({
          title: "Sucesso",
          description: 'Imagem processada com sucesso!'
        });
      } else {
        toast({
          title: "Sucesso", 
          description: 'Processamento concluído!'
        });
      }

    } catch (error: any) {
      console.error('❌ [IMAGE_PROCESSING] Erro:', error);
      
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: 'Processamento demorou mais que 10 minutos',
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || 'Erro no processamento',
          variant: "destructive"
        });
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
      
      toast({
        title: "Sucesso",
        description: 'Download iniciado!'
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: 'Erro no download',
        variant: "destructive"
      });
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
        <Label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          {type === 'target' ? <Target className="w-3 h-3" /> : <Package className="w-3 h-3" />}
          {label}
          {required && <Badge variant="destructive" className="text-xs ml-1">Obrigatória</Badge>}
        </Label>
        
        <div 
          className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-gray-100 relative aspect-square"
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            console.log(`🎯 [DROP] Files dropped on ${type} slot ${index}:`, files.map(f => f.name));
            if (files.length > 0) {
              handleFileUpload(files[0], index, type);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
        >
          {slot.preview ? (
            <div className="relative w-full h-full">
              <img 
                src={slot.preview} 
                alt={label}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                onClick={() => removeFile(index, type)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-1">
              <Upload className="w-6 h-6 text-blue-400" />
              <div className="text-xs text-gray-600 font-medium">
                Clique ou arraste
              </div>
              <div className="text-xs text-gray-400">
                {required ? 'Obrigatório' : 'Opcional'}
              </div>
            </div>
          )}
          
          <input
            ref={el => inputRefs.current[index] = el}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleInputChange(e, index, type)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-slot={`${type}-${index}`}
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
          <div className="p-3 bg-blue-600 rounded-lg">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Copiador de Fotos</h1>
            <p className="text-gray-600">Copie e recrie fotos com IA para criar versões otimizadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagens Target para Análise */}
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Imagens Target para Análise
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Faça upload de imagens que servirão como referência para a IA analisar e aplicar o estilo. A primeira imagem é obrigatória. 
              <br />
              <span className="text-green-600 font-medium">✅ Compressão automática (85% qualidade, conversão JPEG)</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {targetImages.map((slot, index) => 
                renderImageSlot(
                  slot, 
                  index, 
                  'target', 
                  `Análise ${index + 1}`, 
                  index === 0
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Imagens Base do Produto */}
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Imagens Base do Produto
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Envie até 4 imagens do produto em diferentes ângulos que serão editadas pela IA. A primeira imagem é obrigatória.
              <br />
              <span className="text-green-600 font-medium">✅ Compressão automática (85% qualidade, conversão JPEG)</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {baseImages.map((slot, index) => 
                renderImageSlot(
                  slot, 
                  index, 
                  'base', 
                  `Ângulo ${index + 1}`, 
                  index === 0
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição do Produto */}
      <Card className="mt-8 border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Descrição do Produto
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Descreva o que é o produto para ajudar a IA a identificá-lo corretamente (recomendado para produtos específicos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              id="product-description"
              placeholder="Ex: Cadeira de escritório ergonômica, smartphone Android, tênis de corrida, luminária LED..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value.slice(0, 500))}
              className="min-h-[100px] resize-none border-gray-200"
            />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">
                Campo opcional - máximo 500 caracteres - recomendado para melhor identificação
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {productDescription.length}/500
              </span>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Selling Points do Produto
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Opcionalmente, descreva os pontos de venda principais do produto que devem ser destacados na edição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  id="selling-points"
                  placeholder="Ex: Produto premium, durabilidade excepcional, design moderno, eco-friendly, garantia vitalícia..."
                  value={sellingPoints}
                  onChange={(e) => setSellingPoints(e.target.value.slice(0, 500))}
                  className="min-h-[120px] resize-none border-gray-200"
                />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">
                    Campo opcional - máximo 500 caracteres - recomendado para melhor identificação
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {sellingPoints.length}/500
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
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