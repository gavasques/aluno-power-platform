import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Package, 
  Star, 
  MapPin, 
  DollarSign, 
  Truck, 
  Award, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Info,
  Tags,
  Globe,
  Download
} from "lucide-react";
import { useApiRequest } from '@/hooks/useApiRequest';
import { useAuth } from '@/hooks/useAuth';
import { CreditCostButton } from '@/components/CreditCostButton';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { CountrySelector, COUNTRIES } from '@/components/common/CountrySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';

// Types
interface ProductData {
  status: string;
  data: {
    asin: string;
    country: string;
    product_title: string;
    product_photo: string;
    product_photos: string[];
    product_url: string;
    product_price: string;
    product_original_price: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_availability: string;
    product_num_offers: number;
    is_best_seller: boolean;
    is_amazon_choice: boolean;
    is_prime: boolean;
    climate_pledge_friendly: boolean;
    sales_volume: string;
    product_description: string;
    about_product: string[];
    product_information: Record<string, any>;
    product_photos_videos: Array<{
      url: string;
      type: string;
    }>;
  };
}

// Components
interface ExpandableSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableSection = ({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children 
}: ExpandableSectionProps) => (
  <Card className="border border-gray-200 bg-white shadow-sm">
    <CardHeader 
      className="cursor-pointer hover:bg-gray-50 transition-all duration-200 p-4 sm:p-6"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={isExpanded}
    >
      <CardTitle className="flex items-center justify-between text-sm sm:text-base">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <span className="font-medium sm:font-semibold text-gray-900 truncate">{title}</span>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-200" />
          )}
        </div>
      </CardTitle>
    </CardHeader>
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {isExpanded && (
        <CardContent className="pt-0 p-4 sm:p-6 border-t border-gray-100">
          {children}
        </CardContent>
      )}
    </div>
  </Card>
);

const FEATURE_CODE = 'tools.product_details';

export default function AmazonProductDetails() {
  const [asin, setAsin] = useState<string>('');
  const [country, setCountry] = useState<string>('BR');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    pricing: false,
    description: false,
    specifications: false,
    images: false,
    videos: false
  });

  const { execute, loading, error } = useApiRequest<ProductData>({
    successMessage: 'Produto encontrado com sucesso!',
  });
  const { balance: userBalance } = useUserCreditBalance();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();
  const { token } = useAuth();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateAsin = (value: string): boolean => {
    return /^[A-Z0-9]{10}$/i.test(value);
  };

  const searchProduct = async () => {
    if (!asin.trim() || !validateAsin(asin)) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    const data = await execute(
      () => fetch('/api/amazon-product-details', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ asin, country })
      })
    );

    if (data?.status === 'OK' && data.data) {
      setProductData(data);
      
      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'amazon',
        model: 'product-details',
        prompt: `Busca de produto ASIN: ${asin}`,
        response: `Produto encontrado: ${data.data.product_title}`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchProduct();
    }
  };

  const formatPrice = (price: string) => {
    return price?.replace(/^\$/, '') || 'N/A';
  };

  const downloadAllImages = async () => {
    if (!productData?.data.product_photos?.length) return;

    try {
      for (let i = 0; i < productData.data.product_photos.length; i++) {
        const imageUrl = productData.data.product_photos[i];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${productData.data.asin}_imagem_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
    }
  };

  const renderStarRating = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Detalhes do Produto Amazon
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Busque informações detalhadas de qualquer produto Amazon usando o ASIN
        </p>
      </div>

      {/* Formulário de Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produto
          </CardTitle>
          <CardDescription>
            Informe o ASIN (código de 10 caracteres) e o país do produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="asin">ASIN do Produto</Label>
              <Input
                id="asin"
                placeholder="Ex: B07ZPKBL9V"
                value={asin}
                onChange={(e) => setAsin(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={10}
                className="uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                ASIN é o código único de 10 caracteres do produto na Amazon
              </p>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="country">País</Label>
              <CountrySelector
                value={country}
                onValueChange={setCountry}
                placeholder="Selecione o país"
              />
            </div>
            
            <div className="flex items-end">
              <CreditCostButton
                featureName="tools.product_lookup"
                userBalance={userBalance}
                onProcess={searchProduct}
                disabled={loading || !validateAsin(asin)}
                className="w-full sm:w-auto"
              >
                {loading ? "Buscando..." : "Buscar"}
              </CreditCostButton>
            </div>
          </div>

          {loading && <LoadingSpinner message="Buscando produto..." />}

          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {productData && (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <ExpandableSection
            title="Informações Básicas"
            icon={Package}
            isExpanded={expandedSections.basicInfo}
            onToggle={() => toggleSection('basicInfo')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="order-2 md:order-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 break-words leading-tight">
                  {productData.data.product_title}
                </h3>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start sm:items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-sm">ASIN: </span>
                    <strong className="text-sm font-mono break-all">{productData.data.asin}</strong>
                  </div>
                  
                  <div className="flex items-start sm:items-center gap-2 flex-wrap">
                    <Globe className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-sm">País: </span>
                    <strong className="text-sm">{COUNTRIES.find(c => c.code === productData.data.country)?.name}</strong>
                  </div>
                  
                  {productData.data.product_star_rating && (
                    <div className="flex items-start sm:items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {renderStarRating(productData.data.product_star_rating)}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        ({productData.data.product_num_ratings?.toLocaleString()} avaliações)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {productData.data.is_best_seller && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Best Seller
                      </Badge>
                    )}
                    {productData.data.is_amazon_choice && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Amazon's Choice
                      </Badge>
                    )}
                    {productData.data.is_prime && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Prime
                      </Badge>
                    )}
                    {productData.data.climate_pledge_friendly && (
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Climate Pledge Friendly
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                {productData.data.product_photo && (
                  <img 
                    src={productData.data.product_photo} 
                    alt={productData.data.product_title}
                    className="max-w-full h-auto max-h-64 rounded-lg shadow-md"
                  />
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Disponibilidade:</strong> {productData.data.product_availability}
              </div>
              <div>
                <strong>Ofertas:</strong> {productData.data.product_num_offers} ofertas
              </div>
              {productData.data.sales_volume && (
                <div className="md:col-span-2">
                  <strong>Volume de vendas:</strong> {productData.data.sales_volume}
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href={productData.data.product_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver na Amazon
                </a>
              </Button>
            </div>
          </ExpandableSection>

          {/* Preços */}
          <ExpandableSection
            title="Informações de Preço"
            icon={DollarSign}
            isExpanded={expandedSections.pricing}
            onToggle={() => toggleSection('pricing')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-1">Preço Atual</h4>
                <p className="text-lg font-bold text-green-900">
                  {formatPrice(productData.data.product_price)}
                </p>
              </div>
              
              {productData.data.product_original_price && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Preço Original</h4>
                  <p className="text-lg font-bold text-gray-800 line-through">
                    {formatPrice(productData.data.product_original_price)}
                  </p>
                </div>
              )}
            </div>
          </ExpandableSection>

          {/* Imagens */}
          {productData.data.product_photos?.length > 0 && (
            <ExpandableSection
              title="Galeria de Imagens"
              icon={ImageIcon}
              isExpanded={expandedSections.images}
              onToggle={() => toggleSection('images')}
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {productData.data.product_photos.length} imagens disponíveis
                </p>
                <Button onClick={downloadAllImages} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Todas
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {productData.data.product_photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Produto ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => window.open(photo, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Descrição */}
          {(productData.data.product_description || productData.data.about_product?.length > 0) && (
            <ExpandableSection
              title="Descrição do Produto"
              icon={Info}
              isExpanded={expandedSections.description}
              onToggle={() => toggleSection('description')}
            >
              <div className="space-y-4">
                {productData.data.product_description && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição:</h4>
                    <p className="text-gray-700 leading-relaxed break-words">
                      {productData.data.product_description}
                    </p>
                  </div>
                )}
                
                {productData.data.about_product?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Características:</h4>
                    <ul className="space-y-2">
                      {productData.data.about_product.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="break-words">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ExpandableSection>
          )}

          {/* Especificações */}
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
      )}
    </div>
  );
}