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

import { useGetFeatureCost, useCanProcessFeature } from "@/hooks/useFeatureCosts";
// Importação dinâmica do jsPDF para evitar problemas de SSR
const loadJsPDF = async () => {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
};

// Função para baixar conteúdo como TXT
const downloadTXT = (results: any, formData: any) => {
  if (!results) return;
  
  let content = `RELATÓRIO DE OTIMIZAÇÃO AMAZON LISTINGS\n`;
  content += `===========================================\n\n`;
  content += `Data de Geração: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  content += `DADOS DO PRODUTO:\n`;
  content += `-----------------\n`;
  content += `Nome do Produto: ${formData.productName}\n`;
  content += `Marca: ${formData.brand}\n`;
  content += `Categoria: ${formData.category}\n`;
  content += `Público Alvo: ${formData.targetAudience}\n`;
  content += `Palavras-chave: ${formData.keywords}\n`;
  content += `Long Tail Keywords: ${formData.longTailKeywords}\n\n`;
  
  if (results.analysis) {
    content += `ANÁLISE DE AVALIAÇÕES DOS CONCORRENTES:\n`;
    content += `======================================\n`;
    content += `${results.analysis}\n\n`;
  }
  
  if (results.titles) {
    content += `TÍTULOS OTIMIZADOS:\n`;
    content += `==================\n`;
    content += `${results.titles}\n\n`;
  }
  
  if (results.bulletPoints) {
    content += `BULLET POINTS:\n`;
    content += `=============\n`;
    content += `${results.bulletPoints}\n\n`;
  }
  
  if (results.description) {
    content += `DESCRIÇÃO COMPLETA:\n`;
    content += `==================\n`;
    content += `${results.description}\n\n`;
  }
  
  content += `---\nRelatório gerado pelo Core Guilherme Vasques\n`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `amazon-listing-${formData.productName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para baixar conteúdo como PDF
const downloadPDF = async (results: any, formData: any) => {
  if (!results) return;
  
  try {
    const jsPDF = await loadJsPDF();
    const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 30;
  
  // Função para adicionar texto com quebra de linha
  const addTextWithWrap = (text: string, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.5) + 5;
    
    // Verificar se precisa de nova página
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 30;
    }
  };
  
  // Título principal
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE OTIMIZAÇÃO AMAZON LISTINGS', margin, yPosition);
  yPosition += 20;
  
  // Data de geração
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 15;
  
  // Dados do produto
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO PRODUTO:', margin, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  addTextWithWrap(`Nome do Produto: ${formData.productName}`);
  addTextWithWrap(`Marca: ${formData.brand}`);
  addTextWithWrap(`Categoria: ${formData.category}`);
  addTextWithWrap(`Público Alvo: ${formData.targetAudience}`);
  addTextWithWrap(`Palavras-chave: ${formData.keywords}`);
  addTextWithWrap(`Long Tail Keywords: ${formData.longTailKeywords}`);
  yPosition += 10;
  
  // Análise
  if (results.analysis) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANÁLISE DE AVALIAÇÕES DOS CONCORRENTES:', margin, yPosition);
    yPosition += 10;
    addTextWithWrap(results.analysis);
    yPosition += 10;
  }
  
  // Títulos
  if (results.titles) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TÍTULOS OTIMIZADOS:', margin, yPosition);
    yPosition += 10;
    addTextWithWrap(results.titles);
    yPosition += 10;
  }
  
  // Bullet Points
  if (results.bulletPoints) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BULLET POINTS:', margin, yPosition);
    yPosition += 10;
    addTextWithWrap(results.bulletPoints);
    yPosition += 10;
  }
  
  // Descrição
  if (results.description) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIÇÃO COMPLETA:', margin, yPosition);
    yPosition += 10;
    addTextWithWrap(results.description);
  }
  
  // Rodapé
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Relatório gerado pelo Core Guilherme Vasques', margin, pdf.internal.pageSize.getHeight() - 10);
  }
  
  pdf.save(`amazon-listing-${formData.productName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

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
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Dynamic cost checking
  const { getFeatureCost } = useGetFeatureCost();
  const { canProcess } = useCanProcessFeature();
  const featureName = "agents.amazon_listing";
  const requiredCredits = getFeatureCost(featureName) || 3; // Default to 3 if not found

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

  // Validação simplificada do formulário - apenas verificar se tem dados das avaliações
  const isFormValid = (() => {
    const hasProductName = !!formData.productName?.trim();
    const hasReviewsData = reviewsTab === "text" ? !!formData.reviewsData?.trim() : uploadedFiles.length > 0;
    
    console.log('Form validation:', {
      hasProductName,
      hasReviewsData,
      reviewsTab,
      uploadedFilesCount: uploadedFiles.length,
      reviewsDataLength: formData.reviewsData?.length || 0,
      productName: formData.productName
    });
    
    return hasProductName && hasReviewsData;
  })();

  // Funções de download
  const handleDownloadPDF = async () => {
    if (!results) {
      toast({
        title: "Erro no download",
        description: "Nenhum resultado disponível para download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await downloadPDF(results, formData);
      toast({
        title: "Download iniciado",
        description: "O relatório PDF está sendo baixado...",
      });
    } catch (error) {
      console.error('Erro no download PDF:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTXT = () => {
    if (!results) {
      toast({
        title: "Erro no download",
        description: "Nenhum resultado disponível para download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      downloadTXT(results, formData);
      toast({
        title: "Download iniciado",
        description: "O arquivo TXT está sendo baixado...",
      });
    } catch (error) {
      console.error('Erro no download TXT:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao gerar o arquivo TXT.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('isFormValid:', isFormValid);
    console.log('formData:', formData);
    console.log('reviewsTab:', reviewsTab);
    console.log('uploadedFiles:', uploadedFiles);
    
    if (!isFormValid) {
      console.log('Form is not valid, returning early');
      toast({
        title: "Formulário incompleto",
        description: "Preencha pelo menos o nome do produto e adicione dados das avaliações dos concorrentes.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar créditos primeiro
    try {
      const dashboardResponse = await apiRequest('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const userBalance = dashboardResponse.user.creditBalance;
      const { canProcess: canAfford, missingCredits } = canProcess(featureName, userBalance);
      
      if (!canAfford) {
        toast({
          title: "Créditos insuficientes",
          description: `Você precisa de ${requiredCredits} créditos para usar este agente. Você tem ${userBalance} créditos (faltam ${missingCredits}).`,
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      });
      
      if (!dataResponse.ok) {
        throw new Error('Erro ao salvar dados do produto');
      }
      
      // 3. Processar Etapa 1 (Análise)
      const step1Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step1`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!step1Response.ok) {
        throw new Error('Erro na análise das avaliações');
      }
      
      // 4. Processar Etapa 2 (Títulos)
      const step2Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step2`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!step2Response.ok) {
        throw new Error('Erro na geração de títulos');
      }

      // 5. Processar Etapa 3 (Bullet Points)
      const step3Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step3`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!step3Response.ok) {
        throw new Error('Erro na geração de bullet points');
      }

      // 6. Processar Etapa 4 (Descrição)
      const step4Response = await fetch(`/api/amazon-sessions/${sessionId}/process-step4`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
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
            amount: requiredCredits,
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
            creditsUsed: requiredCredits,
            prompt: `Produto: ${formData.productName}`,
            response: 'Listagem otimizada gerada',
            provider: 'openai',
            model: 'gpt-4o-mini'
          })
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
      
      // 9. Obter dados das respostas e exibir resultados
      const step1Data = await step1Response.json();
      const step2Data = await step2Response.json();
      const step3Data = await step3Response.json();
      const step4Data = await step4Response.json();
      
      console.log('Dados processados:', { step1Data, step2Data, step3Data, step4Data });
      
      // Extrair conteúdo real das respostas
      const resultData = {
        sessionId: sessionId,
        analysis: step1Data?.result || step1Data?.analysis || "Análise concluída",
        titles: step2Data?.result || step2Data?.titles || "Títulos gerados",
        bulletPoints: step3Data?.result || step3Data?.bulletPoints || "Bullet points gerados",
        description: step4Data?.result || step4Data?.description || "Descrição gerada"
      };
      
      setResults(resultData);
      setShowResults(true);
      
      toast({
        title: "Listagem otimizada com sucesso!",
        description: "Sua listagem foi processada e otimizada com IA. Verifique os resultados abaixo.",
        variant: "default"
      });
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-3 py-2 space-y-2">
        {/* Header - COMPACTO */}
        <div className="flex items-center space-x-3 mb-2">
          <Link href="/agentes">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Voltar aos Agentes
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Amazon Listings Optimizer
              </h1>
              <p className="text-xs text-gray-600">
                Otimize suas listagens da Amazon com análise de avaliações dos concorrentes
              </p>
            </div>
          </div>
        </div>

        {/* Credit Cost Warning - COMPACTO */}
        <Alert className="border-orange-200 bg-orange-50 py-2">
          <AlertCircle className="h-3 w-3 text-orange-600" />
          <AlertDescription className="text-orange-800 text-sm">
            <strong>Custo:</strong> Este agente consome <strong>{requiredCredits} créditos</strong> por otimização. Verifique seu saldo antes de prosseguir.
          </AlertDescription>
        </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form - COMPACTO */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informações do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Product Name and Brand */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      rows={4}
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
                    <Tabs value={reviewsTab} onValueChange={(value) => setReviewsTab(value as "upload" | "text")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
                        <TabsTrigger value="text">Texto Manual</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-2">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 bg-blue-50">
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
                          Otimizar Listagem ({requiredCredits} créditos)
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - COMPACTO */}
            <div className="space-y-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Info className="h-3 w-3" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">1</Badge>
                    <div>
                      <h4 className="font-medium text-xs">Análise de Avaliações</h4>
                      <p className="text-xs text-muted-foreground">
                        Analisamos as avaliações dos concorrentes para identificar pontos fortes e fracos
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-1" />
                  
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">2</Badge>
                    <div>
                      <h4 className="font-medium text-xs">Geração de Títulos</h4>
                      <p className="text-xs text-muted-foreground">
                        Criamos títulos otimizados baseados na análise e suas palavras-chave
                      </p>
                    </div>
                  </div>

                  <Separator className="my-1" />
                  
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">3</Badge>
                    <div>
                      <h4 className="font-medium text-xs">Geração de Bullet Points</h4>
                      <p className="text-xs text-muted-foreground">
                        Desenvolvemos bullet points persuasivos usando dados da análise e títulos gerados
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-1" />
                  
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">4</Badge>
                    <div>
                      <h4 className="font-medium text-xs">Descrição Completa</h4>
                      <p className="text-xs text-muted-foreground">
                        Criamos uma descrição otimizada integrando todas as etapas anteriores
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Use dados reais do Helium10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Inclua palavras-chave relevantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Defina seu público-alvo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          {showResults && results && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Resultados da Otimização</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Analysis */}
                  {results.analysis && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                        <Badge variant="outline">1</Badge>
                        <span>Análise de Avaliações</span>
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">{results.analysis}</pre>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Titles */}
                  {results.titles && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                        <Badge variant="outline">2</Badge>
                        <span>Títulos Otimizados</span>
                      </h3>
                      <div className="space-y-2">
                        {results.titles.split('\n').filter((title: string) => title.trim()).map((title: string, index: number) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium">{title.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Bullet Points */}
                  {results.bulletPoints && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                        <Badge variant="outline">3</Badge>
                        <span>Bullet Points</span>
                      </h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">{results.bulletPoints}</pre>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Description */}
                  {results.description && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                        <Badge variant="outline">4</Badge>
                        <span>Descrição Completa</span>
                      </h3>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">{results.description}</pre>
                      </div>
                    </div>
                  )}

                  {/* Download Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={handleDownloadPDF}
                      size="lg"
                      variant="default"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button
                      onClick={handleDownloadTXT}
                      size="lg"
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Baixar TXT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}