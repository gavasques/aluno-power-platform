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

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to results page
      navigate("/agents/amazon-listings-optimizer/result?session=demo");
    } catch (error) {
      console.error("Error processing:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = formData.productName && formData.brand && formData.category && 
    (reviewsTab === "text" ? formData.reviewsData : uploadedFiles.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/agents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Agentes
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Amazon Listings Optimizer
        </h1>
        <p className="text-muted-foreground">
          Otimize suas listagens da Amazon com análise de avaliações dos concorrentes
        </p>
      </div>

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
                  <Label htmlFor="longTailKeywords">Palavras-chave de Cauda Longa</Label>
                  <Input
                    id="longTailKeywords"
                    value={formData.longTailKeywords}
                    onChange={(e) => handleInputChange("longTailKeywords", e.target.value)}
                    placeholder="Ex: fone bluetooth com cancelamento de ruído"
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
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{file.name}</span>
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
                      placeholder="Cole aqui as avaliações dos concorrentes..."
                      rows={8}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Otimizar Listagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                    Criamos 5 títulos otimizados baseados na análise e suas palavras-chave
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
    </div>
  );
}