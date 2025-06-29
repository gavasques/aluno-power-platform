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
  X,
  Download,
  Play,
  Square
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
import { Progress } from "@/components/ui/progress";

interface FormData {
  nomeProduto: string;
  marca: string;
  categoria: string;
  keywords: string;
  longTailKeywords: string;
  principaisCaracteristicas: string;
  publicoAlvo: string;
  reviewsData: string;
  uploadedFiles: File[];
}

interface AmazonSession {
  id: string;
  sessionHash: string;
  idUsuario: string;
  status: string;
  currentStep: number;
  reviewsInsight?: string;
  titulos?: string;
  dataHoraCreated: string;
}

interface ProcessingStep {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

export default function AmazonListingsOptimizerNew() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    nomeProduto: "",
    marca: "",
    categoria: "",
    keywords: "",
    longTailKeywords: "",
    principaisCaracteristicas: "",
    publicoAlvo: "",
    reviewsData: "",
    uploadedFiles: []
  });

  // UI state
  const [reviewsTab, setReviewsTab] = useState<"upload" | "manual">("upload");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [session, setSession] = useState<AmazonSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, navigate] = useLocation();

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, name: "Análise das Avaliações", status: 'pending', progress: 0 },
    { id: 2, name: "Geração de Títulos", status: 'pending', progress: 0 }
  ]);
  const [results, setResults] = useState({
    analysis: "",
    titles: ""
  });

  // Load session and departments on mount
  useEffect(() => {
    Promise.all([
      createAmazonSession(),
      loadDepartments()
    ]).finally(() => {
      setIsSessionLoading(false);
    });
  }, []);

  const createAmazonSession = async () => {
    try {
      const response = await fetch('/api/amazon-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: 'user-1' })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Erro ao criar sessão Amazon:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        const sortedDepartments = data.sort((a: Department, b: Department) => 
          a.name.localeCompare(b.name, 'pt-BR')
        );
        setDepartments(sortedDepartments);
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeProduto.trim()) {
      newErrors.nomeProduto = "Nome do produto é obrigatório";
    }
    if (!formData.marca.trim()) {
      newErrors.marca = "Marca é obrigatória";
    }
    if (!formData.categoria.trim()) {
      newErrors.categoria = "Categoria é obrigatória";
    }
    if (!formData.keywords.trim()) {
      newErrors.keywords = "Palavras-chave são obrigatórias";
    }

    // Verificar se tem arquivos ou dados manuais de avaliações
    if (formData.uploadedFiles.length === 0 && !formData.reviewsData.trim()) {
      newErrors.reviewsData = "Dados de avaliações são obrigatórios";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save form data
  const saveFormData = async () => {
    if (!session || !validateForm()) return false;

    try {
      const response = await fetch(`/api/amazon-sessions/${session.id}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar dados');
      }
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      alert(`Erro ao salvar dados: ${error.message}`);
      return false;
    }
  };

  // Process step 1
  const processStep1 = async () => {
    if (!session) return;

    try {
      updateStepStatus(1, 'processing', 0);

      const response = await fetch(`/api/amazon-sessions/${session.id}/process-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({ ...prev, analysis: data.result }));
        updateStepStatus(1, 'completed', 100);
        setCurrentStep(1);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro na Etapa 1');
      }
    } catch (error: any) {
      console.error('Erro na Etapa 1:', error);
      updateStepStatus(1, 'error', 0);
      alert(`Erro na Etapa 1: ${error.message}`);
      return false;
    }
  };

  // Process step 2
  const processStep2 = async () => {
    if (!session) return;

    try {
      updateStepStatus(2, 'processing', 0);

      const response = await fetch(`/api/amazon-sessions/${session.id}/process-step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({ ...prev, titles: data.result }));
        updateStepStatus(2, 'completed', 100);
        setCurrentStep(2);
        
        // Auto download after completion
        setTimeout(() => {
          downloadResults();
        }, 1000);
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro na Etapa 2');
      }
    } catch (error: any) {
      console.error('Erro na Etapa 2:', error);
      updateStepStatus(2, 'error', 0);
      alert(`Erro na Etapa 2: ${error.message}`);
      return false;
    }
  };

  // Complete 2-step process
  const startProcessing = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Step 0: Save data
      const saved = await saveFormData();
      if (!saved) {
        setIsProcessing(false);
        return;
      }

      // Step 1: Analysis
      const step1Success = await processStep1();
      if (!step1Success) {
        setIsProcessing(false);
        return;
      }

      // Step 2: Titles
      const step2Success = await processStep2();
      if (!step2Success) {
        setIsProcessing(false);
        return;
      }

    } catch (error) {
      console.error('Erro no processamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Abort processing
  const abortProcessing = async () => {
    if (!session) return;

    try {
      await fetch(`/api/amazon-sessions/${session.id}/abort`, {
        method: 'POST'
      });

      setIsProcessing(false);
      setProcessingSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'processing' ? 'error' : step.status
      })));
    } catch (error) {
      console.error('Erro ao abortar:', error);
    }
  };

  // Download results
  const downloadResults = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/amazon-sessions/${session.id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `amazon-listing-${session.sessionHash}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar resultados:', error);
    }
  };

  // Update step status
  const updateStepStatus = (stepId: number, status: ProcessingStep['status'], progress: number) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  // Update form field
  const updateField = (field: keyof FormData, value: string | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxFiles = 10;
    
    if (formData.uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }
    
    updateField('uploadedFiles', [...formData.uploadedFiles, ...fileArray]);
  };

  const removeFile = (index: number) => {
    const newFiles = formData.uploadedFiles.filter((_, i) => i !== index);
    updateField('uploadedFiles', newFiles);
  };

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

  const overallProgress = processingSteps.reduce((sum, step) => sum + step.progress, 0) / processingSteps.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/agents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Amazon Listings Optimizer
                </h1>
              </div>
            </div>

            {/* Session Info */}
            {session && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Sessão:</span>
                  <Badge variant="outline">{session.sessionHash}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Usuário:</span>
                  <Badge variant="outline">{session.idUsuario}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <Label htmlFor="nomeProduto">Nome do Produto *</Label>
                    <Input
                      id="nomeProduto"
                      value={formData.nomeProduto}
                      onChange={(e) => updateField('nomeProduto', e.target.value)}
                      placeholder="Ex: Fone de Ouvido Bluetooth Premium"
                      className={errors.nomeProduto ? "border-red-500" : ""}
                    />
                    {errors.nomeProduto && (
                      <p className="text-sm text-red-600">{errors.nomeProduto}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => updateField('marca', e.target.value)}
                      placeholder="Ex: TechAudio"
                      className={errors.marca ? "border-red-500" : ""}
                    />
                    {errors.marca && (
                      <p className="text-sm text-red-600">{errors.marca}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => updateField('categoria', value)}>
                    <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
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
                  {errors.categoria && (
                    <p className="text-sm text-red-600">{errors.categoria}</p>
                  )}
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="keywords">Palavras-chave principais *</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => updateField('keywords', e.target.value)}
                    placeholder="Ex: fone bluetooth, headphone sem fio, áudio premium"
                    className={errors.keywords ? "border-red-500" : ""}
                  />
                  {errors.keywords && (
                    <p className="text-sm text-red-600">{errors.keywords}</p>
                  )}
                </div>

                {/* Long Tail Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="longTailKeywords">Palavras-chave de cauda longa</Label>
                  <Textarea
                    id="longTailKeywords"
                    value={formData.longTailKeywords}
                    onChange={(e) => updateField('longTailKeywords', e.target.value)}
                    placeholder="Ex: fone de ouvido bluetooth com cancelamento de ruído para exercícios"
                    rows={3}
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label htmlFor="principaisCaracteristicas">Características principais</Label>
                  <Textarea
                    id="principaisCaracteristicas"
                    value={formData.principaisCaracteristicas}
                    onChange={(e) => updateField('principaisCaracteristicas', e.target.value)}
                    placeholder="Ex: Bluetooth 5.0, 30h de bateria, resistente à água IPX7"
                    rows={3}
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="publicoAlvo">Público-alvo</Label>
                  <Textarea
                    id="publicoAlvo"
                    value={formData.publicoAlvo}
                    onChange={(e) => updateField('publicoAlvo', e.target.value)}
                    placeholder="Ex: Atletas, profissionais, estudantes que buscam qualidade de áudio"
                    rows={3}
                  />
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados de Avaliações dos Concorrentes</h3>
                    
                    <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as "upload" | "manual")}>
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

                        {/* Uploaded Files List */}
                        {formData.uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Arquivos carregados:</h4>
                              <Button variant="outline" size="sm" onClick={() => updateField('uploadedFiles', [])}>
                                Limpar todos
                              </Button>
                            </div>
                            {formData.uploadedFiles.map((file, index) => (
                              <div
                                key={index}
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
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reviewsData">Dados de Avaliações *</Label>
                          <Textarea
                            id="reviewsData"
                            value={formData.reviewsData}
                            onChange={(e) => updateField('reviewsData', e.target.value)}
                            placeholder="Cole aqui os dados de avaliações dos concorrentes..."
                            rows={8}
                            className={errors.reviewsData ? "border-red-500" : ""}
                          />
                          {errors.reviewsData && (
                            <p className="text-sm text-red-600">{errors.reviewsData}</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Processing Controls */}
                <div className="pt-6 space-y-4">
                  {!isProcessing && currentStep === 0 && (
                    <Button
                      onClick={startProcessing}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Processamento (2 Etapas)
                    </Button>
                  )}

                  {isProcessing && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progresso Geral</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={abortProcessing}
                        >
                          <Square className="mr-2 h-3 w-3" />
                          Abortar
                        </Button>
                      </div>
                      <Progress value={overallProgress} className="w-full" />
                      
                      {/* Step Progress */}
                      <div className="space-y-2">
                        {processingSteps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {step.status === 'pending' && (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              {step.status === 'processing' && (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                              )}
                              {step.status === 'completed' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              {step.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{step.name}</span>
                            <div className="flex-1">
                              <Progress value={step.progress} className="h-2" />
                            </div>
                            <span className="text-xs text-gray-500">{step.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && !isProcessing && (
                    <Button
                      onClick={downloadResults}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Resultados
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {(results.analysis || results.titles) && (
              <div className="mt-8 space-y-6">
                {results.analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise das Avaliações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                        {results.analysis}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {results.titles && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Títulos Gerados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                        {results.titles}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      <span>Etapa:</span>
                      <Badge variant="outline">{currentStep}/2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Criada em:</span>
                      <span className="text-gray-600">
                        {new Date(session.dataHoraCreated).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Process Steps Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Etapas do Processo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Etapa 1: Análise</p>
                    <p className="text-gray-600">Análise completa das avaliações dos concorrentes</p>
                  </div>
                  <div>
                    <p className="font-medium">Etapa 2: Títulos</p>
                    <p className="text-gray-600">Geração de 5 títulos otimizados para Amazon</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800 text-xs">
                      Os resultados serão baixados automaticamente após a conclusão
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}