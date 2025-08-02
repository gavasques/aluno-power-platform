import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Download, AlertCircle, CheckCircle, Trash2, Eye, Image } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserCompany } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

// Função para decodificar HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Interfaces
interface CompanyData {
  razaoSocial: string;
  endereco: string;
  bairro: string;
  cidade: string;
  pais: string;
  cep: string;
  cnpj: string;
}

interface ProductData {
  nomeProduto: string;
  sku: string;
  conteudo: string;
  cor?: string;
  validade: string;
  paisOrigem: string;
  sac: string;
  eanCode: string;
}

// Dados iniciais vazios (serão preenchidos ao selecionar empresa)
const initialCompanyData: CompanyData = {
  razaoSocial: "",
  endereco: "",
  bairro: "",
  cidade: "",
  pais: "",
  cep: "",
  cnpj: ""
};

const initialProductData: ProductData = {
  nomeProduto: "",
  sku: "",
  conteudo: "",
  cor: "",
  validade: "",
  paisOrigem: "",
  sac: "",
  eanCode: ""
};

// Componente principal
export default function GeradorEtiquetas() {
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData);
  const [productData, setProductData] = useState<ProductData>(initialProductData);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch user companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<UserCompany[]>({
    queryKey: ['/api/user-companies'],
    enabled: true,
  });

  // Função para verificar se há dados editados manualmente
  const hasManualEdits = useCallback((currentData: CompanyData, initialData: CompanyData): boolean => {
    return Object.keys(currentData).some(key => {
      const currentValue = currentData[key as keyof CompanyData];
      const initialValue = initialData[key as keyof CompanyData];
      return currentValue !== initialValue && currentValue !== "";
    });
  }, []);

  // Função melhorada para carregar dados da empresa
  const loadCompanyData = useCallback(async (companyId: string, forceLoad: boolean = false) => {
    const company = companies?.find(c => c.id.toString() === companyId);
    if (!company) return;

    // Verifica se há edições manuais
    const hasEdits = hasManualEdits(companyData, initialCompanyData);
    
    if (hasEdits && !forceLoad) {
      // Mostra confirmação antes de sobrescrever
      const shouldOverwrite = window.confirm(
        "Você fez alterações manuais nos dados da empresa. " +
        "Deseja substituir pelos dados da empresa selecionada? " +
        "Esta ação não pode ser desfeita."
      );
      
      if (!shouldOverwrite) {
        // Reseta o seletor para não ficar inconsistente
        setSelectedCompanyId("");
        return;
      }
    }

    // Carrega dados da empresa respeitando o país original
    const newCompanyData: CompanyData = {
      razaoSocial: company.corporateName,
      endereco: company.address || "",
      bairro: company.neighborhood || "",
      cidade: company.city || "",
      pais: company.country || "Brasil", // ✅ CORRIGIDO: Respeita o país da empresa
      cep: company.postalCode || "",
      cnpj: company.cnpj || ""
    };

    setCompanyData(newCompanyData);
    
    // Set logo if available
    if (company.logoUrl) {
      setLogoDataUrl(decodeHtmlEntities(company.logoUrl));
    }
    
    // Fill SAC with company email if available
    if (company.email) {
      setProductData(prev => ({
        ...prev,
        sac: company.email || ""
      }));
    }
    
    toast({
      title: "Dados carregados",
      description: `Dados da empresa "${company.corporateName}" foram carregados com sucesso.`,
    });
  }, [companies, companyData, hasManualEdits, toast]);

  // Função para mesclar dados da empresa com dados atuais
  const mergeCompanyData = useCallback((companyId: string) => {
    const company = companies?.find(c => c.id.toString() === companyId);
    if (!company) return;

    // Mescla apenas campos vazios
    const mergedData: CompanyData = {
      razaoSocial: companyData.razaoSocial || company.corporateName || "",
      endereco: companyData.endereco || company.address || "",
      bairro: companyData.bairro || company.neighborhood || "",
      cidade: companyData.cidade || company.city || "",
      pais: companyData.pais || company.country || "Brasil",
      cep: companyData.cep || company.postalCode || "",
      cnpj: companyData.cnpj || company.cnpj || ""
    };

    setCompanyData(mergedData);
    
    // Set logo if available and not already set
    if (company.logoUrl && !logoDataUrl) {
      setLogoDataUrl(decodeHtmlEntities(company.logoUrl));
    }
    
    // Fill SAC with company email if available and not already set
    if (company.email && !productData.sac) {
      setProductData(prev => ({
        ...prev,
        sac: company.email || ""
      }));
    }
    
    toast({
      title: "Dados mesclados",
      description: "Dados da empresa foram mesclados com suas edições.",
    });
  }, [companies, companyData, logoDataUrl, productData.sac, toast]);

  // Handle company selection (não carrega automaticamente)
  const handleCompanySelect = (companyId: string) => {
    if (companyId === "manual") {
      setSelectedCompany("");
      setSelectedCompanyId("");
      setCompanyData(initialCompanyData);
      setLogoDataUrl("");
      return;
    }
    
    setSelectedCompany(companyId);
    setSelectedCompanyId(companyId);
    // Não carrega automaticamente - deixa o usuário escolher
  };

  // Validação EAN-13
  const validateEAN13 = (code: string): boolean => {
    if (code.length !== 13) return false;
    if (!/^\d+$/.test(code)) return false;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(code[12]);
  };

  // Validação CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/[^\d]/g, "");
    return cleaned.length === 14;
  };

  // Validação CEP
  const validateCEP = (cep: string): boolean => {
    const cleaned = cep.replace(/[^\d]/g, "");
    return cleaned.length === 8;
  };

  // Upload do logo
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "O arquivo é muito grande. Máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Redimensionar para caber no espaço da etiqueta com melhor qualidade
        const maxWidth = 200;
        const maxHeight = 80;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        setLogoDataUrl(canvas.toDataURL('image/png', 1.0));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Gerar código de barras
  const generateBarcode = useCallback(() => {
    if (!validateEAN13(productData.eanCode)) {
      toast({
        title: "Código EAN-13 inválido",
        description: "Verifique se o código possui 13 dígitos e é válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, productData.eanCode, {
        format: "EAN13",
        width: 3,
        height: 90,
        displayValue: true,
        fontSize: 24,
        textMargin: 2,
        background: "#ffffff",
        lineColor: "#000000"
      });
      setBarcodeDataUrl(canvas.toDataURL('image/png', 1.0));
    } catch (error) {
      toast({
        title: "Erro ao gerar código de barras",
        description: "Verifique se o código EAN-13 está correto.",
        variant: "destructive"
      });
    }
  }, [productData.eanCode, toast]);

  // Função para sanitizar texto mantendo acentos e caracteres importantes
  const sanitizeText = useCallback((text: string): string => {
    if (!text) return "";
    return decodeHtmlEntities(text)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove apenas caracteres de controle
      .trim();
  }, []);

  // Função para quebrar texto em linhas que cabem na largura especificada
  const splitTextToFit = useCallback((text: string, maxWidth: number, fontSize: number, pdf: any): string[] => {
    if (!text) return [""];
    
    pdf.setFontSize(fontSize);
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = pdf.getTextWidth(testLine);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Palavra muito longa, força quebra
          lines.push(word.substring(0, 20) + '...');
          currentLine = '';
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [""];
  }, []);

  // Função para validar dados antes da geração
  const validateLabelData = useCallback((): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    
    // Verifica nome do produto
    if (!productData.nomeProduto || productData.nomeProduto.length < 3) {
      warnings.push("Nome do produto muito curto");
    }
    if (productData.nomeProduto && productData.nomeProduto.length > 50) {
      warnings.push("Nome do produto muito longo (será truncado)");
    }
    
    // Verifica razão social
    if (!companyData.razaoSocial || companyData.razaoSocial.length < 5) {
      warnings.push("Razão social muito curta");
    }
    if (companyData.razaoSocial && companyData.razaoSocial.length > 60) {
      warnings.push("Razão social muito longa (será truncada)");
    }
    
    // Verifica SKU/Código
    if (!productData.sku) {
      warnings.push("SKU recomendado para identificação");
    }
    
    // Verifica código de barras
    if (productData.eanCode && productData.eanCode.length < 8) {
      warnings.push("Código EAN muito curto (pode não funcionar)");
    }
    
    return {
      isValid: Boolean(companyData.razaoSocial && productData.nomeProduto),
      warnings
    };
  }, [companyData, productData]);

  // Gerar etiqueta com layout profissional e logo BKZA
  const generateLabel = async () => {
    // Validação básica
    if (!companyData.razaoSocial || !productData.nomeProduto) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos a razão social da empresa e o nome do produto.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Criar PDF com configurações corretas
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [100, 70] // Tamanho da etiqueta: 100mm x 70mm
      });

      // Função para criar logo BKZA
      const createLogo = () => {
        // Fundo preto para a logo
        pdf.setFillColor(0, 0, 0);
        pdf.rect(5, 8, 25, 12, 'F');
        
        // Texto "bkza" em branco
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("bkza", 7, 16);
        
        // ".com.br" menor
        pdf.setFontSize(8);
        pdf.text(".com.br", 18, 18);
        
        // Volta cor do texto para preto
        pdf.setTextColor(0, 0, 0);
      };

      // Layout seguindo o modelo exato
      
      // 1. LOGO BKZA (canto superior esquerdo)
      createLogo();

      // 2. NOME DO PRODUTO (lado direito, grande)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      const nomeProduto = sanitizeText(productData.nomeProduto).toUpperCase();
      
      // Quebra o nome do produto em linhas se necessário
      const maxWidthProduto = 40;
      const palavras = nomeProduto.split(' ');
      let linha1 = '';
      let linha2 = '';
      
      for (const palavra of palavras) {
        const testeLinha = linha1 ? `${linha1} ${palavra}` : palavra;
        if (pdf.getTextWidth(testeLinha) <= maxWidthProduto) {
          linha1 = testeLinha;
        } else {
          linha2 = linha2 ? `${linha2} ${palavra}` : palavra;
        }
      }
      
      pdf.text(linha1, 55, 15);
      if (linha2) {
        pdf.text(linha2, 55, 22);
      }

      // 3. DADOS DA EMPRESA (lado esquerdo)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("IMPORTADO E DISTRIBUÍDO NO BRASIL POR:", 5, 32);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(sanitizeText(companyData.razaoSocial), 5, 37);
      
      if (companyData.endereco) {
        pdf.text(sanitizeText(companyData.endereco), 5, 42);
      }
      
      if (companyData.bairro && companyData.cidade) {
        pdf.text(`${sanitizeText(companyData.bairro)}, ${sanitizeText(companyData.cidade)}`, 5, 47);
      }
      
      let linhaFinal = '';
      if (companyData.cep) {
        linhaFinal += `CEP ${companyData.cep}`;
      }
      if (companyData.cnpj) {
        if (linhaFinal) linhaFinal += ' ';
        linhaFinal += `CNPJ ${companyData.cnpj}`;
      }
      if (linhaFinal) {
        pdf.text(linhaFinal, 5, 52);
      }

      // 4. DADOS DO PRODUTO (lado direito)
      let yProduto = 32;
      
      // SKU/Código
      const skuCodigo = productData.sku;
      if (skuCodigo) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(skuCodigo, 55, yProduto);
        yProduto += 6;
      }
      
      // Conteúdo
      if (productData.conteudo) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`CONTÉM ${sanitizeText(productData.conteudo).toUpperCase()}`, 55, yProduto);
        yProduto += 5;
      }
      
      // Cor
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      if (productData.cor) {
        pdf.text(`COR: ${sanitizeText(productData.cor).toUpperCase()}`, 55, yProduto);
      } else {
        pdf.text("COR: CONFORME IMAGEM", 55, yProduto);
      }
      yProduto += 4;
      
      // Validade
      pdf.text(`VALIDADE: ${productData.validade || "INDETERMINADA"}`, 55, yProduto);
      yProduto += 4;
      
      // País de origem
      pdf.text(`PAÍS DE ORIGEM: ${productData.paisOrigem || "CHINA"}`, 55, yProduto);
      yProduto += 4;
      
      // SAC
      if (productData.sac) {
        pdf.text(`SAC: ${productData.sac}`, 55, yProduto);
      }

      // 5. CÓDIGO DE BARRAS (canto inferior esquerdo)
      if (productData.eanCode && barcodeDataUrl) {
        try {
          // Posição correta do código de barras
          pdf.addImage(barcodeDataUrl, 'PNG', 5, 57, 35, 10);
        } catch (error) {
          console.error("Erro ao gerar código de barras:", error);
        }
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Salvar PDF
      const fileName = `etiqueta_${productData.sku || 'produto'}_${Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Etiqueta gerada com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });

    } catch (error) {
      console.error("Erro ao gerar etiqueta:", error);
      toast({
        title: "Erro ao gerar etiqueta",
        description: "Ocorreu um erro durante a geração. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // Limpar dados
  const clearData = () => {
    setCompanyData(initialCompanyData);
    setProductData(initialProductData);
    setSelectedCompany("");
    setSelectedCompanyId("");
    setLogoFile(null);
    setLogoDataUrl("");
    setBarcodeDataUrl("");
    
    toast({
      title: "Dados limpos",
      description: "Todos os dados foram resetados.",
    });
  };

  // Carregar dados de exemplo
  const loadExample = () => {
    // Removed mock data - now use company selection dropdown instead
    toast({
      title: "Use o dropdown",
      description: "Selecione uma empresa cadastrada no dropdown acima.",
      variant: "default"
    });
  };

  // Gerar código de barras automaticamente quando EAN-13 muda
  React.useEffect(() => {
    if (productData.eanCode && validateEAN13(productData.eanCode)) {
      generateBarcode();
    }
  }, [productData.eanCode, generateBarcode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/minha-area/importacoes">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gerador de Etiquetas
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Crie etiquetas profissionais com código de barras EAN-13
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulários */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="product">Produto</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
              </TabsList>

              {/* Aba Empresa */}
              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">1</Badge>
                        Dados da Empresa
                      </CardTitle>
                      
                      {/* Seletor de empresa melhorado */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={selectedCompanyId}
                            onValueChange={handleCompanySelect}
                            disabled={isLoadingCompanies}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma empresa..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Preencher manualmente</SelectItem>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.tradeName} - {company.corporateName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Botões de ação */}
                          {selectedCompanyId && selectedCompanyId !== "manual" && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadCompanyData(selectedCompanyId, false)}
                                title="Carregar dados (com confirmação se houver edições)"
                              >
                                Carregar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => mergeCompanyData(selectedCompanyId)}
                                title="Mesclar dados (preenche apenas campos vazios)"
                              >
                                Mesclar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadCompanyData(selectedCompanyId, true)}
                                title="Forçar carregamento (substitui tudo)"
                              >
                                Substituir
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {selectedCompanyId && selectedCompanyId !== "manual" && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Carregar:</strong> Substitui dados (com confirmação) • 
                            <strong>Mesclar:</strong> Preenche apenas campos vazios • 
                            <strong>Substituir:</strong> Substitui tudo sem confirmação
                          </p>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Informações da empresa que aparecerão na etiqueta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="razaoSocial">Razão Social *</Label>
                        <Input
                          id="razaoSocial"
                          value={companyData.razaoSocial}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <Input
                          id="endereco"
                          value={companyData.endereco}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, endereco: e.target.value }))}
                          placeholder="Rua, número, complemento"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          value={companyData.bairro}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Nome do bairro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input
                          id="cidade"
                          value={companyData.cidade}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pais">País *</Label>
                        <Input
                          id="pais"
                          value={companyData.pais}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, pais: e.target.value }))}
                          placeholder="Brasil"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          value={companyData.cep}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, cep: e.target.value }))}
                          placeholder="00000000"
                          className={!validateCEP(companyData.cep) && companyData.cep ? "border-red-300" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cnpj">CNPJ *</Label>
                        <Input
                          id="cnpj"
                          value={companyData.cnpj}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0001-00"
                          className={!validateCNPJ(companyData.cnpj) && companyData.cnpj ? "border-red-300" : ""}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Produto */}
              <TabsContent value="product">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">2</Badge>
                      Dados do Produto
                    </CardTitle>
                    <CardDescription>
                      Informações específicas do produto para a etiqueta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nomeProduto">Nome do Produto *</Label>
                      <Textarea
                        id="nomeProduto"
                        value={productData.nomeProduto}
                        onChange={(e) => setProductData(prev => ({ ...prev, nomeProduto: e.target.value }))}
                        placeholder="Nome completo do produto"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={productData.sku}
                          onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                          placeholder="REP001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conteudo">Conteúdo *</Label>
                        <Input
                          id="conteudo"
                          value={productData.conteudo}
                          onChange={(e) => setProductData(prev => ({ ...prev, conteudo: e.target.value }))}
                          placeholder="CONTÉM 1 PEÇA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cor">Cor (opcional)</Label>
                        <Input
                          id="cor"
                          value={productData.cor}
                          onChange={(e) => setProductData(prev => ({ ...prev, cor: e.target.value }))}
                          placeholder="PRETA, BRANCA, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="validade">Validade *</Label>
                        <Input
                          id="validade"
                          value={productData.validade}
                          onChange={(e) => setProductData(prev => ({ ...prev, validade: e.target.value }))}
                          placeholder="INDETERMINADA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paisOrigem">País de Origem *</Label>
                        <Input
                          id="paisOrigem"
                          value={productData.paisOrigem}
                          onChange={(e) => setProductData(prev => ({ ...prev, paisOrigem: e.target.value }))}
                          placeholder="CHINA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sac">SAC *</Label>
                        <Input
                          id="sac"
                          value={productData.sac}
                          onChange={(e) => setProductData(prev => ({ ...prev, sac: e.target.value }))}
                          placeholder="contato@empresa.com.br"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="eanCode">Código EAN-13 *</Label>
                      <Input
                        id="eanCode"
                        value={productData.eanCode}
                        onChange={(e) => setProductData(prev => ({ ...prev, eanCode: e.target.value }))}
                        placeholder="7898741210559"
                        className={!validateEAN13(productData.eanCode) && productData.eanCode ? "border-red-300" : ""}
                      />
                      {productData.eanCode && !validateEAN13(productData.eanCode) && (
                        <p className="text-sm text-red-600 mt-1">
                          Código EAN-13 inválido. Deve ter 13 dígitos válidos.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Logo */}
              <TabsContent value="logo">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">3</Badge>
                      Upload do Logo
                    </CardTitle>
                    <CardDescription>
                      Logo da empresa (opcional, PNG/JPG, máx. 2MB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      {logoDataUrl ? (
                        <div className="space-y-4">
                          <img 
                            src={logoDataUrl} 
                            alt="Logo preview" 
                            className="max-h-20 mx-auto border rounded"
                          />
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Trocar Logo
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoDataUrl("");
                                if (logoInputRef.current) logoInputRef.current.value = "";
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Image className="h-12 w-12 mx-auto text-gray-400" />
                          <div>
                            <Button
                              variant="outline"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar Logo
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">
                              PNG, JPG até 2MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Ações */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={generateLabel}
                    disabled={isGenerating || !companyData.razaoSocial || !productData.nomeProduto}
                    className="flex-1 md:flex-initial"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar PDF
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={loadExample}>
                    Carregar Exemplo
                  </Button>
                  <Button variant="destructive" onClick={clearData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview da Etiqueta */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview da Etiqueta
                </CardTitle>
                <CardDescription>
                  Visualização em tempo real da etiqueta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preview Container */}
                <div className="overflow-auto">
                  <div className="bg-white border border-gray-800 mx-auto shadow-lg" style={{ width: '400px', maxWidth: '100%', height: '240px' }}>
                    <div className="flex h-full p-3">
                    {/* Coluna Esquerda (40%) */}
                    <div className="w-2/5 pr-3 flex flex-col">
                      {/* Logo */}
                      <div className="mb-2">
                        {logoDataUrl ? (
                          <img src={logoDataUrl} alt="Logo" className="max-h-14 max-w-full object-contain" />
                        ) : (
                          <div className="h-14 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                            Logo
                          </div>
                        )}
                      </div>
                      
                      {/* Texto importado */}
                      <div className="text-[9px] font-bold mb-1 uppercase">
                        IMPORTADO E DISTRIBUÍDO NO BRASIL POR:
                      </div>
                      
                      {/* Dados da empresa */}
                      <div className="text-[9px] space-y-0.5 mb-2 flex-1 uppercase">
                        <div>{companyData.razaoSocial || "Empresa Ltda"}</div>
                        <div>{companyData.endereco || "Endereço"}</div>
                        <div>{companyData.bairro || "Bairro"}, {companyData.cidade || "Cidade"}</div>
                        <div>CEP {companyData.cep || "00000000"}</div>
                        <div>CNPJ {companyData.cnpj || "00.000.000/0001-00"}</div>
                      </div>
                      
                      {/* Código de barras */}
                      <div className="mt-auto">
                        {barcodeDataUrl ? (
                          <img src={barcodeDataUrl} alt="Barcode" className="w-full h-auto" style={{ maxHeight: '56px' }} />
                        ) : (
                          <div className="h-14 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            Código de barras
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Coluna Direita (60%) */}
                    <div className="w-3/5 pl-3 flex flex-col">
                      {/* Nome do produto */}
                      <div className="text-xs mb-3 leading-tight line-clamp-3 uppercase">
                        {productData.nomeProduto || "Nome do Produto"}
                      </div>
                      
                      {/* SKU */}
                      <div className="text-sm font-bold mb-2 uppercase">
                        {productData.sku || "SKU001"}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="text-xs font-semibold mb-3 uppercase">
                        CONTÉM {productData.conteudo || "10 PEÇAS"}
                      </div>
                      
                      {/* Informações adicionais */}
                      <div className="text-[9px] space-y-0.5 mt-auto">
                        {productData.cor && <div className="uppercase">COR: {productData.cor}</div>}
                        <div className="uppercase">VALIDADE: {productData.validade || "INDETERMINADA"}</div>
                        <div className="uppercase">PAÍS DE ORIGEM: {productData.paisOrigem || "CHINA"}</div>
                        <div>SAC: {productData.sac || "contato@bkza.com.br"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                
                {/* Status */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {validateEAN13(productData.eanCode) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    Código EAN-13: {validateEAN13(productData.eanCode) ? "Válido" : "Inválido"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {logoDataUrl ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    Logo: {logoDataUrl ? "Carregado" : "Não carregado"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status das Validações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${validateCNPJ(companyData.cnpj) ? 'text-green-600' : 'text-red-600'}`}>
                    {validateCNPJ(companyData.cnpj) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    CNPJ {validateCNPJ(companyData.cnpj) ? 'válido' : 'inválido'}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${validateCEP(companyData.cep) ? 'text-green-600' : 'text-red-600'}`}>
                    {validateCEP(companyData.cep) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    CEP {validateCEP(companyData.cep) ? 'válido' : 'inválido'}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${validateEAN13(productData.eanCode) ? 'text-green-600' : 'text-red-600'}`}>
                    {validateEAN13(productData.eanCode) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    EAN-13 {validateEAN13(productData.eanCode) ? 'válido' : 'inválido'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <canvas ref={barcodeCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}