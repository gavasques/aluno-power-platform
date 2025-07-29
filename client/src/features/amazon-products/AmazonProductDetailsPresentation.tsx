/**
 * PRESENTATION: AmazonProductDetailsPresentation
 * Interface de usuário para detalhes de produtos Amazon
 * Extraído de AmazonProductDetails.tsx (1229 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  DollarSign, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Tags, 
  BarChart, 
  Star, 
  Globe 
} from "lucide-react";

// Importar componentes modulares
import { SearchForm } from './components/SearchForm/SearchForm';
import { ExpandableSection } from './components/ExpandableSection/ExpandableSection';
import { ProductBasicInfo } from './components/ProductBasicInfo/ProductBasicInfo';
import { PricingInfo } from './components/PricingInfo/PricingInfo';
import { ExportActions } from './components/ExportActions/ExportActions';

// Importar tipos
import { 
  ProductData, 
  SearchFormProps, 
  ExportActionsProps, 
  UseExpandableSectionsReturn 
} from './types';

interface AmazonProductDetailsPresentationProps {
  searchProps: SearchFormProps;
  productData: ProductData | null;
  error: string | null;
  exportProps: ExportActionsProps;
  sectionsProps: UseExpandableSectionsReturn;
}

export const AmazonProductDetailsPresentation = ({
  searchProps,
  productData,
  error,
  exportProps,
  sectionsProps
}: AmazonProductDetailsPresentationProps) => {
  const { expandedSections, toggleSection } = sectionsProps;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Search Form */}
      <SearchForm {...searchProps} />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Product Results */}
      {productData && (
        <div className="mt-8 space-y-6">
          {/* Export Actions */}
          <ExportActions {...exportProps} />

          {/* Quick Actions */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={sectionsProps.expandAll}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={sectionsProps.collapseAll}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Recolher Todas
            </Button>
          </div>

          {/* Product Sections */}
          <div className="space-y-4">
            {/* Basic Information */}
            <ExpandableSection
              title="Informações Básicas"
              icon={Info}
              isExpanded={expandedSections.basicInfo}
              onToggle={() => toggleSection('basicInfo')}
            >
              <ProductBasicInfo productData={productData} />
            </ExpandableSection>

            {/* Pricing Information */}
            <ExpandableSection
              title="Informações de Preço"
              icon={DollarSign}
              isExpanded={expandedSections.pricing}
              onToggle={() => toggleSection('pricing')}
            >
              <PricingInfo productData={productData} />
            </ExpandableSection>

            {/* Product Description */}
            {productData.data.product_description && (
              <ExpandableSection
                title="Descrição do Produto"
                icon={FileText}
                isExpanded={expandedSections.description}
                onToggle={() => toggleSection('description')}
              >
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {productData.data.product_description}
                  </p>
                </div>
              </ExpandableSection>
            )}

            {/* About Product */}
            {productData.data.about_product && productData.data.about_product.length > 0 && (
              <ExpandableSection
                title="Sobre o Produto"
                icon={Info}
                isExpanded={expandedSections.description}
                onToggle={() => toggleSection('description')}
              >
                <ul className="space-y-2">
                  {productData.data.about_product.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </ExpandableSection>
            )}

            {/* Product Images */}
            {productData.data.product_photos && productData.data.product_photos.length > 0 && (
              <ExpandableSection
                title={`Imagens do Produto (${productData.data.product_photos.length})`}
                icon={ImageIcon}
                isExpanded={expandedSections.images}
                onToggle={() => toggleSection('images')}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productData.data.product_photos.map((photo, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={photo}
                        alt={`Produto ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg border border-gray-200 bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Rating Distribution */}
            {productData.data.rating_distribution && Object.keys(productData.data.rating_distribution).length > 0 && (
              <ExpandableSection
                title="Distribuição de Avaliações"
                icon={BarChart}
                isExpanded={expandedSections.ratings}
                onToggle={() => toggleSection('ratings')}
              >
                <div className="space-y-3">
                  {Object.entries(productData.data.rating_distribution)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([stars, count]) => (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 min-w-[80px]">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{stars}</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(productData.data.rating_distribution))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[50px] text-right">
                          {typeof count === 'number' ? count.toLocaleString() : count}
                        </span>
                      </div>
                    ))}
                </div>
              </ExpandableSection>
            )}

            {/* Product Category */}
            {productData.data.category && (
              <ExpandableSection
                title="Categoria"
                icon={Globe}
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection('category')}
              >
                <div className="space-y-4">
                  {productData.data.category.name && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Categoria Principal:</h4>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {productData.data.category.name}
                      </span>
                    </div>
                  )}

                  {productData.data.category_path && productData.data.category_path.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Caminho da Categoria:</h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {productData.data.category_path.map((cat, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {index > 0 && <span className="text-gray-400">/</span>}
                            <a
                              href={cat.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              {cat.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            )}

            {/* Technical Specifications */}
            {productData.data.product_information && Object.keys(productData.data.product_information).length > 0 && (
              <ExpandableSection
                title="Especificações Técnicas"
                icon={Tags}
                isExpanded={expandedSections.specifications}
                onToggle={() => toggleSection('specifications')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(productData.data.product_information).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-2">
                      <div className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-900 break-words">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
};