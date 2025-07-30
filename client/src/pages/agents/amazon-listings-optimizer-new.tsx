import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Upload, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  X,
  Plus,
  MessageSquare,
  Trash2,
  Download
} from "lucide-react";
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import Layout from "@/components/layout/Layout";
import { useCreditSystem } from '@/hooks/useCreditSystem';

export default function AmazonListingsOptimizerNew() {
  const [location, navigate] = useLocation();
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    keywords: "",
    longTailKeywords: "",
    features: "",
    targetAudience: "",
    reviewsData: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewsTab, setReviewsTab] = useState<"upload" | "text" | "extract">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Estado para extração de reviews
  const [extractState, setExtractState] = useState({
    urls: [] as Array<{ id: string; asin: string; country: string }>,
    extractedReviews: [] as any[],
    isExtracting: false,
    errors: [] as string[]
  });

  // Buscar departamentos da API
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ['/api/departments'],
    select: (data: any[]) => data?.sort((a, b) => a.name.localeCompare(b.name)) || []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Funções para extração de reviews
  const addExtractUrl = () => {
    setExtractState(prev => ({
      ...prev,
      urls: [...prev.urls, { id: crypto.randomUUID(), asin: '', country: 'BR' }]
    }));
  };

  const updateExtractUrl = (id: string, field: 'asin' | 'country', value: string) => {
    setExtractState(prev => ({
      ...prev,
      urls: prev.urls.map(url => 
        url.id === id ? { ...url, [field]: value } : url
      )
    }));
  };

  const removeExtractUrl = (id: string) => {
    setExtractState(prev => ({
      ...prev,
      urls: prev.urls.filter(url => url.id !== id)
    }));
  };

  // Mapeamento de códigos de país para API Amazon
  const mapCountryCodeForAmazon = (countryCode: string): string => {
    const mapping: Record<string, string> = {
      'GB': 'UK', // Reino Unido
      'AE': 'AE', 'SA': 'SA', 'EG': 'EG', 'TR': 'TR', 'SE': 'SE',
      'PL': 'PL', 'BE': 'BE', 'CL': 'CL', 'NL': 'NL', 'AU': 'AU',
      'JP': 'JP', 'SG': 'SG', 'IN': 'IN'
    };
    return mapping[countryCode] || countryCode;
  };

  const extractReviews = async () => {
    if (extractState.urls.filter(u => u.asin).length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um ASIN para extrair reviews",
        variant: "destructive"
      });
      return;
    }

    setExtractState(prev => ({ ...prev, isExtracting: true, errors: [] }));
    const allReviews: any[] = [];

    try {
      for (const url of extractState.urls) {
        if (!url.asin) continue;

        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/amazon-reviews/extract', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              asin: url.asin.toUpperCase(),
              country: mapCountryCodeForAmazon(url.country),
              page: 1,
              sort_by: 'MOST_RECENT'
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao extrair reviews');
          }

          const data = await response.json();
          if (data.data && data.data.reviews) {
            allReviews.push(...data.data.reviews.map((review: any) => ({
              ...review,
              asin: url.asin,
              country: url.country
            })));
          }
        } catch (error: any) {
          setExtractState(prev => ({
            ...prev,
            errors: [...prev.errors, `ASIN ${url.asin}: ${error.message}`]
          }));
        }
      }

      if (allReviews.length > 0) {
        // Converter reviews para formato de texto
        const reviewsText = allReviews.map((review, index) => {
          return `=== REVIEW ${index + 1} ===
Título: ${review.review_title || 'Sem título'}
Avaliação: ${review.review_star_rating || 'Sem avaliação'} estrelas
Comentário: ${review.review_comment || 'Sem comentário'}
`;
        }).join('\n');

        // Atualizar o campo de reviews com os dados extraídos
        handleInputChange("reviewsData", reviewsText);
        
        setExtractState(prev => ({
          ...prev,
          extractedReviews: allReviews,
          isExtracting: false
        }));

        toast({
          title: "Extração concluída!",
          description: `${allReviews.length} reviews extraídos com sucesso`,
        });

        // Mudar para aba de texto para mostrar os reviews
        setReviewsTab("text");
      }
    } catch (error: any) {
      setExtractState(prev => ({
        ...prev,
        isExtracting: false,
        errors: [...prev.errors, `Erro geral: ${error.message}`]
      }));
    }
  };

  const { toast } = useToast();
  const { logAIGeneration, checkCredits, showInsufficientCreditsToast } = useCreditSystem();

  const FEATURE_CODE = 'agents.amazon_listing';

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Preparar dados do formulário para envio
      let reviewsData = formData.reviewsData;
      
      // Se há arquivos carregados, processar conteúdo (simular por enquanto)
      if (reviewsTab === "upload" && uploadedFiles.length > 0) {
        reviewsData = uploadedFiles.map(file => `[Arquivo: ${file.name}]`).join('\n');
      }
      
      const submitData = {
        nomeProduto: formData.productName,
        marca: formData.brand,
        categoria: formData.category,
        keywords: formData.keywords,
        longTailKeywords: formData.longTailKeywords,
        principaisCaracteristicas: formData.features,
        publicoAlvo: formData.targetAudience,
        reviewsData: reviewsData
      };
      
      // 1. Criar sessão
      const sessionResponse = await fetch('/api/amazon-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: 'user-1' })
      });
      
      if (!sessionResponse.ok) {
        throw new Error('Erro ao criar sessão');
      }
      
      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.session.id;
      
      // 2. Salvar dados do produto
      const dataResponse = await fetch(`/api/amazon-sessions/${sessionId}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (!dataResponse.ok) {
        throw new Error('Erro ao salvar dados do produto');
      }
      
      // 3. Processar Etapa 1 (Análise)
      const step1Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!step1Response.ok) {
        throw new Error('Erro na análise das avaliações');
      }
      
      // 4. Processar Etapa 2 (Títulos)
      const step2Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!step2Response.ok) {
        throw new Error('Erro na geração de títulos');
      }

      // 5. Processar Etapa 3 (Bullet Points)
      const step3Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!step3Response.ok) {
        throw new Error('Erro na geração de bullet points');
      }

      // 6. Processar Etapa 4 (Descrição)
      const step4Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step4`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!step4Response.ok) {
        throw new Error('Erro na geração de descrição');
      }
      
      // 7. Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'openai',
        model: 'gpt-4o-mini',
        prompt: `Produto: ${formData.productName}`,
        response: 'Listagem otimizada gerada',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });
      
      // 9. Navegar para resultados
      navigate(`/agents/amazon-listings-optimizer/result?session=${sessionId}`);
      
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = formData.productName && formData.brand && formData.category && 
    (reviewsTab === "text" ? formData.reviewsData : 
     reviewsTab === "upload" ? uploadedFiles.length > 0 :
     extractState.extractedReviews.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/agentes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Agentes
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Amazon Listings Optimizer
              </h1>
              <p className="text-gray-600">
                Otimize suas listagens da Amazon com análise de avaliações dos concorrentes
              </p>
            </div>
          </div>
        </div>

        {/* Credit Cost Warning */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Custo:</strong> Este agente consome <strong>10 créditos</strong> por otimização. Verifique seu saldo antes de prosseguir.
          </AlertDescription>
        </Alert>

        <PermissionGuard 
          featureCode="agents.amazon_listing"
          showMessage={true}
          message="Você não tem permissão para usar o Amazon Listings Optimizer."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product Name and Brand */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Nome do Produto *</Label>
                      <Input
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value.slice(0, 150))}
                        placeholder="Ex: Fone de Ouvido Bluetooth"
                        maxLength={150}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span></span>
                        <span>{formData.productName.length}/150</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value.slice(0, 40))}
                        placeholder="Ex: Sony"
                        maxLength={40}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span></span>
                        <span>{formData.brand.length}/40</span>
                      </div>
                    </div>
                  </div>

                  {/* Category and Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {isDepartmentsLoading ? (
                            <SelectItem value="loading" disabled>Carregando categorias...</SelectItem>
                          ) : departments && departments.length > 0 ? (
                            departments.map((dept: any) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>Nenhuma categoria encontrada</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetAudience">Público Alvo</Label>
                      <Textarea
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange("targetAudience", e.target.value.slice(0, 150))}
                        placeholder="Ex: Jovens, profissionais, esportistas"
                        rows={3}
                        maxLength={150}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span></span>
                        <span>{formData.targetAudience.length}/150</span>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keywords">Palavras-chave Principais</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => handleInputChange("keywords", e.target.value.slice(0, 300))}
                        placeholder="Ex: fone bluetooth, sem fio"
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span></span>
                        <span>{formData.keywords.length}/300</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="longTailKeywords">Long Tail Keywords</Label>
                      <Input
                        id="longTailKeywords"
                        value={formData.longTailKeywords}
                        onChange={(e) => handleInputChange("longTailKeywords", e.target.value.slice(0, 300))}
                        placeholder="Ex: fone bluetooth com cancelamento ruído"
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span></span>
                        <span>{formData.longTailKeywords.length}/300</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <Label htmlFor="features">Características</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => handleInputChange("features", e.target.value.slice(0, 8000))}
                      placeholder="Ex: 30h de bateria, resistente à água, design ergonômico, conexão Bluetooth 5.0, cancelamento ativo de ruído..."
                      rows={6}
                      maxLength={8000}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span></span>
                      <span>{formData.features.length}/8000</span>
                    </div>
                  </div>

                  {/* Reviews Data */}
                  <div>
                    <Label>Dados das Avaliações dos Concorrentes *</Label>
                    <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as "upload" | "text" | "extract")}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
                        <TabsTrigger value="text">Texto Manual</TabsTrigger>
                        <TabsTrigger value="extract">Extrair da Amazon</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                            <div className="relative">
                              <Input
                                type="file"
                                accept=".csv,.txt"
                                multiple
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button variant="default" className="mb-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Escolher Arquivos
                              </Button>
                            </div>
                            <p className="text-sm text-blue-600">
                              Aceita arquivos CSV ou TXT (máximo 10 arquivos)
                            </p>
                          </div>
                        </div>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Arquivos carregados:</Label>
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">{file.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="text">
                        <Textarea
                          value={formData.reviewsData}
                          onChange={(e) => handleInputChange("reviewsData", e.target.value.slice(0, 8000))}
                          placeholder="Cole aqui as avaliações dos concorrentes (formato Helium10 ou texto livre)"
                          rows={8}
                          className="w-full"
                          maxLength={8000}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span></span>
                          <span>{formData.reviewsData.length}/8000</span>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="extract" className="space-y-4">
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                              Extraia avaliações diretamente da Amazon usando o ASIN dos produtos concorrentes.
                            </p>
                          </div>

                          {/* Lista de ASINs */}
                          <div className="space-y-3">
                            {extractState.urls.map((url) => (
                              <div key={url.id} className="flex gap-3">
                                <div className="flex-1">
                                  <Input
                                    placeholder="ASIN (ex: B08N5WRWNW)"
                                    value={url.asin}
                                    onChange={(e) => updateExtractUrl(url.id, 'asin', e.target.value.toUpperCase())}
                                    disabled={extractState.isExtracting}
                                    maxLength={10}
                                  />
                                </div>
                                <Select
                                  value={url.country}
                                  onValueChange={(value) => updateExtractUrl(url.id, 'country', value)}
                                  disabled={extractState.isExtracting}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="BR">Brasil</SelectItem>
                                    <SelectItem value="US">EUA</SelectItem>
                                    <SelectItem value="UK">Reino Unido</SelectItem>
                                    <SelectItem value="DE">Alemanha</SelectItem>
                                    <SelectItem value="ES">Espanha</SelectItem>
                                    <SelectItem value="FR">França</SelectItem>
                                    <SelectItem value="IT">Itália</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeExtractUrl(url.id)}
                                  disabled={extractState.isExtracting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Botão adicionar */}
                          <Button
                            variant="outline"
                            onClick={addExtractUrl}
                            disabled={extractState.isExtracting || extractState.urls.length >= 5}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar ASIN (máx. 5)
                          </Button>

                          {/* Erros */}
                          {extractState.errors.length > 0 && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-1">
                                  {extractState.errors.map((error, index) => (
                                    <p key={index} className="text-sm">{error}</p>
                                  ))}
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Reviews extraídos */}
                          {extractState.extractedReviews.length > 0 && (
                            <Alert>
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                {extractState.extractedReviews.length} reviews extraídos com sucesso!
                                Os dados foram adicionados automaticamente.
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Botão extrair */}
                          <Button
                            onClick={extractReviews}
                            disabled={extractState.isExtracting || extractState.urls.filter(u => u.asin).length === 0}
                            className="w-full"
                          >
                            {extractState.isExtracting ? (
                              <>
                                <ButtonLoader />
                                Extraindo Reviews...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Extrair Reviews
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!isFormValid || isProcessing}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      {isProcessing ? (
                        <>
                          <ButtonLoader />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Otimizar Listagem (10 créditos)
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <h4 className="font-medium">Análise de Avaliações</h4>
                      <p className="text-sm text-muted-foreground">
                        Analisamos as avaliações dos concorrentes para identificar pontos fortes e fracos
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <h4 className="font-medium">Geração de Títulos</h4>
                      <p className="text-sm text-muted-foreground">
                        Criamos títulos otimizados baseados na análise e suas palavras-chave
                      </p>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <h4 className="font-medium">Geração de Bullet Points</h4>
                      <p className="text-sm text-muted-foreground">
                        Desenvolvemos bullet points persuasivos usando dados da análise e títulos gerados
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <h4 className="font-medium">Descrição Completa</h4>
                      <p className="text-sm text-muted-foreground">
                        Criamos uma descrição otimizada integrando todas as etapas anteriores
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Use dados reais do Helium10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Inclua palavras-chave relevantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Defina seu público-alvo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionGuard>
        </div>
      </div>
    </Layout>
  );
}