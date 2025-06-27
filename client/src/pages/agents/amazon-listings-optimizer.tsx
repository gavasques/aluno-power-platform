import { useState } from "react";
import { Link } from "wouter";
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

interface FormData {
  productName: string;
  category: string;
  price: string;
  keywords: string;
  longTailKeywords: string;
  features: string;
  targetAudience: string;
  competitors: string;
  reviewsData: string;
  uploadedFile: File | null;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function AmazonListingsOptimizer() {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    category: "",
    price: "",
    keywords: "",
    longTailKeywords: "",
    features: "",
    targetAudience: "",
    competitors: "",
    reviewsData: "",
    uploadedFile: null
  });

  const [reviewsTab, setReviewsTab] = useState<"upload" | "manual">("upload");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Atualizar campo do formulário
  const updateField = (field: keyof FormData, value: string | File | null) => {
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

    if (!formData.category.trim()) {
      newErrors.category = "Categoria é obrigatória";
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = "Palavras-chave são obrigatórias";
    }

    // Validação das avaliações (uma das duas opções)
    if (reviewsTab === "upload") {
      if (!formData.uploadedFile) {
        newErrors.uploadedFile = "Arquivo CSV é obrigatório";
      }
    } else {
      if (!formData.reviewsData.trim()) {
        newErrors.reviewsData = "Dados das avaliações são obrigatórios";
      }
    }

    // Validação de preço
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Preço deve ser um número válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simular upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.name.endsWith('.csv')) {
      setErrors(prev => ({
        ...prev,
        uploadedFile: "Apenas arquivos CSV são aceitos"
      }));
      return;
    }
    updateField('uploadedFile', file);
  };

  // Processar listagem (simulado)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    // Simular processamento
    setTimeout(() => {
      setIsProcessing(false);
      // Aqui seria feita a integração real com a API
      console.log("Processando listagem:", formData);
    }, 3000);
  };

  // Verificar se o formulário está válido
  const isFormValid = () => {
    return formData.productName.trim() && 
           formData.category.trim() && 
           formData.keywords.trim() &&
           ((reviewsTab === "upload" && formData.uploadedFile) ||
            (reviewsTab === "manual" && formData.reviewsData.trim()));
  };

  // Contar campos preenchidos
  const getCompletionStats = () => {
    const totalFields = 9; // Total de campos no formulário
    const filledFields = [
      formData.productName,
      formData.category,
      formData.price,
      formData.keywords,
      formData.longTailKeywords,
      formData.features,
      formData.targetAudience,
      formData.competitors,
      reviewsTab === "upload" ? formData.uploadedFile : formData.reviewsData
    ].filter(field => field && field.toString().trim()).length;

    return { filled: filledFields, total: totalFields };
  };

  const completionStats = getCompletionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
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
                      <Label htmlFor="category" className="text-sm font-medium">
                        Categoria *
                      </Label>
                      <Input
                        id="category"
                        placeholder="Ex: Eletrônicos > Áudio"
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className={errors.category ? "border-red-300" : ""}
                      />
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Preço (R$)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="199.90"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className={errors.price ? "border-red-300" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
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

              {/* Informações Extras */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Informações Extras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competitors" className="text-sm font-medium">
                      Principais Concorrentes
                    </Label>
                    <Textarea
                      id="competitors"
                      placeholder="Sony WH-1000XM4, Bose QuietComfort, JBL Tune"
                      value={formData.competitors}
                      onChange={(e) => updateField('competitors', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500">
                      Liste os principais produtos concorrentes
                    </p>
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
                          Faça upload de um arquivo CSV com avaliações exportadas do Helium10 ou similar.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <Label htmlFor="csvFile" className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                              Clique para selecionar arquivo
                            </span>
                            <span className="text-sm text-gray-500 ml-1">ou arraste aqui</span>
                          </Label>
                          <Input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Apenas arquivos CSV (máx. 10MB)
                        </p>
                      </div>
                      
                      {formData.uploadedFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            {formData.uploadedFile.name} carregado com sucesso
                          </span>
                        </div>
                      )}
                      
                      {errors.uploadedFile && (
                        <p className="text-sm text-red-600">{errors.uploadedFile}</p>
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
                      (reviewsTab === "upload" && formData.uploadedFile) || 
                      (reviewsTab === "manual" && formData.reviewsData.trim()) 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {(reviewsTab === "upload" && formData.uploadedFile) || 
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

            {/* Informações do Agente */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Sobre este Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Modelo:</span>
                  <span className="font-medium">GPT-4</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por 1k tokens:</span>
                  <span className="font-medium">$0.030</span>
                </div>
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