import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Sparkles, Zap, AlertTriangle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface InfographicData {
  originalData: {
    nomeProduto: string;
    descricaoLonga: string;
    categoria?: string;
    publicoAlvo?: string;
    corPrimaria?: string;
    corSecundaria?: string;
    quantidadeImagens: number;
    qualidade: 'low' | 'medium' | 'high';
    imagemReferencia?: string;
  };
  etapa1Response?: {
    nome: string;
    beneficios: string;
    especificacoes: string;
    cta: string;
    icons: string;
  };
  processedImages?: string[];
  processingTime?: number;
  cost?: number;
}

export default function InfographicGenerator() {
  const { toast } = useToast();
  
  // Buscar departamentos para o dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
  });

  // Ordenar departamentos alfabeticamente por nome
  const sortedDepartments = Array.isArray(departments) 
    ? [...departments].sort((a: any, b: any) => a.name.localeCompare(b.name))
    : [];
  const [formData, setFormData] = useState({
    nomeProduto: '',
    descricaoLonga: '',
    categoria: '',
    publicoAlvo: '',
    corPrimaria: '#3B82F6',
    corSecundaria: '#10B981',
    quantidadeImagens: 1,
    qualidade: 'high' as 'low' | 'medium' | 'high'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'step1' | 'step2' | 'complete'>('form');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 25MB.",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleGenerateInfographic = async () => {
    if (!formData.nomeProduto.trim() || !formData.descricaoLonga.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do produto e a descrição.",
        variant: "destructive"
      });
      return;
    }

    if (formData.descricaoLonga.length > 2000) {
      toast({
        title: "Descrição muito longa",
        description: "A descrição deve ter no máximo 2000 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep('step1');

    try {
      // Converte imagem para base64 se fornecida
      let imagemBase64 = '';
      if (imageFile) {
        imagemBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(imageFile);
        });
      }

      // Etapa 1: Otimização de texto com Claude Sonnet
      const etapa1Response = await apiRequest('/api/agents/infographic-generator/step1', {
        method: 'POST',
        body: JSON.stringify({
          nomeProduto: formData.nomeProduto,
          descricaoLonga: formData.descricaoLonga,
          categoria: formData.categoria,
          publicoAlvo: formData.publicoAlvo
        })
      }) as any;

      setInfographicData({
        originalData: {...formData, imagemReferencia: imagePreview},
        etapa1Response: etapa1Response.optimizedContent
      });

      setCurrentStep('step2');

      // Etapa 2: Geração de imagem com GPT-Image-1
      const etapa2Response = await apiRequest('/api/agents/infographic-generator/step2', {
        method: 'POST',
        body: JSON.stringify({
          nomeProduto: formData.nomeProduto,
          optimizedContent: etapa1Response.optimizedContent,
          categoria: formData.categoria,
          publicoAlvo: formData.publicoAlvo,
          corPrimaria: formData.corPrimaria,
          corSecundaria: formData.corSecundaria,
          quantidadeImagens: formData.quantidadeImagens,
          qualidade: formData.qualidade,
          imagemReferencia: imagemBase64
        })
      }) as any;

      setInfographicData(prev => ({
        ...prev!,
        processedImages: etapa2Response.images,
        processingTime: etapa2Response.processingTime,
        cost: etapa2Response.cost
      }));

      setCurrentStep('complete');

      toast({
        title: "Infográfico gerado com sucesso!",
        description: `${formData.quantidadeImagens} imagem(ns) processada(s) em ${etapa2Response.processingTime}s`
      });

    } catch (error: any) {
      console.error('Erro ao gerar infográfico:', error);
      
      let errorMessage = "Erro interno do servidor";
      let errorTitle = "Erro no processamento";
      
      if (error.message?.includes('rate limited') || error.message?.includes('limite de rate')) {
        errorTitle = "OpenAI temporariamente indisponível";
        errorMessage = "A OpenAI está com limite de requisições. Aguarde alguns minutos e tente novamente.";
      } else if (error.message?.includes('autenticação')) {
        errorTitle = "Erro de configuração";
        errorMessage = "Problema na configuração da API OpenAI. Entre em contato com o suporte.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
      setCurrentStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `infografico-${formData.nomeProduto.replace(/\s+/g, '-').toLowerCase()}-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setInfographicData(null);
    setCurrentStep('form');
    setFormData({
      nomeProduto: '',
      descricaoLonga: '',
      categoria: '',
      publicoAlvo: '',
      corPrimaria: '#3B82F6',
      corSecundaria: '#10B981',
      quantidadeImagens: 1,
      qualidade: 'high'
    });
  };

  const remainingChars = 2000 - formData.descricaoLonga.length;
  const isDescriptionTooLong = remainingChars < 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Editor de Foto Infográficos</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Crie infográficos profissionais de produtos Amazon com processo de 2 etapas: 
          otimização de texto via Claude Sonnet e geração de imagem via GPT-Image-1
        </p>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Importante: As imagens geradas têm resolução 1024x1024px. Para uso na Amazon, recomendamos fazer upscale 2x para atingir 2048x2048px.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Configuração */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações do Infográfico
              </CardTitle>
              <CardDescription>
                Preencha os campos para personalizar seu infográfico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome do Produto */}
              <div>
                <Label htmlFor="nomeProduto">Nome do Produto *</Label>
                <Input
                  id="nomeProduto"
                  value={formData.nomeProduto}
                  onChange={(e) => handleInputChange('nomeProduto', e.target.value)}
                  placeholder="Ex: Elástico de Resistência Fitness"
                  maxLength={100}
                />
              </div>

              {/* Categoria */}
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedDepartments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Público-Alvo */}
              <div>
                <Label htmlFor="publicoAlvo">Público-Alvo</Label>
                <Input
                  id="publicoAlvo"
                  value={formData.publicoAlvo}
                  onChange={(e) => handleInputChange('publicoAlvo', e.target.value)}
                  placeholder="Ex: Mulheres de 25-45 anos que praticam exercícios em casa"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional: Descreva o público-alvo ideal para este produto
                </p>
              </div>

              {/* Descrição Longa */}
              <div>
                <Label htmlFor="descricaoLonga">
                  Descrição Longa *
                  <span className={`ml-2 text-sm ${isDescriptionTooLong ? 'text-red-500' : remainingChars < 200 ? 'text-amber-500' : 'text-gray-500'}`}>
                    ({remainingChars} caracteres restantes)
                  </span>
                </Label>
                <Textarea
                  id="descricaoLonga"
                  value={formData.descricaoLonga}
                  onChange={(e) => handleInputChange('descricaoLonga', e.target.value)}
                  placeholder="Cole aqui títulos, bullet points, descrição, tudo que tiver do produto..."
                  className={`h-32 ${isDescriptionTooLong ? 'border-red-500' : ''}`}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inclua todas as informações disponíveis: características, benefícios, especificações técnicas, etc.
                </p>
              </div>

              <Separator />

              {/* Imagem do Produto */}
              <div>
                <Label htmlFor="imagemReferencia">
                  Imagem do Seu Produto *
                  <span className="text-red-500 text-xs ml-1">(OBRIGATÓRIO)</span>
                </Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border"
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
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="imagemReferencia"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Label 
                        htmlFor="imagemReferencia" 
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="h-5 w-5 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-600">
                          Clique para adicionar imagem
                        </span>
                        <span className="text-xs text-gray-400">
                          PNG, JPG até 25MB
                        </span>
                      </Label>
                    </div>
                  )}
                </div>

              </div>

              <Separator />

              {/* Cores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corPrimaria">Cor Primária (Opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corPrimaria"
                      type="color"
                      value={formData.corPrimaria}
                      onChange={(e) => handleInputChange('corPrimaria', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.corPrimaria}
                      onChange={(e) => handleInputChange('corPrimaria', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="corSecundaria">Cor Secundária (Opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corSecundaria"
                      type="color"
                      value={formData.corSecundaria}
                      onChange={(e) => handleInputChange('corSecundaria', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.corSecundaria}
                      onChange={(e) => handleInputChange('corSecundaria', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Quantidade e Qualidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidadeImagens">Quantidade de Imagens</Label>
                  <Select
                    value={formData.quantidadeImagens.toString()}
                    onValueChange={(value) => handleInputChange('quantidadeImagens', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 imagem</SelectItem>
                      <SelectItem value="2">2 imagens</SelectItem>
                      <SelectItem value="3">3 imagens</SelectItem>
                      <SelectItem value="4">4 imagens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="qualidade">Qualidade da Geração</Label>
                  <Select
                    value={formData.qualidade}
                    onValueChange={(value) => handleInputChange('qualidade', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa (Rápida)</SelectItem>
                      <SelectItem value="medium">Média (Balanceada)</SelectItem>
                      <SelectItem value="high">Alta (Melhor qualidade)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão Gerar */}
              <Button
                onClick={handleGenerateInfographic}
                disabled={isProcessing || !formData.nomeProduto.trim() || !formData.descricaoLonga.trim() || isDescriptionTooLong || !imageFile}
                className="w-full h-12"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {currentStep === 'step1' && 'Otimizando texto...'}
                    {currentStep === 'step2' && 'Gerando imagem...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Gerar Infográfico
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Infográfico Gerado
              </CardTitle>
              <CardDescription>
                Resultado do processamento em 2 etapas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!infographicData ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Preencha o formulário e clique em "Gerar Infográfico" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Etapa 1: Texto Otimizado */}
                  {infographicData.etapa1Response && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Etapa 1 - Claude Sonnet</Badge>
                        <span className="text-sm text-green-600 font-medium">✓ Texto otimizado</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Título:</span>
                          <p className="text-gray-900">{infographicData.etapa1Response.nome}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Benefícios:</span>
                          <p className="text-gray-900">{infographicData.etapa1Response.beneficios}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Call-to-Action:</span>
                          <p className="text-gray-900">{infographicData.etapa1Response.cta}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 2: Imagens Geradas */}
                  {infographicData.processedImages && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Etapa 2 - GPT-Image-1</Badge>
                          <span className="text-sm text-green-600 font-medium">✓ Imagens geradas</span>
                        </div>
                        {infographicData.cost && infographicData.processingTime && (
                          <div className="text-right text-sm text-gray-600">
                            <div>Custo: ${infographicData.cost.toFixed(3)}</div>
                            <div>Tempo: {infographicData.processingTime}s</div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4">
                        {infographicData.processedImages.map((imageUrl, index) => (
                          <div key={index} className="space-y-3">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={`Infográfico ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDownloadImage(imageUrl, index)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Imagem {index + 1}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="w-full"
                      >
                        Gerar Novo Infográfico
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}