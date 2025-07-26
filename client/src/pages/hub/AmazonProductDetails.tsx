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
  Download,
  FileText,
  TrendingUp, 
  Palette, 
  BarChart
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
    has_aplus: boolean;
    has_brandstory: boolean;
    sales_volume: string;
    product_description: string;
    about_product: string[];
    product_information: Record<string, any>;
    product_photos_videos: Array<{
      url: string;
      type: string;
    }>;
    product_byline: string;
    product_byline_link: string;
    delivery: string;
    primary_delivery_time: string;
    category: {
      name: string;
    };
    category_path: Array<{
      name: string;
      link: string;
    }>;
    product_variations: Record<string, any>;
    rating_distribution: Record<string, number>;
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
    videos: false,
    ranking: false,
    variations: false,
    ratings: false,
    category: false
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

      // Créditos já são descontados automaticamente no backend via CreditService
      // Apenas precisamos registrar que o produto foi encontrado para o usuário
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

  const exportToTVT = () => {
    if (!productData) return;

    const { data } = productData;

    // Gerar conteúdo do arquivo TVT
    let tvtContent = '';

    // Título e ASIN
    tvtContent += `TÍTULO: ${data.product_title}\n`;
    tvtContent += `ASIN: ${data.asin}\n`;
    tvtContent += `PAÍS: ${COUNTRIES.find(c => c.code === data.country)?.name || data.country}\n`;
    tvtContent += `URL DO PRODUTO: ${data.product_url}\n\n`;

    // Informações básicas
    tvtContent += `=== INFORMAÇÕES BÁSICAS ===\n`;
    tvtContent += `Preço: ${data.product_price}\n`;
    if (data.product_original_price && data.product_original_price !== data.product_price) {
      tvtContent += `Preço Original: ${data.product_original_price}\n`;
    }
    tvtContent += `Avaliação: ${data.product_star_rating} (${data.product_num_ratings} avaliações)\n`;
    tvtContent += `Disponibilidade: ${data.product_availability}\n`;
    tvtContent += `Número de ofertas: ${data.product_num_offers}\n`;

    // Badges
    const badges = [];
    if (data.is_best_seller) badges.push('Best Seller');
    if (data.is_amazon_choice) badges.push('Amazon Choice');
    if (data.is_prime) badges.push('Prime');
    if (data.climate_pledge_friendly) badges.push('Climate Pledge Friendly');
    if (data.has_aplus) badges.push('A+ Content');
    if (data.has_brandstory) badges.push('Brand Story');
    if (badges.length > 0) {
      tvtContent += `Badges: ${badges.join(', ')}\n`;
    }

    if (data.sales_volume) {
      tvtContent += `Volume de vendas: ${data.sales_volume}\n`;
    }
    tvtContent += '\n';

    // Descrição
    if (data.product_description) {
      tvtContent += `=== DESCRIÇÃO ===\n`;
      tvtContent += `${data.product_description}\n\n`;
    }

    // Características do produto
    if (data.about_product && data.about_product.length > 0) {
      tvtContent += `=== CARACTERÍSTICAS ===\n`;
      data.about_product.forEach((item, index) => {
        tvtContent += `${index + 1}. ${item}\n`;
      });
      tvtContent += '\n';
    }

    // Informações técnicas
    if (data.product_information && Object.keys(data.product_information).length > 0) {
      tvtContent += `=== ESPECIFICAÇÕES TÉCNICAS ===\n`;
      Object.entries(data.product_information).forEach(([key, value]) => {
        if (value && value !== 'N/A' && value !== '') {
          tvtContent += `${key}: ${value}\n`;
        }
      });
      tvtContent += '\n';
    }

    // URLs das imagens
    tvtContent += `=== IMAGENS ===\n`;
    if (data.product_photo) {
      tvtContent += `Imagem principal: ${data.product_photo}\n`;
    }

    if (data.product_photos && data.product_photos.length > 0) {
      tvtContent += `Imagens adicionais:\n`;
      data.product_photos.forEach((photo, index) => {
        tvtContent += `${index + 1}. ${photo}\n`;
      });
    }

    if (data.product_photos_videos && data.product_photos_videos.length > 0) {
      const images = data.product_photos_videos.filter(item => item.type === 'image');
      const videos = data.product_photos_videos.filter(item => item.type === 'video');

      if (images.length > 0) {
        tvtContent += `Galeria de imagens:\n`;
        images.forEach((item, index) => {
          tvtContent += `${index + 1}. ${item.url}\n`;
        });
      }

      if (videos.length > 0) {
        tvtContent += `\n=== VÍDEOS ===\n`;
        videos.forEach((item, index) => {
          tvtContent += `${index + 1}. ${item.url}\n`;
        });
      }
    }

    // Categoria e Hierarquia
    if (data.category || (data.category_path && data.category_path.length > 0)) {
      tvtContent += `\n=== CATEGORIA ===\n`;
      if (data.category) {
        tvtContent += `Categoria Principal: ${data.category.name}\n`;
      }
      if (data.category_path && data.category_path.length > 0) {
        tvtContent += `Caminho da Categoria: ${data.category_path.map(cat => cat.name).join(' > ')}\n`;
        tvtContent += `Links das Categorias:\n`;
        data.category_path.forEach((cat, index) => {
          tvtContent += `${index + 1}. ${cat.name}: ${cat.link}\n`;
        });
      }
      tvtContent += '\n';
    }

    // Variações do Produto
    if (data.product_variations && Object.keys(data.product_variations).length > 0) {
      tvtContent += `=== VARIAÇÕES DO PRODUTO ===\n`;
      Object.entries(data.product_variations).forEach(([variationType, variations]) => {
        tvtContent += `${variationType.replace(/_/g, ' ').toUpperCase()}:\n`;
        if (Array.isArray(variations)) {
          variations.forEach((variation, index) => {
            tvtContent += `${index + 1}. ${variation}\n`;
          });
        } else if (typeof variations === 'object' && variations !== null) {
          Object.entries(variations).forEach(([key, value]) => {
            tvtContent += `- ${key}: ${value}\n`;
          });
        } else {
          tvtContent += `- ${variations}\n`;
        }
        tvtContent += '\n';
      });
    }

    // Distribuição de Avaliações
    if (data.rating_distribution && Object.keys(data.rating_distribution).length > 0) {
      tvtContent += `=== DISTRIBUIÇÃO DE AVALIAÇÕES ===\n`;
      const total = Object.values(data.rating_distribution).reduce((sum, val) => sum + val, 0);
      Object.entries(data.rating_distribution)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .forEach(([rating, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          tvtContent += `${rating} estrelas: ${count.toLocaleString()} avaliações (${percentage}%)\n`;
        });
      tvtContent += '\n';
    }

    // Criar e baixar arquivo
    const blob = new Blob([tvtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Amazon_${data.asin}_${data.country}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Arquivo TXT exportado!",
      description: `Dados do produto ${data.asin} salvos em arquivo TXT.`,
    });
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
          {/* Barra de Ações de Exportação */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Exportar Dados do Produto</h3>
                  <p className="text-sm text-blue-700">
                    Exporte todas as informações do produto em diferentes formatos
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={exportToTVT}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar TXT
                  </Button>
                  <Button 
                    onClick={downloadAllImages}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Imagens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    {productData.data.has_aplus && (
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                        <Star className="h-3 w-3 mr-1" />
                        A+ Content
                      </Badge>
                    )}
                    {productData.data.has_brandstory && (
                      <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                        <Award className="h-3 w-3 mr-1" />
                        Brand Story
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

          {/* Vídeos */}
          {(productData.data.product_videos?.length > 0 || productData.data.user_uploaded_videos?.length > 0) && (
            <ExpandableSection
              title="Vídeos do Produto"
              icon={Video}
              isExpanded={expandedSections.videos}
              onToggle={() => toggleSection('videos')}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {(productData.data.product_videos?.length || 0) + (productData.data.user_uploaded_videos?.length || 0)} vídeo(s) disponível(is)
                  </p>
                  <Button 
                    onClick={() => {
                      const allVideos = [
                        ...(productData.data.product_videos || []),
                        ...(productData.data.user_uploaded_videos || [])
                      ];
                      allVideos.forEach((video, index) => {
                        setTimeout(() => {
                          window.open(video.video_url, '_blank');
                        }, index * 200);
                      });
                    }} 
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Todos
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vídeos oficiais do produto */}
                  {productData.data.product_videos?.map((video, index) => (
                    <div key={`official-${index}`} className="space-y-2">
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
                        <div className="relative">
                          <img
                            src={video.thumbnail_url}
                            alt={video.title || `Vídeo ${index + 1}`}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => window.open(video.video_url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <div className="bg-red-600 rounded-full p-3 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = video.video_url;
                              link.download = `video_${productData.data.asin}_${index + 1}.mp4`;
                              link.click();
                            }}
                            title="Baixar vídeo"
                            className="bg-white/90 hover:bg-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(video.video_url, '_blank');
                            }}
                            title="Abrir em nova aba"
                            className="bg-white/90 hover:bg-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p className="font-medium text-sm">{video.title || `Vídeo ${index + 1}`}</p>
                        <p>ID: {video.id}</p>
                        {video.video_width && video.video_height && (
                          <p>Resolução: {video.video_width}x{video.video_height}</p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          Vídeo Oficial
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Vídeos enviados por usuários */}
                  {productData.data.user_uploaded_videos?.map((video, index) => (
                    <div key={`user-${index}`} className="space-y-2">
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
                        <div className="relative">
                          <img
                            src={video.thumbnail_url || '/placeholder.svg'}
                            alt={video.title || `Vídeo do usuário ${index + 1}`}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => window.open(video.video_url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <div className="bg-blue-600 rounded-full p-3 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = video.video_url;
                              link.download = `user_video_${productData.data.asin}_${index + 1}.mp4`;
                              link.click();
                            }}
                            title="Baixar vídeo"
                            className="bg-white/90 hover:bg-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(video.video_url, '_blank');
                            }}
                            title="Abrir em nova aba"
                            className="bg-white/90 hover:bg-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p className="font-medium text-sm">{video.title || `Vídeo do usuário ${index + 1}`}</p>
                        {video.id && <p>ID: {video.id}</p>}
                        {video.video_width && video.video_height && (
                          <p>Resolução: {video.video_width}x{video.video_height}</p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1 border-blue-300 text-blue-700">
                          Vídeo do Usuário
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandableSection>
          )}

          {/* Variações do Produto */}
          {productData.data.product_variations && Object.keys(productData.data.product_variations).length > 0 && (
            <ExpandableSection
              title="Variações do Produto"
              icon={Palette}
              isExpanded={expandedSections.variations}
              onToggle={() => toggleSection('variations')}
            >
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <Info className="h-4 w-4 inline mr-2" />
                    Este produto possui {Object.keys(productData.data.product_variations).length} tipo(s) de variação disponível(is)
                  </p>
                </div>

                {Object.entries(productData.data.product_variations).map(([variationType, variations]) => (
                  <div key={variationType} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg capitalize flex items-center gap-2">
                        <Tags className="h-5 w-5 text-blue-600" />
                        {variationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {Array.isArray(variations) ? variations.length : 
                         typeof variations === 'object' && variations !== null ? Object.keys(variations).length : 1} opção(ões)
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {Array.isArray(variations) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {variations.map((variation, index) => (
                            <div key={index} className="relative group">
                              <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white">
                                {/* Thumbnail da variação */}
                                {variation.photo && (
                                  <div className="mb-2">
                                    <img
                                      src={variation.photo}
                                      alt={variation.value || `Variação ${index + 1}`}
                                      className="w-full h-24 object-cover rounded border"
                                      onClick={() => window.open(variation.photo, '_blank')}
                                    />
                                  </div>
                                )}
                                
                                {/* Nome da variação */}
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    {variation.value || `Opção ${index + 1}`}
                                  </p>
                                  
                                  {/* ASIN e disponibilidade */}
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-500 font-mono">
                                      ASIN: {variation.asin}
                                    </p>
                                    <Badge 
                                      variant={variation.is_available ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {variation.is_available ? "Disponível" : "Indisponível"}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Botão para ver produto */}
                                {variation.asin && (
                                  <div className="mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                      onClick={() => window.open(`https://www.amazon.com.br/dp/${variation.asin}`, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Ver Produto
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : typeof variations === 'object' && variations !== null ? (
                        <div className="space-y-2">
                          {Object.entries(variations).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <Badge variant="outline" className="text-sm">
                                {String(value)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-sm">
                          {String(variations)}
                        </Badge>
                      )}
                    </div>

                    {/* Informações adicionais sobre a variação */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Tipo de variação: <span className="font-medium">{variationType}</span>
                        {Array.isArray(variations) && variations.length > 5 && (
                          <span className="ml-2 text-blue-600">• Múltiplas opções disponíveis</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Todas as variações do produto */}
                {productData.data.all_product_variations && Object.keys(productData.data.all_product_variations).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-900 mb-2">Mapeamento Completo de Variações</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {Object.entries(productData.data.all_product_variations).map(([asin, attributes]) => (
                        <div key={asin} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-gray-600 font-mono text-xs">{asin}:</span>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(attributes).map(([attr, value]) => (
                              <Badge key={attr} variant="outline" className="text-xs">
                                {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumo das variações */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">Resumo das Variações</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(productData.data.product_variations).map(([type, vars]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-blue-700 capitalize">{type.replace(/_/g, ' ')}:</span>
                        <span className="font-medium text-blue-900">
                          {Array.isArray(vars) ? `${vars.length} opções` : 
                           typeof vars === 'object' && vars !== null ? `${Object.keys(vars).length} atributos` : '1 opção'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ExpandableSection>
          )}

          {/* Avaliações e Distribuição */}
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
                  .map(([rating, count]) => {
                    const total = Object.values(productData.data.rating_distribution).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 min-w-[60px]">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 min-w-[80px] text-right">
                          {count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ExpandableSection>
          )}

          {/* Categoria e Hierarquia */}
          {(productData.data.category || productData.data.category_path?.length > 0) && (
            <ExpandableSection
              title="Categoria e Hierarquia"
              icon={TrendingUp}
              isExpanded={expandedSections.category}
              onToggle={() => toggleSection('category')}
            >
              <div className="space-y-4">
                {productData.data.category && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Categoria Principal:</h4>
                    <Badge variant="outline" className="text-sm">
                      {productData.data.category.name}
                    </Badge>
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