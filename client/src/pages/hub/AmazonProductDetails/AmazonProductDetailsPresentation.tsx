import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Package, 
  DollarSign, 
  Star, 
  Image as ImageIcon, 
  Info, 
  Tags, 
  Globe, 
  BarChart 
} from 'lucide-react';

// Import specialized components
import { SearchForm } from './components/SearchForm';
import { ExpandableSection } from './components/ExpandableSection';
import { ProductBasicInfo } from './components/ProductBasicInfo';
import { PricingInfo } from './components/PricingInfo';
import { ExportActions } from './components/ExportActions';

import type { AmazonProductDetailsPresentationProps } from './types';

/**
 * AMAZON PRODUCT DETAILS PRESENTATION - FASE 4 REFATORAÇÃO
 * 
 * Presentation Component seguindo padrão Container/Presentational
 * Responsabilidade única: Renderizar UI pura sem lógica de negócio
 * 
 * Antes: UI misturada com lógica no componente de 1.229 linhas
 * Depois: Apresentação pura focada apenas em renderização
 */
export function AmazonProductDetailsPresentation({
  searchHook,
  exportHook,
  sectionsHook,
  productData,
  isLoading,
  error
}: AmazonProductDetailsPresentationProps) {

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <SearchForm searchHook={searchHook} />
          
          <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Erro na busca</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <SearchForm searchHook={searchHook} />
          
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Buscando dados do produto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Form */}
        <SearchForm searchHook={searchHook} />

        {/* Product Data Display */}
        {productData && (
          <>
            {/* Export Actions */}
            <ExportActions 
              productData={productData.data} 
              exportHook={exportHook} 
            />

            {/* Basic Product Information */}
            <ExpandableSection
              title="Informações Básicas"
              icon={Package}
              isExpanded={sectionsHook.isExpanded('basic-info')}
              onToggle={() => sectionsHook.toggleSection('basic-info')}
            >
              <ProductBasicInfo productData={productData.data} />
            </ExpandableSection>

            {/* Pricing Information */}
            <ExpandableSection
              title="Preço e Ofertas"
              icon={DollarSign}
              isExpanded={sectionsHook.isExpanded('pricing')}
              onToggle={() => sectionsHook.toggleSection('pricing')}
            >
              <PricingInfo productData={productData.data} />
            </ExpandableSection>

            {/* Ratings and Reviews */}
            <ExpandableSection
              title="Avaliações e Classificações"
              icon={Star}
              isExpanded={sectionsHook.isExpanded('ratings')}
              onToggle={() => sectionsHook.toggleSection('ratings')}
            >
              <RatingDistribution productData={productData.data} />
            </ExpandableSection>

            {/* Photo Gallery */}
            <ExpandableSection
              title="Galeria de Fotos e Vídeos"
              icon={ImageIcon}
              isExpanded={sectionsHook.isExpanded('photos')}
              onToggle={() => sectionsHook.toggleSection('photos')}
            >
              <PhotoGallery productData={productData.data} />
            </ExpandableSection>

            {/* Technical Specifications */}
            <ExpandableSection
              title="Especificações Técnicas"
              icon={Info}
              isExpanded={sectionsHook.isExpanded('specifications')}
              onToggle={() => sectionsHook.toggleSection('specifications')}
            >
              <TechnicalSpecifications productData={productData.data} />
            </ExpandableSection>

            {/* Product Variations */}
            {productData.data.product_variations && Object.keys(productData.data.product_variations).length > 0 && (
              <ExpandableSection
                title="Variações do Produto"
                icon={Tags}
                isExpanded={sectionsHook.isExpanded('variations')}
                onToggle={() => sectionsHook.toggleSection('variations')}
              >
                <ProductVariations productData={productData.data} />
              </ExpandableSection>
            )}

            {/* Product Description */}
            {(productData.data.product_description || productData.data.about_product?.length > 0) && (
              <ExpandableSection
                title="Descrição do Produto"
                icon={Globe}
                isExpanded={sectionsHook.isExpanded('description')}
                onToggle={() => sectionsHook.toggleSection('description')}
              >
                <ProductDescription productData={productData.data} />
              </ExpandableSection>
            )}

            {/* Category Information */}
            <ExpandableSection
              title="Categoria e Classificação"
              icon={BarChart}
              isExpanded={sectionsHook.isExpanded('category')}
              onToggle={() => sectionsHook.toggleSection('category')}
            >
              <CategoryInformation productData={productData.data} />
            </ExpandableSection>
          </>
        )}

        {/* No Results State */}
        {!productData && !isLoading && !error && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum produto carregado
            </h3>
            <p className="text-gray-500">
              Digite um ASIN válido e clique em "Buscar Produto" para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Additional components that would be created separately
function RatingDistribution({ productData }: { productData: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Classificação Geral</h4>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <span className="text-2xl font-bold">{productData.product_star_rating || 'N/A'}</span>
            <span className="text-gray-600">de 5 estrelas</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {productData.product_num_ratings?.toLocaleString() || '0'} avaliações
          </p>
        </div>
        
        {productData.rating_distribution && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Distribuição</h4>
            <div className="space-y-1">
              {Object.entries(productData.rating_distribution).map(([stars, count]) => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(count as number / productData.product_num_ratings) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoGallery({ productData }: { productData: any }) {
  const photos = productData.product_photos || [];
  const videos = productData.product_photos_videos?.filter((item: any) => item.type === 'video') || [];

  return (
    <div className="space-y-6">
      {photos.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Fotos do Produto ({photos.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo: string, index: number) => (
              <div key={index} className="aspect-square">
                <img
                  src={photo}
                  alt={`${productData.product_title} - Foto ${index + 1}`}
                  className="w-full h-full object-contain rounded-lg border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(photo, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Vídeos ({videos.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">▶</span>
                  </div>
                  <span className="font-medium">Vídeo {index + 1}</span>
                </div>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Abrir vídeo
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TechnicalSpecifications({ productData }: { productData: any }) {
  const specs = productData.product_information || {};
  
  return (
    <div className="space-y-4">
      {Object.keys(specs).length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-medium text-gray-700 sm:w-1/3">{key}</span>
              <span className="text-gray-900 sm:w-2/3">{String(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Nenhuma especificação técnica disponível
        </p>
      )}
    </div>
  );
}

function ProductVariations({ productData }: { productData: any }) {
  const variations = productData.product_variations || {};
  
  return (
    <div className="space-y-4">
      {Object.keys(variations).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(variations).map(([type, options]) => (
            <div key={type}>
              <h4 className="font-medium text-gray-900 mb-2 capitalize">{type}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.isArray(options) ? options.map((option: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 text-sm">
                    {typeof option === 'object' ? JSON.stringify(option) : String(option)}
                  </div>
                )) : (
                  <div className="border rounded-lg p-3 text-sm">
                    {String(options)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Nenhuma variação disponível
        </p>
      )}
    </div>
  );
}

function ProductDescription({ productData }: { productData: any }) {
  return (
    <div className="space-y-4">
      {productData.product_description && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
          <div className="prose prose-sm max-w-none text-gray-700">
            {productData.product_description}
          </div>
        </div>
      )}

      {productData.about_product && productData.about_product.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Sobre o Produto</h4>
          <ul className="space-y-2">
            {productData.about_product.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CategoryInformation({ productData }: { productData: any }) {
  return (
    <div className="space-y-4">
      {productData.category && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Categoria Principal</h4>
          <p className="text-gray-700">{productData.category.name}</p>
        </div>
      )}

      {productData.category_path && productData.category_path.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Caminho da Categoria</h4>
          <div className="flex flex-wrap items-center gap-2">
            {productData.category_path.map((cat: any, index: number) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">→</span>}
                <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                  {cat.name}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}