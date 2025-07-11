import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Upload, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Info,
  X
} from "lucide-react";
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

// Custom hooks and types
import { useAmazonListingSession } from "@/hooks/useAmazonListingSession";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useFileProcessing } from "@/hooks/useFileProcessing";
import { useGetFeatureCost } from "@/hooks/useFeatureCosts";
import { AgentCostDisplay } from "@/components/AgentCostDisplay";
import { amazonListingService } from "@/services/amazonListingService";
import { apiRequest } from "@/lib/queryClient";
import type { AmazonListingFormData, Department, ReviewsInputType } from "@/types/amazon-listing";

// Código da feature para custo
const FEATURE_CODE = "agents.amazon_listing";

export default function AmazonListingsOptimizer() {
  // Form state
  const [formData, setFormData] = useState<AmazonListingFormData>({
    productName: "",
    brand: "",
    category: "",
    keywords: "",
    longTailKeywords: "",
    features: "",
    targetAudience: "",
    reviewsData: ""
  });

  // UI state
  const [reviewsTab, setReviewsTab] = useState<ReviewsInputType>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [, navigate] = useLocation();

  // Custom hooks
  const { session, isLoading: isSessionLoading, error: sessionError, updateSessionData } = useAmazonListingSession();
  const { errors, validateField, validateForm, clearError } = useFormValidation();
  const { uploadedFiles, isProcessing: isFilesProcessing, error: fileError, addFiles, removeFile, processFiles, clearFiles } = useFileProcessing();
  const { getFeatureCost } = useGetFeatureCost();

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Remove automatic session updating to prevent infinite loops
  // Session will only be updated on explicit form submission

  // Generate available tags from form data
  useEffect(() => {
    const tags = ['PRODUCT_NAME', 'BRAND', 'CATEGORY', 'KEYWORDS', 'LONG_TAIL_KEYWORDS', 'FEATURES', 'TARGET_AUDIENCE', 'REVIEWS_DATA']
      .map(tag => `{{${tag}}}`);
    setAvailableTags(tags);
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await amazonListingService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  // Form field update handler
  const updateField = (field: keyof AmazonListingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error if it exists and validate field
    if (errors[field]) {
      clearError(field);
    }
    validateField(field, value);
  };

  // File upload handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    addFiles(fileArray);
  };

  // Process listing main function
  const processListing = async () => {
    // Validação de créditos primeiro
    const featureCost = getFeatureCost(FEATURE_CODE);
    const creditsRequired = featureCost?.costPerUse || 10;

    try {
      // Verificar saldo de créditos
      const response = await apiRequest('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.user.creditBalance < creditsRequired) {
        alert(`Créditos insuficientes. Você precisa de ${creditsRequired} créditos, mas tem apenas ${response.user.creditBalance}.`);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      alert('Erro ao verificar saldo de créditos. Tente novamente.');
      return;
    }

    // Get combined reviews data from files if any
    let combinedReviewsData = formData.reviewsData;
    
    if (uploadedFiles.length > 0 && session) {
      try {
        combinedReviewsData = await processFiles(session.id);
      } catch (error) {
        console.error('Error processing files:', error);
        return;
      }
    }

    // Final form data with processed reviews
    const finalFormData: AmazonListingFormData = {
      ...formData,
      reviewsData: combinedReviewsData
    };

    // Validate form with file consideration
    if (!validateForm(finalFormData, uploadedFiles.length > 0)) {
      return;
    }

    setIsProcessing(true);

    try {
      // Deduzir créditos antes de processar
      await apiRequest('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          amount: creditsRequired,
          reason: `Amazon Listings Optimizer - ${formData.productName || 'Produto'}`
        })
      });

      // Update session with form data first
      await updateSessionData(finalFormData);
      
      // Then start the 2-step processing
      await amazonListingService.processStep1(session!.id);
      await amazonListingService.processStep2(session!.id);

      // Log da geração para auditoria
      await apiRequest('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          feature: FEATURE_CODE,
          prompt: `Otimização Amazon Listing: ${formData.productName}`,
          response: 'Otimização concluída com sucesso',
          creditsUsed: creditsRequired,
          model: 'amazon-optimizer',
          tokensUsed: 0
        })
      });
      
      navigate('/agents/amazon-listings-optimizer/result');
    } catch (error) {
      console.error('Error processing listing:', error);
      alert('Erro ao processar listagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while session is being created
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Inicializando sessão...</p>
        </div>
      </div>
    );
  }

  // Show error if session creation failed
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao criar sessão: {sessionError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            <strong>Custo:</strong> Este agente consome <strong>10 créditos</strong> por otimização. Verifique seu saldo antes de prosseguir.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  <span>Dados do Produto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Name and Brand Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nome do Produto *</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => updateField('productName', e.target.value.slice(0, 150))}
                      placeholder="Ex: Fone de Ouvido Bluetooth Premium"
                      className={errors.productName ? "border-red-500" : ""}
                      maxLength={150}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{errors.productName && <span className="text-red-600">{errors.productName}</span>}</span>
                      <span>{formData.productName.length}/150</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => updateField('brand', e.target.value.slice(0, 40))}
                      placeholder="Ex: TechAudio"
                      className={errors.brand ? "border-red-500" : ""}
                      maxLength={40}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{errors.brand && <span className="text-red-600">{errors.brand}</span>}</span>
                      <span>{formData.brand.length}/40</span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Palavras-chave Principais *</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => updateField('keywords', e.target.value.slice(0, 300))}
                      placeholder="Ex: fone bluetooth, headphone sem fio, áudio premium"
                      className={errors.keywords ? "border-red-500" : ""}
                      maxLength={300}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{errors.keywords && <span className="text-red-600">{errors.keywords}</span>}</span>
                      <span>{formData.keywords.length}/300</span>
                    </div>
                  </div>

                  {/* Long Tail Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="longTailKeywords">Long Tail Keywords</Label>
                    <Textarea
                      id="longTailKeywords"
                      value={formData.longTailKeywords}
                      onChange={(e) => updateField('longTailKeywords', e.target.value.slice(0, 300))}
                      placeholder="Ex: fone de ouvido bluetooth com cancelamento de ruído para exercícios"
                      rows={3}
                      maxLength={300}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span></span>
                      <span>{formData.longTailKeywords.length}/300</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label htmlFor="features">Características</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => updateField('features', e.target.value.slice(0, 8000))}
                    placeholder="Ex: Bluetooth 5.0, 30h de bateria, resistente à água IPX7, design ergonômico..."
                    rows={6}
                    maxLength={8000}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span></span>
                    <span>{formData.features.length}/8000</span>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Público Alvo</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => updateField('targetAudience', e.target.value.slice(0, 150))}
                    placeholder="Ex: Atletas, profissionais, estudantes que buscam qualidade de áudio"
                    rows={3}
                    maxLength={150}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span></span>
                    <span>{formData.targetAudience.length}/150</span>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados de Avaliações dos Concorrentes</h3>
                    
                    <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as ReviewsInputType)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload de Arquivos</span>
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Entrada Manual</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Clique para upload ou arraste arquivos aqui
                                </span>
                                <span className="mt-1 block text-sm text-gray-500">
                                  CSV, TXT (máximo 10 arquivos)
                                </span>
                              </label>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                multiple
                                accept=".csv,.txt"
                                className="sr-only"
                                onChange={(e) => handleFileUpload(e.target.files)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Show file processing error */}
                        {fileError && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{fileError}</AlertDescription>
                          </Alert>
                        )}

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Arquivos carregados:</h4>
                              <Button variant="outline" size="sm" onClick={clearFiles}>
                                Limpar todos
                              </Button>
                            </div>
                            {uploadedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="text-xs text-gray-500">
                              Total: {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reviewsData">Dados de Avaliações *</Label>
                          <Textarea
                            id="reviewsData"
                            value={formData.reviewsData}
                            onChange={(e) => updateField('reviewsData', e.target.value.slice(0, 8000))}
                            placeholder="Cole aqui os dados de avaliações dos concorrentes..."
                            rows={8}
                            className={errors.reviewsData ? "border-red-500" : ""}
                            maxLength={8000}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{errors.reviewsData && <span className="text-red-600">{errors.reviewsData}</span>}</span>
                            <span>{formData.reviewsData.length}/8000</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Process Button */}
                <div className="pt-6 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Antes de processar:</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      • Serão descontados <strong>10 créditos</strong> do seu saldo
                      • Verifique se todos os campos obrigatórios estão preenchidos
                      • O processamento não pode ser interrompido após iniciar
                    </p>
                  </div>
                  
                  <Button
                    onClick={processListing}
                    disabled={isProcessing || isFilesProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing || isFilesProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
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
            {/* Agent Cost Display */}
            <AgentCostDisplay featureCode={FEATURE_CODE} />

            {/* Available Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Tags Disponíveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Estas variáveis estão disponíveis nos prompts:
                  </p>
                  <div className="space-y-1">
                    {availableTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Campos Obrigatórios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(errors).map(([field, error]) => (
                      error && (
                        <p key={field} className="text-sm text-red-600">
                          • {error}
                        </p>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Status */}
            {session && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Status da Sessão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">{session.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Criada em:</span>
                      <span className="text-gray-600">
                        {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
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