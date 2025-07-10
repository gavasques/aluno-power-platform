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
  Loader2,
  Info,
  X
} from "lucide-react";
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
  const [reviewsTab, setReviewsTab] = useState<"upload" | "text">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    // Verificar créditos primeiro
    try {
      const dashboardResponse = await apiRequest('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (dashboardResponse.user.creditBalance < 10) {
        toast({
          title: "Créditos insuficientes",
          description: "Você precisa de pelo menos 10 créditos para usar este agente.",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Erro ao verificar créditos",
        description: "Não foi possível verificar seu saldo de créditos.",
        variant: "destructive"
      });
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
      
      // 7. Deduzir créditos
      try {
        await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            amount: 10,
            reason: 'Amazon Listings Optimizer - Otimização de listagem'
          })
        });
      } catch (creditError) {
        console.error('Erro ao deduzir créditos:', creditError);
      }

      // 8. Registrar log de uso
      try {
        await apiRequest('/api/ai-generation-logs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            feature: 'agents.amazon_listing',
            creditsUsed: 10,
            prompt: `Produto: ${formData.productName}`,
            response: 'Listagem otimizada gerada',
            provider: 'openai',
            model: 'gpt-4o-mini'
          })
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
      
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
    (reviewsTab === "text" ? formData.reviewsData : uploadedFiles.length > 0);

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
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                        placeholder="Ex: Fone de Ouvido Bluetooth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                        placeholder="Ex: Sony"
                      />
                    </div>
                  </div>

                  {/* Category */}
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
                        ) : departments?.length > 0 ? (
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

                  {/* Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keywords">Palavras-chave Principais</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => handleInputChange("keywords", e.target.value)}
                        placeholder="Ex: fone bluetooth, sem fio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longTailKeywords">Long Tail Keywords</Label>
                      <Input
                        id="longTailKeywords"
                        value={formData.longTailKeywords}
                        onChange={(e) => handleInputChange("longTailKeywords", e.target.value)}
                        placeholder="Ex: fone bluetooth com cancelamento ruído"
                      />
                    </div>
                  </div>

                  {/* Features and Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="features">Características Principais</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => handleInputChange("features", e.target.value)}
                        placeholder="Ex: 30h de bateria, resistente à água"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetAudience">Público-Alvo</Label>
                      <Textarea
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                        placeholder="Ex: Jovens, profissionais, esportistas"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Reviews Data */}
                  <div>
                    <Label>Dados das Avaliações dos Concorrentes *</Label>
                    <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as "upload" | "text")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
                        <TabsTrigger value="text">Texto Manual</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-4">
                        <div>
                          <Input
                            type="file"
                            accept=".csv,.txt"
                            multiple
                            onChange={handleFileUpload}
                            className="mb-2"
                          />
                          <p className="text-sm text-muted-foreground">
                            Aceita arquivos CSV ou TXT (máximo 10 arquivos)
                          </p>
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
                          onChange={(e) => handleInputChange("reviewsData", e.target.value)}
                          placeholder="Cole aqui as avaliações dos concorrentes (formato Helium10 ou texto livre)"
                          rows={8}
                          className="w-full"
                        />
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
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
  );
}