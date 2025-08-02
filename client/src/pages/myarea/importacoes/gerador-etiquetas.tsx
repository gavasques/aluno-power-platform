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
  pais: "Brasil",
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch user companies
  const { data: companies = [] } = useQuery<UserCompany[]>({
    queryKey: ['/api/user-companies'],
    enabled: true,
  });

  // Handle company selection
  const handleCompanySelect = (companyId: string) => {
    if (companyId === "manual") {
      setSelectedCompany("");
      setCompanyData(initialCompanyData);
      setLogoDataUrl("");
      return;
    }
    
    const company = companies.find(c => c.id.toString() === companyId);
    if (company) {
      setSelectedCompany(companyId);
      setCompanyData({
        razaoSocial: company.corporateName,
        endereco: company.address || "",
        bairro: company.neighborhood || "",
        cidade: company.city || "",
        pais: company.country,
        cep: company.postalCode || "",
        cnpj: "" // CNPJ não está no schema, manter vazio
      });
      
      // Set logo if available
      if (company.logoUrl) {
        setLogoDataUrl(company.logoUrl);
      }
      
      // Fill SAC with company email if available
      if (company.email) {
        setProductData(prev => ({
          ...prev,
          sac: company.email || ""
        }));
      }
    }
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

        // Redimensionar para caber no espaço da etiqueta
        const maxWidth = 120;
        const maxHeight = 40;
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
        
        setLogoDataUrl(canvas.toDataURL());
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
        width: 1.5,
        height: 50,
        displayValue: true,
        fontSize: 10,
        textMargin: 2,
        background: "#ffffff",
        lineColor: "#000000"
      });
      setBarcodeDataUrl(canvas.toDataURL());
    } catch (error) {
      toast({
        title: "Erro ao gerar código de barras",
        description: "Verifique se o código EAN-13 está correto.",
        variant: "destructive"
      });
    }
  }, [productData.eanCode, toast]);

  // Gerar PDF
  const generatePDF = async () => {
    if (!validateEAN13(productData.eanCode)) {
      toast({
        title: "Dados incompletos",
        description: "Verifique o código EAN-13 antes de gerar o PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 60] // 10cm x 6cm
      });

      // Configurar bordas
      pdf.setLineWidth(0.5);
      pdf.rect(2, 2, 96, 56);

      // Coluna esquerda (40%)
      const leftWidth = 38;
      
      // Logo (se houver)
      if (logoDataUrl) {
        pdf.addImage(logoDataUrl, "PNG", 4, 4, 30, 12);
      } else {
        // Logo placeholder
        pdf.setFillColor(0, 0, 0);
        pdf.rect(4, 4, 30, 12, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text("LOGO", 19, 11, { align: "center" });
        pdf.setTextColor(0, 0, 0);
      }

      // Texto "IMPORTADO E DISTRIBUÍDO NO BRASIL POR:"
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "bold");
      pdf.text("IMPORTADO E DISTRIBUÍDO NO BRASIL POR:", 4, 20);

      // Dados da empresa
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "normal");
      const companyInfo = [
        companyData.razaoSocial,
        companyData.endereco,
        `${companyData.bairro}, ${companyData.cidade}`,
        `CEP: ${companyData.cep}`,
        `CNPJ: ${companyData.cnpj}`
      ];
      
      let yPos = 23;
      companyInfo.forEach((line) => {
        pdf.text(line, 4, yPos);
        yPos += 2.5;
      });

      // Código de barras
      if (barcodeDataUrl) {
        pdf.addImage(barcodeDataUrl, "PNG", 4, 40, 34, 15);
      }

      // Coluna direita (60%)
      const rightStartX = 42;
      
      // Nome do produto
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const productLines = pdf.splitTextToSize(productData.nomeProduto, 54);
      pdf.text(productLines, rightStartX, 8);

      // SKU
      pdf.setFontSize(14);
      pdf.text(productData.sku, rightStartX, 20);

      // Conteúdo
      pdf.setFontSize(10);  
      pdf.text(productData.conteudo, rightStartX, 27);

      // Informações adicionais
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      const additionalInfo = [
        productData.cor ? `COR: ${productData.cor}` : "",
        `VALIDADE: ${productData.validade}`,
        `PAÍS DE ORIGEM: ${productData.paisOrigem}`,
        `SAC: ${productData.sac}`
      ].filter(Boolean);

      yPos = 40;
      additionalInfo.forEach((line) => {
        pdf.text(line, rightStartX, yPos);
        yPos += 3;
      });

      // Salvar PDF
      pdf.save(`etiqueta-${productData.sku}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Etiqueta ${productData.sku} foi baixada.`
      });

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente ou verifique os dados.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Limpar dados
  const clearData = () => {
    setCompanyData({
      razaoSocial: "",
      endereco: "",
      bairro: "",
      cidade: "",
      pais: "",
      cep: "",    
      cnpj: ""
    });
    setProductData({
      nomeProduto: "",
      sku: "",
      conteudo: "",
      cor: "",
      validade: "",
      paisOrigem: "",
      sac: "",
      eanCode: ""
    });
    setLogoFile(null);
    setLogoDataUrl("");
    setBarcodeDataUrl("");
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
                      
                      {/* Company Selection Dropdown */}
                      <Select value={selectedCompany} onValueChange={handleCompanySelect}>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Selecionar empresa cadastrada" />
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
                    onClick={generatePDF}
                    disabled={isGenerating || !validateEAN13(productData.eanCode)}
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
                <div className="bg-white border-2 border-black p-2 mx-auto" style={{ width: '320px', height: '192px' }}>
                  <div className="flex h-full">
                    {/* Coluna Esquerda (40%) */}
                    <div className="w-2/5 pr-2 flex flex-col justify-between">
                      {/* Logo */}
                      <div className="h-8 bg-black text-white text-xs flex items-center justify-center mb-2">
                        {logoDataUrl ? (
                          <img src={logoDataUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          "LOGO"
                        )}
                      </div>
                      
                      {/* Texto importado */}
                      <div className="text-xs font-bold mb-1">
                        IMPORTADO E DISTRIBUÍDO NO BRASIL POR:
                      </div>
                      
                      {/* Dados da empresa */}
                      <div className="text-xs space-y-0.5 mb-2 flex-1">
                        <div>{companyData.razaoSocial || "Empresa Ltda"}</div>
                        <div>{companyData.endereco || "Endereço"}</div>
                        <div>{companyData.bairro || "Bairro"}, {companyData.cidade || "Cidade"}</div>
                        <div>CEP: {companyData.cep || "00000000"}</div>
                        <div>CNPJ: {companyData.cnpj || "00.000.000/0001-00"}</div>
                      </div>
                      
                      {/* Código de barras */}
                      <div className="text-center">
                        {barcodeDataUrl ? (
                          <img src={barcodeDataUrl} alt="Barcode" className="max-w-full h-auto" />
                        ) : (
                          <div className="text-xs bg-gray-100 p-1">
                            Código de barras aparecerá aqui
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Coluna Direita (60%) */}
                    <div className="w-3/5 pl-2 flex flex-col">
                      {/* Nome do produto */}
                      <div className="text-sm font-bold mb-2 leading-tight">
                        {productData.nomeProduto || "Nome do Produto"}
                      </div>
                      
                      {/* SKU */}
                      <div className="text-lg font-bold mb-1">
                        {productData.sku || "SKU001"}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="text-xs font-bold mb-2">
                        {productData.conteudo || "CONTÉM X PEÇA(S)"}
                      </div>
                      
                      {/* Informações adicionais */}
                      <div className="text-xs space-y-1 mt-auto">
                        {productData.cor && <div>COR: {productData.cor}</div>}
                        <div>VALIDADE: {productData.validade || "INDETERMINADA"}</div>
                        <div>PAÍS DE ORIGEM: {productData.paisOrigem || "PAÍS"}</div>
                        <div>SAC: {productData.sac || "contato@empresa.com"}</div>
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