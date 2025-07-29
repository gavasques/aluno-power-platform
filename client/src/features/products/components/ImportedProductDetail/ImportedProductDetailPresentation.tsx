/**
 * PRESENTATION: ImportedProductDetailPresentation
 * Interface de usuário para detalhes de produtos importados
 * Extraído de ImportedProductDetail.tsx (1020 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { ArrowLeft, Download, Package, Building2, FileText, Calendar, Tag, Barcode, Globe, Image as ImageIcon, Truck, Clock, Star, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { LoadingState } from '@/components/ui/states/LoadingState';
import { ErrorState } from '@/components/ui/states/ErrorState';

// Import specialized components
import { ProductHeader } from '../ProductHeader/ProductHeader';
import { ProductInfoCard } from '../ProductInfoCard/ProductInfoCard';
import { ProductImagesGrid } from '../ProductImagesGrid/ProductImagesGrid';
import { ProductSuppliersTable } from '../ProductSuppliersTable/ProductSuppliersTable';
import { ProductPackagesTable } from '../ProductPackagesTable/ProductPackagesTable';
import { ProductImageModal } from '../ProductImageModal/ProductImageModal';

// Import types and utilities
import { ProductDetailView, ProductImage, STATUS_CONFIG } from '../../types';

// ===== COMPONENT PROPS TYPES =====
interface ProductProps {
  product: ProductDetailView | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ActionsProps {
  onGeneratePDF: () => void;
  onDownloadImages: () => void;
  onUpdateStatus: (productId: string, status: any) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

interface ImagesProps {
  images: ProductImage[];
  selectedImage: ProductImage | null;
  isImageModalOpen: boolean;
  onImageClick: (image: ProductImage) => void;
  onCloseImageModal: () => void;
}

interface ImportedProductDetailPresentationProps {
  productProps: ProductProps;
  actionsProps: ActionsProps;
  imagesProps: ImagesProps;
}

export const ImportedProductDetailPresentation = ({
  productProps,
  actionsProps,
  imagesProps
}: ImportedProductDetailPresentationProps) => {
  
  // ===== LOADING STATE =====
  if (productProps.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingState type="skeleton" message="Carregando detalhes do produto..." />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (productProps.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorState 
          type="inline"
          message={productProps.error}
          onRetry={productProps.refetch}
        />
      </div>
    );
  }

  // ===== NO PRODUCT STATE =====
  if (!productProps.product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600 mb-4">O produto solicitado não foi encontrado ou foi removido.</p>
          <Link href="/myarea/importacoes/produtos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { product } = productProps;
  const statusConfig = STATUS_CONFIG[product.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <ProductHeader
          product={product}
          onGeneratePDF={actionsProps.onGeneratePDF}
          onDownloadImages={actionsProps.onDownloadImages}
          isGeneratingPDF={false}
        />

        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${statusConfig.bgColor} border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <span className={`text-sm ${statusConfig.textColor}`}>
                Status atual do produto
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Atualizado em {new Date(product.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <ProductInfoCard product={product} title="Informações Básicas">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Código:</span>
                  <span className="font-medium">{product.internalCode}</span>
                </div>
                
                {product.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Categoria:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                )}
                
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Marca:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                )}
                
                {product.model && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Modelo:</span>
                    <span className="font-medium">{product.model}</span>
                  </div>
                )}
              </div>
              
              {product.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                </>
              )}
            </ProductInfoCard>

            {/* Technical Specifications */}
            {product.technicalSpecifications && (
              <ProductInfoCard product={product} title="Especificações Técnicas">
                <div className="whitespace-pre-wrap text-sm text-gray-600 leading-relaxed">
                  {product.technicalSpecifications}
                </div>
              </ProductInfoCard>
            )}

            {/* Customs Information */}
            {(product.hsCode || product.ncmCode || product.customsDescription) && (
              <ProductInfoCard product={product} title="Informações Aduaneiras">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.hsCode && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Código HS:</span>
                      <span className="font-medium">{product.hsCode}</span>
                    </div>
                  )}
                  
                  {product.ncmCode && (
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">NCM:</span>
                      <span className="font-medium">{product.ncmCode}</span>
                    </div>
                  )}
                  
                  {product.ipiPercentage && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">IPI:</span>
                      <span className="font-medium">{product.ipiPercentage}%</span>
                    </div>
                  )}
                </div>
                
                {product.customsDescription && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Descrição Aduaneira</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{product.customsDescription}</p>
                    </div>
                  </>
                )}
              </ProductInfoCard>
            )}

            {/* Suppliers Table */}
            {product.suppliers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Fornecedores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSuppliersTable 
                    suppliers={product.suppliers}
                    product={product}
                  />
                </CardContent>
              </Card>
            )}

            {/* Packages Table */}
            {product.packages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Embalagens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductPackagesTable packages={product.packages} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagens ({imagesProps.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductImagesGrid
                  images={imagesProps.images}
                  onImageClick={imagesProps.onImageClick}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={actionsProps.onGeneratePDF}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                
                {imagesProps.images.length > 0 && (
                  <Button 
                    onClick={actionsProps.onDownloadImages}
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Baixar Imagens
                  </Button>
                )}
                
                <Separator />
                
                <Link href={`/myarea/importacoes/produtos/${product.id}/edit`}>
                  <Button className="w-full justify-start" variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Editar Produto
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <div className="font-medium">Criado</div>
                    <div className="text-gray-600">
                      {new Date(product.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <div className="font-medium">Última Atualização</div>
                    <div className="text-gray-600">
                      {new Date(product.updatedAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ProductImageModal
        image={imagesProps.selectedImage}
        isOpen={imagesProps.isImageModalOpen}
        onClose={imagesProps.onCloseImageModal}
      />
    </div>
  );
};