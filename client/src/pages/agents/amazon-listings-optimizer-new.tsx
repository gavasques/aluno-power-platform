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
  Download,
  ExternalLink
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
// Layout removed - component is already wrapped by app layout
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { CountrySelector, COUNTRIES } from '@/components/common/CountrySelector';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/UserContext';
import { useApiRequest } from '@/hooks/useApiRequest';

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
  
  // Estados para extração da Amazon
  const [urlInput, setUrlInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [extractState, setExtractState] = useState({
    products: [] as Array<{ url: string; country: string; maxPages: number }>,
    extractedReviews: [] as any[],
    isExtracting: false,
    progress: 0,
    currentPage: 1,
    totalPages: 10,
    currentProduct: '',
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

  const { toast } = useToast();
  const { user, token } = useAuth();
  const { execute } = useApiRequest();
  const { logAIGeneration, checkCredits, showInsufficientCreditsToast } = useCreditSystem();
  const FEATURE_CODE = 'agents.amazon_listing';

  // Helper functions para extração Amazon
  const extractOrValidateASIN = (input: string): string | null => {
    // ASIN direto (10 caracteres alfanuméricos)
    if (/^[A-Z0-9]{10}$/.test(input.trim())) {
      return input.trim();
    }

    // Extração de URL
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/product\/([A-Z0-9]{10})/,
      /asin=([A-Z0-9]{10})/,
      /\/([A-Z0-9]{10})(?:\/|\?|$)/
    ];

    for (const pattern of asinPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // Mapeamento de códigos de país para API Amazon
  const mapCountryCodeForAmazon = (countryCode: string): string => {
    const mapping: Record<string, string> = {
      'GB': 'UK', // Reino Unido
      'AE': 'AE', // Emirados Árabes
      'SA': 'SA', // Arábia Saudita
      'EG': 'EG', // Egito
      'TR': 'TR', // Turquia
      'SE': 'SE', // Suécia
      'PL': 'PL', // Polônia
      'BE': 'BE', // Bélgica
      'CL': 'CL', // Chile
      'NL': 'NL', // Holanda
      'AU': 'AU', // Austrália
      'JP': 'JP', // Japão
      'SG': 'SG', // Singapura
      'IN': 'IN', // Índia
    };
    
    return mapping[countryCode] || countryCode;
  };

  // Funções para gerenciamento de produtos na extração
  const addUrl = () => {
    if (!urlInput.trim()) return;

    // Limite de 5 produtos
    if (extractState.products.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 5 produtos por extração",
        variant: "destructive"
      });
      return;
    }

    const asin = extractOrValidateASIN(urlInput);
    if (!asin) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida da Amazon ou um ASIN válido",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe
    const existingProduct = extractState.products.find(p => extractOrValidateASIN(p.url) === asin);
    if (existingProduct) {
      toast({
        title: "Produto já adicionado",
        description: "Este produto já está na lista de extração",
        variant: "destructive"
      });
      return;
    }

    setExtractState(prev => ({
      ...prev,
      products: [...prev.products, { 
        url: urlInput, 
        country: selectedCountry,
        maxPages: prev.totalPages
      }]
    }));

    setUrlInput('');
  };

  const removeUrl = (index: number) => {
    setExtractState(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const fetchReviews = async (asin: string, page: number, country: string): Promise<any[]> => {
    try {
      const data = await execute(
        () => fetch('/api/amazon-reviews/extract', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            asin,
            page,
            country: mapCountryCodeForAmazon(country),
            sort_by: 'MOST_RECENT'
          })
        })
      );

      // Verificar se a resposta foi bem-sucedida
      if (data?.status === 'OK' && data?.data?.reviews) {
        const reviews = data.data.reviews;
        
        // Se reviews é um array válido, mapear os dados
        if (Array.isArray(reviews)) {
          return reviews.map((review: any) => ({
            review_title: review.review_title || '',
            review_star_rating: review.review_star_rating || '',
            review_comment: review.review_comment || ''
          }));
        }
      }
      
      // Se chegou aqui, não há reviews disponíveis nesta página
      return [];
      
    } catch (error: any) {
      // Se o erro indica que não há mais reviews (404, ou fim dos dados), retornar array vazio
      if (error.message.includes('404') || error.message.includes('Erro 400')) {
        return [];
      }
      
      // Para outros erros, propagar a exceção
      throw error;
    }
  };

  const extractAmazonReviews = async () => {
    if (extractState.products.length === 0) return;

    setExtractState(prev => ({
      ...prev,
      isExtracting: true,
      progress: 0,
      extractedReviews: [],
      errors: []
    }));

    try {
      const allReviews: any[] = [];
      const errors: string[] = [];
      let totalPagesProcessed = 0;
      let totalPagesEstimated = extractState.products.length * 3;

      for (const product of extractState.products) {
        const asin = extractOrValidateASIN(product.url);
        if (!asin) {
          errors.push(`URL inválida: ${product.url}`);
          continue;
        }

        setExtractState(prev => ({ ...prev, currentProduct: asin }));

        let page = 1;
        let consecutiveEmptyPages = 0;
        const MAX_CONSECUTIVE_EMPTY = 2;
        const MAX_PAGES_PER_PRODUCT = product.maxPages;

        while (page <= MAX_PAGES_PER_PRODUCT && consecutiveEmptyPages < MAX_CONSECUTIVE_EMPTY) {
          try {
            setExtractState(prev => ({ ...prev, currentPage: page }));
            
            const reviews = await fetchReviews(asin, page, product.country);
            
            if (reviews.length === 0) {
              consecutiveEmptyPages++;
            } else {
              consecutiveEmptyPages = 0;
              allReviews.push(...reviews);
            }
            
            // Delay otimizado: 120ms = ~8.3 req/s para margem de segurança
            await new Promise(resolve => setTimeout(resolve, 120));
            
          } catch (error: any) {
            errors.push(`Erro página ${page} - ASIN ${asin}: ${error.message}`);
            consecutiveEmptyPages++;
          }

          totalPagesProcessed++;
          
          // Atualizar progresso
          setExtractState(prev => ({ 
            ...prev, 
            progress: Math.min((totalPagesProcessed / totalPagesEstimated) * 100, 99)
          }));

          page++;
        }
      }

      // Converter reviews para texto formatado para o campo reviewsData
      const reviewsText = allReviews.map((review, index) => {
        const title = review.review_title || 'Sem título';
        const rating = review.review_star_rating || 'Sem avaliação';
        const comment = review.review_comment || 'Sem comentário';
        
        return `=== REVIEW ${index + 1} ===
Título: ${title}
Avaliação: ${rating} estrelas
Comentário: ${comment}

`;
      }).join('');

      setExtractState(prev => ({
        ...prev,
        extractedReviews: allReviews,
        errors,
        isExtracting: false,
        progress: 100
      }));

      // Atualizar o campo de dados de reviews
      handleInputChange('reviewsData', reviewsText);

      toast({
        title: "Extração concluída!",
        description: `${allReviews.length} reviews extraídos de ${extractState.products.length} produtos`,
      });

    } catch (error: any) {
      setExtractState(prev => ({
        ...prev,
        isExtracting: false,
        errors: [...prev.errors, `Erro geral: ${error.message}`]
      }));
    }
  };

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
        productName: formData.productName,
        brand: formData.brand,
        category: formData.category,
        keywords: formData.keywords,
        longTailKeywords: formData.longTailKeywords,
        features: formData.features,
        targetAudience: formData.targetAudience,
        reviewsData: reviewsData,
        format: 'text'
      };

      console.log('Enviando dados para processamento:', submitData);
      
      // Fazer chamada direta da API com timeout estendido
      const apiResponse = await fetch('/api/agents/amazon-listings-optimizer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
        signal: AbortSignal.timeout(300000) // 5 minutos timeout no frontend
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        
        // Tratar erro 503 (webhook indisponível) de forma especial
        if (apiResponse.status === 503 && errorData.webhookStatus === 'not_registered') {
          toast({
            title: "Webhook temporariamente indisponível",
            description: errorData.details || "O sistema de processamento está temporariamente indisponível. Tente novamente em alguns minutos.",
            variant: "destructive"
          });
          return;
        }
        
        throw new Error(errorData.error || `Erro HTTP ${apiResponse.status}`);
      }

      const response = await apiResponse.json();
      console.log('Response from API:', response);

      if (response && response.success) {
        // Log da geração para o sistema de créditos
        await logAIGeneration({
          featureCode: FEATURE_CODE,
          provider: response.provider || 'openai',
          model: response.model || 'gpt-4o',
          inputTokens: response.tokensUsed?.input || 0,
          outputTokens: response.tokensUsed?.output || 0,
          totalTokens: response.tokensUsed?.total || 0,
          cost: response.cost || 0
        });

        // Redirecionar para a página de resultados com os dados
        const searchParams = new URLSearchParams({
          data: JSON.stringify({
            input: submitData,
            output: response,
            timestamp: Date.now()
          })
        });
        
        navigate(`/agents/amazon-listings-optimizer/result?${searchParams.toString()}`);
      } else {
        throw new Error(response.error || 'Erro no processamento');
      }
      
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
            <strong>Custo:</strong> Este agente consome <strong>8 créditos</strong> por otimização. Verifique seu saldo antes de prosseguir.
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
                              Extraia avaliações diretamente da Amazon usando URLs ou ASINs dos produtos concorrentes.
                            </p>
                          </div>

                          {/* Configuração da Extração */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <Input
                                placeholder="URL da Amazon ou ASIN do produto"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                              />
                            </div>
                            <CountrySelector
                              value={selectedCountry}
                              onValueChange={setSelectedCountry}
                            />
                            <Button onClick={addUrl} disabled={!urlInput.trim()}>
                              Adicionar
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Máximo de páginas por produto</label>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={extractState.totalPages}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 10;
                                  setExtractState(prev => ({ ...prev, totalPages: Math.max(1, Math.min(50, value)) }));
                                }}
                                disabled={extractState.isExtracting}
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                O extrator para automaticamente após 2 páginas consecutivas vazias (mesmo antes do limite)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Estimativa de reviews</label>
                              <div className="p-3 bg-muted/50 rounded-md">
                                <p className="text-sm">
                                  Até <span className="font-semibold">{extractState.products.reduce((total, product) => total + product.maxPages, 0) * 10}</span> reviews
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ({extractState.products.length} produtos × páginas variadas × ~10 reviews/página)
                                </p>
                              </div>
                            </div>
                          </div>

                          {extractState.products.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Produtos para extração:</h3>
                              <div className="space-y-2">
                                {extractState.products.map((product, index) => {
                                  const asin = extractOrValidateASIN(product.url);
                                  const country = COUNTRIES.find(c => c.code === product.country);
                                  return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                          ASIN: {asin}
                                        </span>
                                        
                                        {/* País selecionado - Campo em vermelho conforme solicitado */}
                                        <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded border border-red-300 dark:border-red-700">
                                          País: {country?.flag} {country?.name}
                                        </span>
                                        
                                        {/* Máximo de páginas - Campo em vermelho conforme solicitado */}
                                        <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded border border-red-300 dark:border-red-700">
                                          Máx páginas: {product.maxPages}
                                        </span>
                                        
                                        <ExternalLink 
                                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                                          onClick={() => window.open(product.url, '_blank')}
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeUrl(index)}
                                        disabled={extractState.isExtracting}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={extractAmazonReviews}
                            disabled={extractState.products.length === 0 || extractState.isExtracting}
                            className="w-full"
                          >
                            {extractState.isExtracting ? (
                              <>
                                <ButtonLoader />
                                Extraindo...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Extrair Reviews ({extractState.products.length} produtos)
                              </>
                            )}
                          </Button>

                          {/* Progresso */}
                          {extractState.isExtracting && (
                            <div className="space-y-4">
                              <div className="flex justify-between text-sm">
                                <span>Progresso da extração</span>
                                <span>
                                  {Math.round(extractState.progress)}%
                                  {extractState.progress >= 99 && extractState.progress < 100 && (
                                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                                      (Finalizando...)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <Progress value={extractState.progress} />
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>
                                  Produto atual: <span className="font-mono">{extractState.currentProduct}</span>
                                </div>
                                <div>
                                  Página: {extractState.currentPage}
                                  {extractState.extractedReviews.length > 0 && (
                                    <span className="ml-4 text-green-600 dark:text-green-400">
                                      • {extractState.extractedReviews.length} reviews coletados
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Erros */}
                          {extractState.errors.length > 0 && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-1">
                                  <strong>Erros durante a extração:</strong>
                                  {extractState.errors.slice(0, 3).map((error, index) => (
                                    <div key={index} className="text-sm">• {error}</div>
                                  ))}
                                  {extractState.errors.length > 3 && (
                                    <div className="text-sm">... e mais {extractState.errors.length - 3} erros</div>
                                  )}
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Resultados */}
                          {extractState.extractedReviews.length > 0 && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-200">
                                  Extração concluída!
                                </span>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                {extractState.extractedReviews.length} reviews extraídos e adicionados ao campo de dados automaticamente.
                              </p>
                            </div>
                          )}
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
                          Otimizar Listagem (8 créditos)
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
  );
}