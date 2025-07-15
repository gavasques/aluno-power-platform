import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Upload, CheckCircle, ArrowRight, Image, Download } from 'lucide-react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

interface ProductData {
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  effortLevel: 'normal' | 'high';
}

interface ConceptData {
  id: string;
  title: string;
  subtitle: string;
  focusType: string;
  keyPoints: string[];
  colorPalette: Record<string, string>;
  layoutSpecs: Record<string, any>;
  recommended: boolean;
}

interface InfographicSession {
  step: 'input' | 'concepts' | 'prompt' | 'generating' | 'completed';
  productData?: ProductData;
  analysisId?: string;
  concepts?: ConceptData[];
  selectedConceptId?: string;
  generationId?: string;
  finalImageUrl?: string;
  imageFile?: File;
}

export default function AdvancedInfographicGenerator() {
  const { toast } = useToast();
  const [session, setSession] = useState<InfographicSession>({ step: 'input' });
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [effortLevel, setEffortLevel] = useState('normal');

  // Fetch categories for dropdown
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: true
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 25MB",
          variant: "destructive"
        });
        return;
      }

      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  };

  // Step 1: Analyze product and generate concepts
  const analyzeProduct = async (productData: ProductData) => {
    setLoading(true);
    toast({
      title: "Analisando produto...",
      description: "Aguarde, estamos analisando os dados e a foto do produto com IA"
    });
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch('/api/infographics/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Falha na análise do produto');
      }

      const result = await response.json();
      
      setSession({
        step: 'concepts',
        productData,
        analysisId: result.analysisId,
        concepts: result.concepts
      });

      toast({
        title: "Análise concluída!",
        description: `${result.concepts.length} conceitos foram gerados para seu produto`
      });

    } catch (error: any) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate optimized prompt
  const generatePrompt = async (conceptId: string) => {
    if (!uploadedImage) {
      toast({
        title: "Imagem obrigatória",
        description: "Upload uma imagem de referência antes de continuar",
        variant: "destructive"
      });
      return;
    }

    // Mostrar modal de processamento
    setShowProcessingModal(true);
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      // Primeira etapa: gerar prompt otimizado
      const formData = new FormData();
      formData.append('analysisId', session.analysisId!);
      formData.append('conceptId', conceptId);
      formData.append('image', uploadedImage);

      const promptResponse = await fetch('/api/infographics/generate-prompt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!promptResponse.ok) {
        const error = await promptResponse.json();
        throw new Error(error.details || 'Falha na geração do prompt');
      }

      const promptResult = await promptResponse.json();

      // Fechar modal e ir direto para a etapa de geração
      setShowProcessingModal(false);
      setSession(prev => ({
        ...prev,
        step: 'generating',
        selectedConceptId: conceptId,
        generationId: promptResult.generationId
      }));

      // Segunda etapa: gerar infográfico automaticamente
      const generateResponse = await fetch('/api/infographics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          generationId: promptResult.generationId
        })
      });

      if (!generateResponse.ok) {
        const error = await generateResponse.json();
        throw new Error(error.details || 'Falha na geração do infográfico');
      }

      const generateResult = await generateResponse.json();
      
      setSession(prev => ({
        ...prev,
        step: 'completed',
        finalImageUrl: generateResult.finalImageUrl
      }));

      toast({
        title: "Infográfico criado com sucesso!",
        description: "Seu infográfico profissional está pronto para download"
      });

    } catch (error: any) {
      console.error('Error in full process:', error);
      setShowProcessingModal(false);
      toast({
        title: "Erro no processamento",
        description: error.message,
        variant: "destructive"
      });
      setSession(prev => ({ ...prev, step: 'concepts' }));
    } finally {
      setLoading(false);
    }
  };

  const startNewGeneration = () => {
    setSession({ step: 'input' });
    setUploadedImage(null);
    setImagePreview(null);
  };

  const downloadImage = () => {
    if (session.finalImageUrl) {
      const link = document.createElement('a');
      link.href = session.finalImageUrl;
      link.download = `infografico-${session.productData?.name || 'produto'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStepProgress = () => {
    switch (session.step) {
      case 'input': return 0;
      case 'concepts': return 25;
      case 'prompt': return 50;
      case 'generating': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <PermissionGuard 
      featureCode="agents.advanced_infographic"
      showMessage={true}
      message="Você não tem permissão para usar o Gerador Avançado de Infográficos."
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerador Avançado de Infográficos
        </h1>
        <p className="text-gray-600">
          Sistema inteligente de 3 etapas para criar infográficos profissionais para Amazon
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Dados do Produto</span>
            <span>Conceitos</span>
            <span>Prompt Otimizado</span>
            <span>Gerando</span>
            <span>Concluído</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
      </div>

      {/* Step 1: Product Input */}
      {session.step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              Dados do Produto
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[24px]">
              Forneça as informações do seu produto para análise e geração de conceitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    placeholder="Ex: Fone de Ouvido Bluetooth Premium"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    maxLength={120}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory} data-category-select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Input
                    id="targetAudience"
                    placeholder="Ex: Profissionais de escritório, jovens urbanos"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    maxLength={150}
                  />
                </div>

                <div>
                  <Label htmlFor="effortLevel">Nível de Esforço</Label>
                  <Select value={effortLevel} onValueChange={setEffortLevel} data-effort-select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal ($)</SelectItem>
                      <SelectItem value="high">Alto ($$$$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-red-600">
                    Imagem do Produto (OBRIGATÓRIO) *
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Esta imagem será usada como referência pelo GPT-Image-1
                  </p>
                  
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Clique para fazer upload da imagem
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG, WebP • Máx. 25MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente seu produto, incluindo características, benefícios, diferenciais, materiais, etc."
                    className="min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 2000 caracteres</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                const productData: ProductData = {
                  name: productName,
                  description: description,
                  category: category || 'E-commerce General',
                  targetAudience: targetAudience,
                  effortLevel: effortLevel as 'normal' | 'high'
                };
                
                if (!productData.name.trim() || !productData.description.trim() || !uploadedImage) {
                  toast({
                    title: "Campos obrigatórios",
                    description: "Preencha nome, descrição e faça upload da imagem",
                    variant: "destructive"
                  });
                  return;
                }
                
                analyzeProduct(productData);
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando produto...
                </>
              ) : (
                <>
                  Analisar Produto e Gerar Conceitos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Concept Selection */}
      {session.step === 'concepts' && session.concepts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              Escolha o Conceito
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[24px]">
              Selecione o conceito que melhor representa seu produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {session.concepts.map((concept) => (
                <Card 
                  key={concept.id} 
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    concept.recommended 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => generatePrompt(concept.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{concept.title}</CardTitle>
                      {concept.recommended && (
                        <Badge variant="default" className="bg-green-500">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{concept.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Foco:</p>
                      <p className="text-sm text-gray-600">{concept.focusType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pontos-chave:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {concept.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx}>• {point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: concept.colorPalette.primaria }}
                        title="Cor primária"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: concept.colorPalette.secundaria }}
                        title="Cor secundária"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: concept.colorPalette.destaque }}
                        title="Cor de destaque"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generating */}
      {session.step === 'generating' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              Gerando Infográfico
            </CardTitle>
            <CardDescription>
              Aguarde enquanto criamos seu infográfico profissional
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Criando seu infográfico...</h3>
            <p className="text-gray-600 mb-4">
              Este processo pode levar até 2 minutos para garantir a melhor qualidade
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Completed */}
      {session.step === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
              Infográfico Concluído
            </CardTitle>
            <CardDescription>
              Seu infográfico profissional está pronto para uso na Amazon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.finalImageUrl && (
              <div className="border rounded-lg p-4">
                <img
                  src={session.finalImageUrl}
                  alt="Infográfico gerado"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={downloadImage} size="lg">
                <Download className="mr-2 h-4 w-4" />
                Baixar PNG
              </Button>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={startNewGeneration}>
                Criar Novo Infográfico
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Processamento */}
      <Dialog open={showProcessingModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando Conceito
            </DialogTitle>
            <DialogDescription>
              Aguarde enquanto analisamos sua imagem e otimizamos o prompt para criação do infográfico
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="relative w-16 h-16 mb-4">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Analisando conceito selecionado...</p>
              <p className="text-sm text-gray-600">Este processo pode levar alguns segundos</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  );
}