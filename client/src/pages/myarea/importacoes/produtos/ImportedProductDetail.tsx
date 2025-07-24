import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ArrowLeft, Download, Package, Building2, FileText, Calendar, Tag, Barcode, Globe, Image as ImageIcon, Truck, Clock, Star, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface ImportedProduct {
  id: string;
  name: string;
  internalCode: string;
  status: 'research' | 'analysis' | 'negotiation' | 'ordered' | 'shipped' | 'arrived' | 'cancelled';
  description?: string;
  detailedDescription?: string;
  category?: string;
  brand?: string;
  model?: string;
  reference?: string;
  color?: string;
  size?: string;
  variation1?: string;
  variation2?: string;
  material?: string;
  technicalSpecifications?: string;
  hasMultiplePackages: boolean;
  totalPackages: number;
  hsCode?: string;
  ncmCode?: string;
  ipiPercentage?: number;
  productEan?: string;
  productUpc?: string;
  internalBarcode?: string;
  customsDescription?: string;
  supplierId?: number;
  supplierName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  supplierDescription?: string;
  moq?: number;
  leadTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductImage {
  id: string;
  productId: string;
  filename: string;
  originalName: string;
  url: string;
  position: number;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ProductSupplier {
  id: string;
  supplierId: number;
  supplierName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  moq?: number;
  leadTimeDays?: number;
}

interface ProductPackage {
  id: string;
  packageNumber: number;
  description?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
}

// Status mapping
const statusConfig = {
  research: { label: 'Pesquisa', color: 'bg-gray-100 text-gray-800', icon: '🔍' },
  analysis: { label: 'Análise', color: 'bg-blue-100 text-blue-800', icon: '📊' },
  negotiation: { label: 'Negociação', color: 'bg-yellow-100 text-yellow-800', icon: '💬' },
  ordered: { label: 'Pedido', color: 'bg-purple-100 text-purple-800', icon: '📋' },
  shipped: { label: 'Enviado', color: 'bg-orange-100 text-orange-800', icon: '🚚' },
  arrived: { label: 'Chegou', color: 'bg-green-100 text-green-800', icon: '✅' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export default function ImportedProductDetail() {
  const { token } = useAuth();
  const params = useParams();
  const productId = params.id;

  // States
  const [product, setProduct] = useState<ImportedProduct | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all product data
  useEffect(() => {
    if (!productId || !token) return;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Buscar dados do produto
        const productResponse = await fetch(`/api/imported-products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!productResponse.ok) {
          throw new Error(`Erro ${productResponse.status}: ${productResponse.statusText}`);
        }
        
        const productResult = await productResponse.json();
        setProduct(productResult.data);

        // Buscar imagens do produto
        const imagesResponse = await fetch(`/api/product-images/product/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (imagesResponse.ok) {
          const imagesResult = await imagesResponse.json();
          setImages(imagesResult.data?.sort((a: ProductImage, b: ProductImage) => a.position - b.position) || []);
        }

        // Buscar fornecedores do produto (se existir endpoint)
        try {
          const suppliersResponse = await fetch(`/api/imported-product-suppliers/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (suppliersResponse.ok) {
            const suppliersResult = await suppliersResponse.json();
            setSuppliers(suppliersResult.data || []);
          }
        } catch (e) {
          // Endpoint pode não existir ainda
        }

        // Buscar embalagens do produto (se existir endpoint)
        try {
          const packagesResponse = await fetch(`/api/product-packages/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (packagesResponse.ok) {
            const packagesResult = await packagesResponse.json();
            setPackages(packagesResult.data || []);
          }
        } catch (e) {
          // Endpoint pode não existir ainda
        }
        
      } catch (err: any) {
        console.error('[PRODUCT_DETAIL] Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [productId, token]);

  // Função para gerar PDF
  const handleDownloadPDF = async () => {
    if (!product) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Configurar fonte
      pdf.setFont('helvetica');

      // Cabeçalho
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FICHA TÉCNICA DO PRODUTO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Produto em Processo de Importação', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Status
      const statusInfo = statusConfig[product.status];
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Status: ${statusInfo.label}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Linha separadora
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Função auxiliar para adicionar seção
      const addSection = (title: string, content: Array<{ label: string; value: string }>) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        content.forEach(item => {
          if (item.value && item.value.trim()) {
            if (yPosition > pageHeight - 15) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${item.label}:`, margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            
            const lines = pdf.splitTextToSize(item.value, contentWidth - 40);
            pdf.text(lines, margin + 40, yPosition);
            yPosition += lines.length * 4 + 2;
          }
        });

        yPosition += 5;
      };

      // Informações Principais
      addSection('INFORMAÇÕES PRINCIPAIS', [
        { label: 'Nome do Produto', value: product.name },
        { label: 'Código Interno', value: product.internalCode },
        { label: 'Marca', value: product.brand || '' },
        { label: 'Categoria', value: product.category || '' },
        { label: 'Modelo', value: product.model || '' },
        { label: 'Descrição', value: product.description || '' }
      ]);

      // Características Físicas
      addSection('CARACTERÍSTICAS FÍSICAS', [
        { label: 'Cor', value: product.color || '' },
        { label: 'Tamanho', value: product.size || '' },
        { label: 'Material', value: product.material || '' },
        { label: 'Referência', value: product.reference || '' },
        { label: 'Variação 1', value: product.variation1 || '' },
        { label: 'Variação 2', value: product.variation2 || '' }
      ]);

      // Especificações Técnicas
      if (product.technicalSpecifications) {
        addSection('ESPECIFICAÇÕES TÉCNICAS', [
          { label: 'Especificações', value: product.technicalSpecifications }
        ]);
      }

      // Descrição Detalhada
      if (product.detailedDescription) {
        addSection('DESCRIÇÃO DETALHADA', [
          { label: 'Descrição', value: product.detailedDescription }
        ]);
      }

      // Informações Fiscais
      addSection('INFORMAÇÕES FISCAIS', [
        { label: 'Código HS', value: product.hsCode || '' },
        { label: 'Código NCM', value: product.ncmCode || '' },
        { label: 'IPI', value: product.ipiPercentage ? `${product.ipiPercentage}%` : '' },
        { label: 'Descrição Aduaneira', value: product.customsDescription || '' }
      ]);

      // Códigos de Identificação
      addSection('CÓDIGOS DE IDENTIFICAÇÃO', [
        { label: 'EAN', value: product.productEan || '' },
        { label: 'UPC', value: product.productUpc || '' },
        { label: 'Código de Barras Interno', value: product.internalBarcode || '' }
      ]);

      // Informações do Fornecedor
      addSection('INFORMAÇÕES DO FORNECEDOR', [
        { label: 'Nome do Fornecedor', value: product.supplierName || '' },
        { label: 'Código no Fornecedor', value: product.supplierProductCode || '' },
        { label: 'Nome no Fornecedor', value: product.supplierProductName || '' },
        { label: 'MOQ', value: product.moq ? `${product.moq} unidades` : '' },
        { label: 'Lead Time', value: product.leadTimeDays ? `${product.leadTimeDays} dias` : '' },
        { label: 'Descrição do Fornecedor', value: product.supplierDescription || '' }
      ]);

      // Embalagens
      if (product.hasMultiplePackages) {
        addSection('SISTEMA DE EMBALAGENS', [
          { label: 'Total de Volumes', value: `${product.totalPackages} volumes` },
          { label: 'Informações', value: packages.length > 0 ? 
            packages.map(pkg => `Volume ${pkg.packageNumber}: ${pkg.description || 'Sem descrição'}`).join('; ') :
            'Informações de embalagem serão adicionadas posteriormente.'
          }
        ]);
      }

      // Observações
      if (product.notes) {
        addSection('OBSERVAÇÕES IMPORTANTES', [
          { label: 'Notas', value: product.notes }
        ]);
      }

      // Rodapé
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      yPosition = pageHeight - 30;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Ficha Técnica gerada automaticamente pelo Sistema de Gestão de Produtos Importados', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(`Data de Criação: ${new Date(product.createdAt).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(`Última Atualização: ${new Date(product.updatedAt).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(`ID: ${product.id}`, pageWidth / 2, yPosition, { align: 'center' });

      // Salvar PDF
      const fileName = `ficha-produto-${product.internalCode}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: 'PDF gerado com sucesso!',
        description: `O arquivo ${fileName} foi baixado.`,
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Erro ao carregar produto: {error}</p>
            <Link href="/minha-area/importacoes/produtos">
              <Button className="mt-4">Voltar à Lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando ficha completa do produto...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Produto não encontrado</p>
            <Link href="/minha-area/importacoes/produtos">
              <Button className="mt-4">Voltar à Lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[product.status];

  return (
    <>
      {/* Botões de ação */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <Link href="/minha-area/importacoes/produtos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Lista
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link href={`/minha-area/importacoes/produtos/${productId}/editar`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button onClick={handleDownloadPDF} variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal - formato de ficha técnica */}
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto p-8">
          
          {/* Cabeçalho da Ficha */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">FICHA TÉCNICA DO PRODUTO</h1>
            <p className="text-gray-600 mt-2">Produto em Processo de Importação</p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <Badge className={`text-lg px-4 py-2 ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.label}
              </Badge>
              <p className="text-sm text-gray-500">
                Atualizado em: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Coluna Esquerda - Dados Principais */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Informações Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Nome do Produto:</label>
                    <p className="text-lg font-medium">{product.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Código Interno:</label>
                      <p className="font-mono bg-gray-100 px-2 py-1 rounded">{product.internalCode}</p>
                    </div>
                    {product.brand && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Marca:</label>
                        <p>{product.brand}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {product.category && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Categoria:</label>
                        <p>{product.category}</p>
                      </div>
                    )}
                    {product.model && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Modelo:</label>
                        <p>{product.model}</p>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Descrição:</label>
                      <p className="text-gray-800">{product.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Características Físicas */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <Tag className="h-5 w-5 mr-2 text-green-600" />
                    Características Físicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.color && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Cor:</label>
                        <p>{product.color}</p>
                      </div>
                    )}
                    {product.size && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Tamanho:</label>
                        <p>{product.size}</p>
                      </div>
                    )}
                  </div>

                  {product.material && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Material:</label>
                      <p>{product.material}</p>
                    </div>
                  )}

                  {product.variation1 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Variação 1:</label>
                      <p>{product.variation1}</p>
                    </div>
                  )}

                  {product.variation2 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Variação 2:</label>
                      <p>{product.variation2}</p>
                    </div>
                  )}

                  {product.reference && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Referência:</label>
                      <p>{product.reference}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Imagens */}
            <div>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Fotos do Produto ({images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={image.id} className="space-y-2">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={`${product.name} - Foto ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            Foto {image.position} - {image.originalName}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma foto cadastrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Especificações Técnicas */}
          {product.technicalSpecifications && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {product.technicalSpecifications}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descrição Detalhada */}
          {product.detailedDescription && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Descrição Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{product.detailedDescription}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Fiscais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Globe className="h-5 w-5 mr-2 text-red-600" />
                  Informações Fiscais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.hsCode && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Código HS:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.hsCode}</p>
                  </div>
                )}

                {product.ncmCode && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Código NCM:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.ncmCode}</p>
                  </div>
                )}

                {product.ipiPercentage && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">IPI:</label>
                    <p>{product.ipiPercentage}%</p>
                  </div>
                )}

                {product.customsDescription && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Descrição Aduaneira:</label>
                    <p className="text-gray-800">{product.customsDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Códigos de Barras */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Barcode className="h-5 w-5 mr-2 text-gray-600" />
                  Códigos de Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.productEan && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">EAN:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.productEan}</p>
                  </div>
                )}

                {product.productUpc && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">UPC:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.productUpc}</p>
                  </div>
                )}

                {product.internalBarcode && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Código de Barras Interno:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.internalBarcode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações do Fornecedor */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Building2 className="h-5 w-5 mr-2 text-orange-600" />
                Informações do Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {product.supplierName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Nome do Fornecedor:</label>
                    <p className="text-lg font-medium">{product.supplierName}</p>
                  </div>
                )}

                {product.supplierProductCode && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Código no Fornecedor:</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{product.supplierProductCode}</p>
                  </div>
                )}

                {product.supplierProductName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Nome no Fornecedor:</label>
                    <p>{product.supplierProductName}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {product.moq && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">MOQ:</label>
                      <p className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {product.moq} unidades
                      </p>
                    </div>
                  )}

                  {product.leadTimeDays && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Lead Time:</label>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {product.leadTimeDays} dias
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {product.supplierDescription && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Descrição do Fornecedor:</label>
                  <div className="bg-orange-50 p-4 rounded-lg mt-2">
                    <p className="text-gray-800">{product.supplierDescription}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Embalagens */}
          {product.hasMultiplePackages && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2 text-brown-600" />
                  Sistema de Embalagens ({product.totalPackages} volumes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Volume {pkg.packageNumber}</h4>
                        {pkg.description && <p className="text-gray-700 mb-2">{pkg.description}</p>}
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          {pkg.weight && <p><strong>Peso:</strong> {pkg.weight}kg</p>}
                          {pkg.length && <p><strong>Comp:</strong> {pkg.length}cm</p>}
                          {pkg.width && <p><strong>Larg:</strong> {pkg.width}cm</p>}
                          {pkg.height && <p><strong>Alt:</strong> {pkg.height}cm</p>}
                        </div>
                        {pkg.notes && (
                          <p className="text-gray-600 text-sm mt-2 italic">{pkg.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Informações de embalagem serão adicionadas posteriormente.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {product.notes && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                  Observações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{product.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rodapé */}
          <div className="border-t-2 border-gray-300 pt-6 mt-12 text-center text-sm text-gray-500">
            <p>Ficha Técnica gerada automaticamente pelo Sistema de Gestão de Produtos Importados</p>
            <p>Data de Criação: {new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
            <p>Última Atualização: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}</p>
            <p className="mt-2 font-mono text-xs">ID: {product.id}</p>
          </div>

        </div>
      </div>
    </>
  );
}