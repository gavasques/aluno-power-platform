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
  Info
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

interface FormData {
  productName: string;
  brand: string;
  category: string;
  keywords: string;
  longTailKeywords: string;
  features: string;
  targetAudience: string;
  reviewsData: string;
  uploadedFiles: File[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface ReviewData {
  title: string;
  body: string;
  rating: string;
}

interface SessionInfo {
  id: string;
  sessionHash: string;
  userId: string;
  status: string;
  tags?: Record<string, string>;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

export default function AmazonListingsOptimizer() {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    brand: "",
    category: "",
    keywords: "",
    longTailKeywords: "",
    features: "",
    targetAudience: "",
    reviewsData: "",
    uploadedFiles: []
  });

  const [reviewsTab, setReviewsTab] = useState<"upload" | "manual">("upload");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Criar sessão ao montar o componente
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Simular ID do usuário (em produção vem da autenticação)
        const userId = "user-1";
        
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            agentType: 'amazon-listing-optimizer' 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionInfo(data.session);
        }
      } catch (error) {
        console.error('Erro ao criar sessão:', error);
      }
    };

    const loadDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          // Ordenar departamentos por nome (A-Z)
          const sortedDepartments = data.sort((a: Department, b: Department) => 
            a.name.localeCompare(b.name, 'pt-BR')
          );
          setDepartments(sortedDepartments);
        }
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    initializeSession();
    loadDepartments();
  }, []);

  // Atualizar sessão quando dados do formulário mudarem
  useEffect(() => {
    if (sessionInfo && Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() : value.length > 0
    )) {
      updateSessionData();
    }
  }, [formData, sessionInfo]);

  // Atualizar dados da sessão
  const updateSessionData = async () => {
    if (!sessionInfo) return;

    try {
      const response = await fetch(`/api/sessions/${sessionInfo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputData: {
            productName: formData.productName,
            brand: formData.brand,
            category: formData.category,
            keywords: formData.keywords,
            longTailKeywords: formData.longTailKeywords,
            mainFeatures: formData.features,
            targetAudience: formData.targetAudience,
            reviewsData: formData.reviewsData
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(prev => prev ? { ...prev, tags: data.session.tags } : null);
        
        // Atualizar tags disponíveis com todas as variáveis
        if (data.session.tags) {
          const tags = Object.keys(data.session.tags).map(key => `{{${key}}}`);
          setAvailableTags(tags);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof FormData, value: string | File[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando o campo for preenchido
    if (errors[field] && value) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Validação dos campos obrigatórios
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Campos obrigatórios
    if (!formData.productName.trim()) {
      newErrors.productName = "Nome do produto é obrigatório";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Marca é obrigatória";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Categoria é obrigatória";
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = "Palavras-chave são obrigatórias";
    }

    // Validação das avaliações (uma das duas opções)
    if (reviewsTab === "upload") {
      if (formData.uploadedFiles.length === 0) {
        newErrors.uploadedFiles = "Pelo menos um arquivo CSV é obrigatório";
      }
    } else {
      if (!formData.reviewsData.trim()) {
        newErrors.reviewsData = "Dados das avaliações são obrigatórios";
      }
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload múltiplo de arquivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validações
    if (files.length === 0) return;
    
    if (files.length > 10) {
      setErrors(prev => ({
        ...prev,
        uploadedFiles: "Máximo de 10 arquivos permitidos"
      }));
      return;
    }
    
    // Verificar se todos são CSV
    const invalidFiles = files.filter(file => !file.name.endsWith('.csv'));
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        uploadedFiles: "Apenas arquivos CSV são aceitos"
      }));
      return;
    }
    
    // Verificar tamanho individual (2MB cada)
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        uploadedFiles: "Cada arquivo deve ter no máximo 2MB"
      }));
      return;
    }
    
    // Verificar tamanho total (10MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        uploadedFiles: "Tamanho total dos arquivos deve ser no máximo 10MB"
      }));
      return;
    }
    
    // Processar arquivos CSV e extrair apenas Title, Body, Rating
    try {
      let combinedMarkdown = "";
      
      for (const file of files) {
        const csvContent = await readFileContent(file);
        const reviews = parseCSVToReviews(csvContent);
        
        combinedMarkdown += `\n## Arquivo: ${file.name.replace('.csv', '')}\n\n`;
        
        reviews.forEach((review, index) => {
          if (review.title || review.body || review.rating) {
            combinedMarkdown += `### Avaliação ${index + 1}\n\n`;
            combinedMarkdown += `**Título:** ${review.title || 'Sem título'}\n\n`;
            combinedMarkdown += `**Nota:** ${review.rating || 'N/A'}/5 ⭐\n\n`;
            combinedMarkdown += `**Comentário:**\n${review.body || 'Sem comentário'}\n\n`;
            combinedMarkdown += `---\n\n`;
          }
        });
      }
      
      // Atualizar dados do formulário
      setFormData(prev => ({
        ...prev,
        uploadedFiles: files,
        reviewsData: prev.reviewsData + combinedMarkdown
      }));
      
      // Limpar erros
      setErrors(prev => ({
        ...prev,
        uploadedFiles: ""
      }));
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        uploadedFiles: "Erro ao processar arquivos"
      }));
    }
  };
  
  // Função para ler conteúdo do arquivo
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file);
    });
  };

  // Função para extrair Title, Body e Rating do CSV
  const parseCSVToReviews = (csvText: string): ReviewData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const reviews = [];
    
    // Encontrar índices das colunas necessárias no header
    const header = lines[0];
    const columns = parseCSVLine(header);
    
    const titleIndex = columns.findIndex(col => 
      col.toLowerCase().includes('title') || col.toLowerCase().includes('título')
    );
    const bodyIndex = columns.findIndex(col => 
      col.toLowerCase().includes('body') || col.toLowerCase().includes('comentário') || col.toLowerCase().includes('comment')
    );
    const ratingIndex = columns.findIndex(col => 
      col.toLowerCase().includes('rating') || col.toLowerCase().includes('nota') || col.toLowerCase().includes('star')
    );
    
    // Processar cada linha de dados (pular header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const fields = parseCSVLine(line);
        
        if (fields.length > Math.max(titleIndex, bodyIndex, ratingIndex)) {
          const title = titleIndex >= 0 ? cleanText(fields[titleIndex]) : '';
          const body = bodyIndex >= 0 ? cleanText(fields[bodyIndex]) : '';
          const rating = ratingIndex >= 0 ? cleanText(fields[ratingIndex]) : '';
          
          // Só adicionar se pelo menos um campo tiver conteúdo
          if (title || body || rating) {
            reviews.push({
              title: title || 'Sem título',
              body: body || 'Sem comentário',
              rating: rating || 'N/A'
            });
          }
        }
      } catch (error) {
        console.warn(`Erro ao processar linha ${i}:`, error);
        continue;
      }
    }
    
    return reviews;
  };

  // Parser CSV robusto que lida com aspas e vírgulas
  const parseCSVLine = (line: string): string[] => {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current); // Add last field
    return fields;
  };

  // Limpar texto removendo aspas extras e espaços
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text.replace(/^"?(.*?)"?$/, '$1').trim();
  };
  
  // Remover arquivo específico
  const removeFile = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Processar listagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const requestData = {
        productName: formData.productName,
        brand: formData.brand,
        category: formData.category,
        keywords: formData.keywords,
        longTailKeywords: formData.longTailKeywords,
        features: formData.features,
        targetAudience: formData.targetAudience,
        reviewsData: reviewsTab === "upload" && formData.uploadedFiles.length > 0
          ? `Arquivos CSV carregados: ${formData.uploadedFiles.map(f => f.name).join(', ')}\n\n${formData.reviewsData}` 
          : formData.reviewsData,
        format: reviewsTab === "upload" ? "csv" : "text"
      };

      const response = await fetch('/api/agents/amazon-listings-optimizer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no processamento');
      }

      const result = await response.json();
      
      // Store result in sessionStorage for the results page
      sessionStorage.setItem('amazonListingResult', JSON.stringify(result));
      
      // Navigate to results page
      navigate('/agents/amazon-listings-optimizer/result');
      
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      alert(`Erro no processamento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Verificar se o formulário está válido
  const isFormValid = () => {
    return formData.productName.trim() && 
           formData.brand.trim() &&
           formData.category.trim() && 
           formData.keywords.trim() &&
           ((reviewsTab === "upload" && formData.uploadedFiles.length > 0) ||
            (reviewsTab === "manual" && formData.reviewsData.trim()));
  };

  // Contar campos preenchidos
  const getCompletionStats = () => {
    const totalFields = 8; // Total de campos no formulário (incluindo marca)
    const filledFields = [
      formData.productName,
      formData.brand,
      formData.category,
      formData.keywords,
      formData.longTailKeywords,
      formData.features,
      formData.targetAudience,
      reviewsTab === "upload" ? (formData.uploadedFiles.length > 0 ? "files" : "") : formData.reviewsData
    ].filter(field => field && field.toString().trim()).length;

    return { filled: filledFields, total: totalFields };
  };

  const completionStats = getCompletionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Informações da Sessão */}
        {sessionInfo && (
          <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Sessão: <strong>{sessionInfo.sessionHash}</strong></span>
              <span>Usuário: <strong>{sessionInfo.userId}</strong></span>
              <span>Status: <strong>{sessionInfo.status}</strong></span>
              {availableTags.length > 0 && (
                <span>Tags: <strong>{availableTags.join(', ')}</strong></span>
              )}
            </div>
          </div>
        )}
        
        {/* Header com padrão Lovable */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/agents">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Amazon Listings Optimizer
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg">
                  Otimize suas listagens da Amazon analisando avaliações de concorrentes e gerando títulos, bullet points e descrições otimizadas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dados Principais do Produto */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Dados Principais do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="text-sm font-medium">
                        Nome do Produto *
                      </Label>
                      <Input
                        id="productName"
                        placeholder="Ex: Fone de Ouvido Bluetooth Premium"
                        value={formData.productName}
                        onChange={(e) => updateField('productName', e.target.value)}
                        className={errors.productName ? "border-red-300" : ""}
                      />
                      {errors.productName && (
                        <p className="text-sm text-red-600">{errors.productName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-sm font-medium">
                        Marca *
                      </Label>
                      <Input
                        id="brand"
                        placeholder="Ex: Sony, JBL, Apple"
                        value={formData.brand}
                        onChange={(e) => updateField('brand', e.target.value)}
                        className={errors.brand ? "border-red-300" : ""}
                      />
                      {errors.brand && (
                        <p className="text-sm text-red-600">{errors.brand}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Categoria *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => updateField('category', value)}
                    >
                      <SelectTrigger className={errors.category ? "border-red-300" : ""}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.name}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Palavras-chave e SEO */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Palavras-chave e SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keywords" className="text-sm font-medium">
                      Palavras-chave Principais *
                    </Label>
                    <Textarea
                      id="keywords"
                      placeholder="fone bluetooth, headphone sem fio, áudio premium, noise cancelling"
                      value={formData.keywords}
                      onChange={(e) => updateField('keywords', e.target.value)}
                      className={`min-h-[80px] ${errors.keywords ? "border-red-300" : ""}`}
                    />
                    <p className="text-xs text-gray-500">
                      Separe as palavras-chave por vírgula
                    </p>
                    {errors.keywords && (
                      <p className="text-sm text-red-600">{errors.keywords}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longTailKeywords" className="text-sm font-medium">
                      Palavras-chave Long Tail
                    </Label>
                    <Textarea
                      id="longTailKeywords"
                      placeholder="fone bluetooth com cancelamento de ruído, headphone sem fio para exercício"
                      value={formData.longTailKeywords}
                      onChange={(e) => updateField('longTailKeywords', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500">
                      Frases mais específicas e longas para SEO
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Características e Público */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Características e Público-alvo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="features" className="text-sm font-medium">
                      Principais Características
                    </Label>
                    <Textarea
                      id="features"
                      placeholder="Bluetooth 5.0, bateria 30h, cancelamento ativo de ruído, design ergonômico"
                      value={formData.features}
                      onChange={(e) => updateField('features', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-sm font-medium">
                      Público-alvo
                    </Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Profissionais que trabalham remotamente, gamers, amantes de música"
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>



              {/* Seção de Avaliações */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Avaliações dos Concorrentes
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Forneça avaliações de produtos concorrentes para análise e otimização
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as "upload" | "manual")}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload CSV
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Texto Manual
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Faça upload de até 10 arquivos CSV com avaliações exportadas do Helium10 ou similar.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <Label htmlFor="csvFiles" className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                              Clique para selecionar arquivos
                            </span>
                            <span className="text-sm text-gray-500 ml-1">ou arraste aqui</span>
                          </Label>
                          <Input
                            id="csvFiles"
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Até 10 arquivos CSV (máx. 2MB cada, 10MB total)
                        </p>
                      </div>
                      
                      {formData.uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {formData.uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700">
                                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          <div className="text-xs text-gray-500 text-center">
                            Total: {formData.uploadedFiles.length} arquivo(s) - {(formData.uploadedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)}MB
                          </div>
                        </div>
                      )}
                      
                      {errors.uploadedFiles && (
                        <p className="text-sm text-red-600">{errors.uploadedFiles}</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="manual" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reviewsData" className="text-sm font-medium">
                          Cole os dados das avaliações
                        </Label>
                        <Textarea
                          id="reviewsData"
                          placeholder="Cole aqui as avaliações dos produtos concorrentes..."
                          value={formData.reviewsData}
                          onChange={(e) => updateField('reviewsData', e.target.value)}
                          className={`min-h-[150px] ${errors.reviewsData ? "border-red-300" : ""}`}
                        />
                        {errors.reviewsData && (
                          <p className="text-sm text-red-600">{errors.reviewsData}</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Resumo Lateral */}
          <div className="space-y-6">
            
            {/* Progresso do Formulário */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Progresso do Formulário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Preenchimento</span>
                    <span>{Math.round((completionStats.filled / completionStats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completionStats.filled / completionStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {completionStats.filled} de {completionStats.total} campos preenchidos
                  </p>
                </div>

                <Separator />

                {/* Checklist de Validação */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Campos Obrigatórios</h4>
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${formData.productName.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.productName.trim() ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      Nome do produto
                    </div>
                    <div className={`flex items-center gap-2 ${formData.category.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.category.trim() ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      Categoria
                    </div>
                    <div className={`flex items-center gap-2 ${formData.keywords.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.keywords.trim() ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      Palavras-chave
                    </div>
                    <div className={`flex items-center gap-2 ${
                      (reviewsTab === "upload" && formData.uploadedFiles.length > 0) || 
                      (reviewsTab === "manual" && formData.reviewsData.trim()) 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {(reviewsTab === "upload" && formData.uploadedFiles.length > 0) || 
                       (reviewsTab === "manual" && formData.reviewsData.trim()) 
                        ? <CheckCircle2 className="w-3 h-3" /> 
                        : <AlertCircle className="w-3 h-3" />}
                      Avaliações
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Botão de Processar */}
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Processar Listagem
                    </>
                  )}
                </Button>
                
                {!isFormValid() && (
                  <p className="text-xs text-gray-500 text-center">
                    Complete os campos obrigatórios para habilitar o processamento
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tags Disponíveis */}
            {availableTags.length > 0 && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Tags Disponíveis para Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Estas tags são geradas automaticamente a partir dos dados preenchidos e podem ser usadas nos prompts do agente.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Informações do Agente */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Sobre este Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tempo médio:</span>
                  <span className="font-medium">2-5 min</span>
                </div>
                <Separator />
                <p className="text-xs text-gray-500">
                  Este agente analisa avaliações de concorrentes para gerar títulos, bullet points e descrições otimizadas para suas listagens Amazon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}