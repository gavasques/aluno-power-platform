import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Upload, Download, Wand2, ImageIcon, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { useCreditSystem } from '@/hooks/useCreditSystem';
import { ButtonLoader } from '@/components/common/LoadingSpinner';

export default function LifestyleWithModel() {
  const [formData, setFormData] = useState({
    produtoNome: '',
    ambiente: '',
    sexo: '',
    faixaEtariaInicio: '',
    faixaEtariaFim: '',
    acao: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    originalImage: string;
    processedImage: string;
    processingTime: number;
    cost: number;
    credits?: number;
    webhookSent?: boolean;
    webhookResponse?: any;
  } | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  const FEATURE_CODE = 'agents.lifestyle_model';

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 25MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadImage = async (url: string, filename: string = 'lifestyle-image.png') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: 'Download concluído',
        description: 'A imagem foi baixada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const generateImage = async () => {
    if (!selectedImage || !formData.produtoNome.trim() || !formData.ambiente.trim() || 
        !formData.sexo || !formData.faixaEtariaInicio || !formData.faixaEtariaFim || !formData.acao.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos e selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setProcessingTime(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(selectedImage);
      });

      // Prepare variables for the prompt
      const faixaEtaria = `${formData.faixaEtariaInicio} a ${formData.faixaEtariaFim} anos`;
      
      const variables = {
        PRODUTO_NOME: formData.produtoNome,
        AMBIENTE: formData.ambiente,
        SEXO: formData.sexo,
        FAIXA_ETARIA: faixaEtaria,
        ACAO: formData.acao
      };

      console.log('🔍 [FRONTEND] Sending data directly to N8N webhook:', {
        imageLength: base64.length,
        variables
      });

      // Convert base64 image to blob for FormData
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
      
      // Prepare FormData for N8N webhook
      const webhookData = new FormData();
      
      // Add the image file
      webhookData.append('image', imageBlob, 'lifestyle-image.jpg');
      
      // Add user data (you might need to get this from auth context)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      webhookData.append('userId', user.id?.toString() || '');
      webhookData.append('userName', user.name || '');
      webhookData.append('userEmail', user.email || '');
      webhookData.append('agentType', 'lifestyle-with-model');
      webhookData.append('timestamp', new Date().toISOString());
      
      // Add all variables as separate form fields
      webhookData.append('produtoNome', variables.PRODUTO_NOME || '');
      webhookData.append('ambiente', variables.AMBIENTE || '');
      webhookData.append('sexo', variables.SEXO || '');
      webhookData.append('faixaEtaria', variables.FAIXA_ETARIA || '');
      webhookData.append('acao', variables.ACAO || '');

      // Send directly to N8N webhook
      const webhookResponse = await fetch('https://webhook.guivasques.app/webhook/lifestyle-with-model', {
        method: 'POST',
        body: webhookData,
        headers: {
          'User-Agent': 'AI-Platform-Webhook/1.0'
        }
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      // Handle webhook response - prioritize binary image response
      const contentType = webhookResponse.headers.get('content-type');
      const contentLength = webhookResponse.headers.get('content-length');
      let processedImageUrl: string | null = null;

      console.log('🔍 [WEBHOOK] Response headers:', {
        contentType,
        contentLength,
        status: webhookResponse.status,
        statusText: webhookResponse.statusText
      });

      // First try to handle as binary image (most common case for image generation)
      try {
        const imageArrayBuffer = await webhookResponse.arrayBuffer();
        
        // Check if it's likely an image based on size and content
        if (imageArrayBuffer.byteLength > 1000) { // Images are typically larger than 1KB
          const bytes = new Uint8Array(imageArrayBuffer);
          
          // Check for common image file signatures
          const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8;
          const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
          const isWebP = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
          
          if (isJPEG || isPNG || isWebP || contentType?.includes('image/')) {
            let binaryString = '';
            for (let i = 0; i < bytes.length; i++) {
              binaryString += String.fromCharCode(bytes[i]);
            }
            const imageBase64 = btoa(binaryString);
            const mimeType = isJPEG ? 'image/jpeg' : isPNG ? 'image/png' : isWebP ? 'image/webp' : (contentType || 'image/jpeg');
            processedImageUrl = `data:${mimeType};base64,${imageBase64}`;
            
            console.log('🖼️ [WEBHOOK] Binary image detected and processed:', {
              mimeType,
              size: bytes.length,
              isJPEG,
              isPNG,
              isWebP
            });
          } else {
            // Try to parse as text/JSON if not an image
            const decoder = new TextDecoder();
            const textResponse = decoder.decode(bytes);
            
            try {
              const responseData = JSON.parse(textResponse);
              // Handle nested response structure from webhook
              processedImageUrl = responseData?.body?.data?.url || 
                                responseData?.data?.url || 
                                responseData?.processedImage || 
                                responseData?.imageUrl || 
                                responseData?.url || null;
              console.log('📄 [WEBHOOK] JSON response parsed:', responseData);
            } catch {
              console.log('📄 [WEBHOOK] Raw text response:', textResponse.substring(0, 200));
              throw new Error(textResponse || 'Unknown error from webhook');
            }
          }
        } else {
          // Small response, probably text or JSON
          const decoder = new TextDecoder();
          const textResponse = decoder.decode(new Uint8Array(imageArrayBuffer));
          
          try {
            const responseData = JSON.parse(textResponse);
            // Handle nested response structure from webhook
            processedImageUrl = responseData?.body?.data?.url || 
                              responseData?.data?.url || 
                              responseData?.processedImage || 
                              responseData?.imageUrl || 
                              responseData?.url || null;
            console.log('📄 [WEBHOOK] Small JSON response:', responseData);
          } catch {
            console.log('📄 [WEBHOOK] Small text response:', textResponse);
            throw new Error(textResponse || 'Unknown error from webhook');
          }
        }
      } catch (error) {
        console.error('❌ [WEBHOOK] Error processing response:', error);
        throw error;
      }

      const response = {
        success: true,
        originalImage: `data:image/jpeg;base64,${base64}`,
        processedImage: processedImageUrl,
        processingTime: Math.round((Date.now() - startTime) / 1000),
        webhookSent: true
      };

      clearInterval(timer);
      setResult(response);

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'lifestyle-with-model',
        model: 'lifestyle-ai-generator',
        prompt: `Produto: ${formData.produtoNome}, Ambiente: ${formData.ambiente}`,
        response: 'Imagem lifestyle gerada com sucesso via N8N webhook',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0.167,
        duration: response.processingTime || 0
      });
      
      toast({
        title: 'Sucesso!',
        description: 'Imagem lifestyle gerada com sucesso.',
      });

    } catch (error: any) {
      clearInterval(timer);
      console.error('Error processing image:', error);
      toast({
        title: 'Erro no processamento',
        description: error?.message || 'Não foi possível processar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      produtoNome: '',
      ambiente: '',
      sexo: '',
      faixaEtariaInicio: '',
      faixaEtariaFim: '',
      acao: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setProcessingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Imagem - Lifestyle com Modelo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transforme produtos em imagens lifestyle profissionais com modelos reais em ambientes naturais de uso
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Importante:</strong> As imagens geradas têm resolução 1024x1024px. Para uso na Amazon, recomendamos fazer upscale 2x para atingir 2048x2048px.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload da Imagem
                </CardTitle>
                <CardDescription>
                  Selecione a imagem do produto que será editada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Clique para selecionar uma imagem</p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG, WEBP até 25MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          Remover
                        </Button>
                      </div>
                      {selectedImage && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Arquivo:</span> {selectedImage.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tamanho:</span> {formatFileSize(selectedImage.size)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Imagem Lifestyle</CardTitle>
                <CardDescription>
                  Preencha os campos para personalizar a imagem lifestyle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="produtoNome">Nome do Produto *</Label>
                  <Input
                    id="produtoNome"
                    value={formData.produtoNome}
                    onChange={(e) => setFormData(prev => ({ ...prev, produtoNome: e.target.value }))}
                    placeholder="Ex: Fone de ouvido bluetooth premium"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ambiente">Ambiente *</Label>
                  <Input
                    id="ambiente"
                    value={formData.ambiente}
                    onChange={(e) => setFormData(prev => ({ ...prev, ambiente: e.target.value }))}
                    placeholder="Ex: Escritório, Cozinha, Quarto, Parque, Academia..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo do Modelo *</Label>
                  <Select value={formData.sexo} onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homem">Homem</SelectItem>
                      <SelectItem value="Mulher">Mulher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Faixa Etária *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Input
                        type="number"
                        value={formData.faixaEtariaInicio}
                        onChange={(e) => setFormData(prev => ({ ...prev, faixaEtariaInicio: e.target.value }))}
                        placeholder="De"
                        min="18"
                        max="80"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={formData.faixaEtariaFim}
                        onChange={(e) => setFormData(prev => ({ ...prev, faixaEtariaFim: e.target.value }))}
                        placeholder="Até"
                        min="18"
                        max="80"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Idade em anos (18-80)</p>
                </div>

                <div>
                  <Label htmlFor="acao">Ação do Modelo *</Label>
                  <Textarea
                    id="acao"
                    value={formData.acao}
                    onChange={(e) => setFormData(prev => ({ ...prev, acao: e.target.value }))}
                    placeholder="Descreva o que o modelo estará fazendo com o produto. Ex: usando o fone de ouvido enquanto trabalha no computador, sorrindo e demonstrando satisfação"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button 
                    onClick={generateImage}
                    disabled={isProcessing || !selectedImage || !formData.produtoNome.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <ButtonLoader size="sm" />
                        Processando... ({processingTime}s)
                      </div>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar Imagem Lifestyle
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={resetForm}>
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {result ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Imagem Lifestyle Gerada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Imagem Original</h4>
                        <div className="relative">
                          <img 
                            src={result.originalImage} 
                            alt="Imagem original"
                            className="w-full h-auto max-h-48 object-contain bg-gray-100 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Imagem Lifestyle</h4>
                        <div className="relative">
                          <img 
                            src={result.processedImage} 
                            alt="Imagem lifestyle processada" 
                            className="w-full h-auto max-h-48 object-contain bg-gray-100 rounded-lg"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-100 text-green-800">
                            1024x1024px
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p><strong>Custo:</strong> ${result.cost.toFixed(3)}</p>
                      <p><strong>Tempo:</strong> {result.processingTime}s</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => downloadImage(result.processedImage)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Imagem
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={resetForm}
                      >
                        Gerar Nova Imagem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Imagem Lifestyle Será Exibida Aqui
                    </h3>
                    <p className="text-gray-500">
                      Complete o formulário e faça upload de uma imagem para gerar uma imagem lifestyle profissional
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}