import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Palette, Layout, FileImage, Download, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TemplateAnalysisResult {
  analysisId: string;
  templateAnalysis: {
    layout: any;
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: any;
    visualElements: any;
    contentStructure: any;
  };
  previewData: any;
}

export default function TemplateCopyAgent() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'product' | 'generating' | 'result'>('upload');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateAnalysis, setTemplateAnalysis] = useState<TemplateAnalysisResult | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    benefits: '',
    specs: ''
  });
  const [progress, setProgress] = useState(0);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const templateInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setTemplateFile(file);
        setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione uma imagem (PNG, JPG, JPEG, WebP)",
          variant: "destructive"
        });
      }
    }
  };

  const handleProductUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setProductFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione uma imagem (PNG, JPG, JPEG, WebP)",
          variant: "destructive"
        });
      }
    }
  };

  const analyzeTemplate = async () => {
    if (!templateFile || !templateName.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, selecione um template e digite um nome",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setCurrentStep('analysis');
    setProgress(25);

    try {
      const formData = new FormData();
      formData.append('templateImage', templateFile);
      formData.append('templateName', templateName);

      const result = await apiRequest('/api/templates/analyze', {
        method: 'POST',
        body: formData
      });

      setTemplateAnalysis(result);
      setProgress(50);
      setCurrentStep('product');
      
      toast({
        title: "Análise concluída!",
        description: "Template analisado com sucesso. Agora adicione seu produto.",
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o template. Tente novamente.",
        variant: "destructive"
      });
      setCurrentStep('upload');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async () => {
    if (!templateAnalysis || !productFile || !productData.name.trim() || !productData.category.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setCurrentStep('generating');
    setProgress(75);

    try {
      const formData = new FormData();
      formData.append('productImage', productFile);
      formData.append('productName', productData.name);
      formData.append('productCategory', productData.category);
      formData.append('productBenefits', JSON.stringify(productData.benefits.split('\n').filter(b => b.trim())));
      formData.append('productSpecs', JSON.stringify(productData.specs.split('\n').filter(s => s.trim())));

      const result = await apiRequest(`/api/template-copy/${templateAnalysis.analysisId}/apply`, {
        method: 'POST',
        body: formData
      });

      setCopyId(result.copyId);
      
      // Simular progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCurrentStep('result');
            setFinalResult({
              generatedImageUrl: 'https://via.placeholder.com/512x512/3B82F6/white?text=Infográfico+Gerado',
              originalImageUrl: URL.createObjectURL(productFile),
              templateName: templateName,
              productName: productData.name
            });
            return 100;
          }
          return prev + 5;
        });
      }, 500);

      toast({
        title: "Processamento iniciado!",
        description: "Gerando seu infográfico personalizado...",
      });
    } catch (error) {
      console.error('Erro na aplicação:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível aplicar o template. Tente novamente.",
        variant: "destructive"
      });
      setCurrentStep('product');
      setProgress(50);
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setTemplateFile(null);
    setTemplateName('');
    setTemplateAnalysis(null);
    setProductFile(null);
    setProductData({ name: '', category: '', benefits: '', specs: '' });
    setProgress(0);
    setCopyId(null);
    setFinalResult(null);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agente Copiador de Templates</h1>
        <p className="text-[24px] text-muted-foreground">
          Analise qualquer infográfico e replique seu estilo visual para seus produtos
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Process Steps */}
        <div className="space-y-6">
          
          {/* Step 1: Upload Template */}
          <Card className={currentStep === 'upload' ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                1. Escolha um Template
              </CardTitle>
              <CardDescription className="text-[24px]">
                Faça upload de um infográfico que você quer copiar o estilo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Estilo Amazon Premium"
                  className="mt-1"
                />
              </div>
              
              <div>
                <input
                  ref={templateInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => templateInputRef.current?.click()}
                  className="w-full h-32 border-dashed"
                  disabled={currentStep !== 'upload'}
                >
                  {templateFile ? (
                    <div className="text-center">
                      <FileImage className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">{templateFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <span>Clique para escolher imagem</span>
                    </div>
                  )}
                </Button>
              </div>

              <Button
                onClick={analyzeTemplate}
                disabled={!templateFile || !templateName.trim() || loading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Analisar Template
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Add Product */}
          <Card className={currentStep === 'product' ? 'border-primary' : 'opacity-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                2. Adicione Seu Produto
              </CardTitle>
              <CardDescription className="text-[24px]">
                Faça upload da imagem do seu produto e adicione as informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  ref={productInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProductUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => productInputRef.current?.click()}
                  className="w-full h-24 border-dashed"
                  disabled={currentStep !== 'product'}
                >
                  {productFile ? (
                    <div className="text-center">
                      <FileImage className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">{productFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      <span>Imagem do produto</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Nome do Produto *</Label>
                  <Input
                    id="product-name"
                    value={productData.name}
                    onChange={(e) => setProductData({...productData, name: e.target.value})}
                    placeholder="Ex: Fone Bluetooth"
                    disabled={currentStep !== 'product'}
                  />
                </div>
                <div>
                  <Label htmlFor="product-category">Categoria *</Label>
                  <Input
                    id="product-category"
                    value={productData.category}
                    onChange={(e) => setProductData({...productData, category: e.target.value})}
                    placeholder="Ex: Eletrônicos"
                    disabled={currentStep !== 'product'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="product-benefits">Benefícios (um por linha)</Label>
                <Textarea
                  id="product-benefits"
                  value={productData.benefits}
                  onChange={(e) => setProductData({...productData, benefits: e.target.value})}
                  placeholder="Som de alta qualidade&#10;Cancelamento de ruído&#10;Bateria 20h"
                  className="h-20"
                  disabled={currentStep !== 'product'}
                />
              </div>

              <div>
                <Label htmlFor="product-specs">Especificações (uma por linha)</Label>
                <Textarea
                  id="product-specs"
                  value={productData.specs}
                  onChange={(e) => setProductData({...productData, specs: e.target.value})}
                  placeholder="Bluetooth 5.0&#10;Peso: 250g&#10;Cores: Preto, Branco"
                  className="h-20"
                  disabled={currentStep !== 'product'}
                />
              </div>

              <Button
                onClick={applyTemplate}
                disabled={currentStep !== 'product' || loading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Gerar Infográfico
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview/Results */}
        <div className="space-y-6">
          
          {/* Template Analysis Preview */}
          {templateAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Análise do Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Paleta de Cores</h4>
                    <div className="flex gap-2">
                      {Object.entries(templateAnalysis.templateAnalysis.colorPalette).map(([key, color]) => (
                        <div key={key} className="text-center">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs mt-1 block">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Estrutura</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Layout: {templateAnalysis.templateAnalysis.layout.structure}</p>
                      <p>Benefícios: {templateAnalysis.templateAnalysis.contentStructure.benefitCount}</p>
                      <p>Ícones: {templateAnalysis.templateAnalysis.visualElements.hasIcons ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Progress */}
          {currentStep === 'generating' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Gerando Infográfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Aplicando estilo do template ao seu produto...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Result */}
          {finalResult && currentStep === 'result' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Resultado Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Produto Original</h4>
                      <img 
                        src={finalResult.originalImageUrl} 
                        alt="Original"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Infográfico Gerado</h4>
                      <img 
                        src={finalResult.generatedImageUrl} 
                        alt="Gerado"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Imagem
                    </Button>
                    <Button variant="outline" onClick={resetProcess}>
                      Gerar Novo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}