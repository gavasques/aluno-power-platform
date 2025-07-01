import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

// Países com suas bandeiras (emoji)
const COUNTRIES = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'AE', name: 'Emirados Árabes', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' }
];

interface ProductData {
  status: string;
  request_id: string;
  parameters: {
    asin: string;
    country: string;
  };
  data: {
    asin: string;
    product_title: string;
    product_price: string;
    product_original_price?: string;
    product_price_max?: string;
    currency: string;
    country: string;
    product_byline: string;
    product_byline_link: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_url: string;
    product_photo: string;
    product_num_offers: number;
    product_availability: string;
    is_best_seller: boolean;
    is_amazon_choice: boolean;
    is_prime: boolean;
    climate_pledge_friendly: boolean;
    sales_volume?: string;
    about_product: string[];
    product_description: string;
    product_information: Record<string, string>;
    product_photos: string[];
    product_videos: any[];
    user_uploaded_videos: any[];
  };
}

const AmazonProductDetails: React.FC = () => {
  const { toast } = useToast();
  const [asin, setAsin] = useState<string>('');
  const [country, setCountry] = useState<string>('BR');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    pricing: false,
    description: false,
    specifications: false,
    images: false,
    videos: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateAsin = (value: string): boolean => {
    // ASIN deve ter 10 caracteres alfanuméricos
    return /^[A-Z0-9]{10}$/i.test(value);
  };

  const searchProduct = async () => {
    if (!asin.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite um ASIN para buscar.",
        variant: "destructive"
      });
      return;
    }

    if (!validateAsin(asin)) {
      toast({
        title: "ASIN inválido",
        description: "O ASIN deve ter 10 caracteres alfanuméricos (ex: B07ZPKBL9V).",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProductData(null);

    try {
      const response = await fetch('/api/amazon-product-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin, country })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar produto');
      }

      if (data.status === 'OK' && data.data) {
        setProductData(data);
        toast({
          title: "Produto encontrado!",
          description: `Dados carregados para ${data.data.product_title}`
        });
      } else {
        throw new Error('Produto não encontrado');
      }

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    if (!productData?.data.product_photos?.length) {
      toast({
        title: "Nenhuma imagem disponível",
        description: "Este produto não possui imagens para download.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Iniciando download...",
        description: `Preparando ${productData.data.product_photos.length} imagens para download.`
      });

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
        
        // Pequeno delay entre downloads para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: "Download concluído!",
        description: `${productData.data.product_photos.length} imagens baixadas com sucesso.`
      });

    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar as imagens. Tente novamente.",
        variant: "destructive"
      });
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

  const ExpandableSection = ({ 
    title, 
    icon: Icon, 
    isExpanded, 
    onToggle, 
    children 
  }: {
    title: string;
    icon: React.ComponentType<any>;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 transition-all duration-200 p-4 sm:p-6"
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Detalhes do Produto Amazon
        </h1>
        <p className="text-gray-600">
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
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={searchProduct} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>
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
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 break-all">
                  {formatPrice(productData.data.product_price)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Preço Atual</div>
                {productData.data.currency && (
                  <div className="text-xs text-gray-500 mt-0.5">{productData.data.currency}</div>
                )}
              </div>
              
              {productData.data.product_original_price && (
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg sm:text-xl font-semibold text-gray-600 line-through break-all">
                    {formatPrice(productData.data.product_original_price)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Preço Original</div>
                </div>
              )}
              
              {productData.data.product_price_max && (
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-lg sm:text-xl font-semibold text-green-600 break-all">
                    {formatPrice(productData.data.product_price_max)}
                  </div>
                  <div className="text-sm text-gray-600">Preço Máximo</div>
                </div>
              )}
            </div>
          </ExpandableSection>

          {/* Descrição e Características */}
          <ExpandableSection
            title="Descrição e Características"
            icon={Info}
            isExpanded={expandedSections.description}
            onToggle={() => toggleSection('description')}
          >
            <div className="space-y-4">
              {productData.data.product_description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {productData.data.product_description}
                  </p>
                </div>
              )}
              
              {productData.data.about_product?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Sobre este produto</h4>
                  <ul className="space-y-2">
                    {productData.data.about_product.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ExpandableSection>

          {/* Especificações Técnicas */}
          {productData.data.product_information && Object.keys(productData.data.product_information).length > 0 && (
            <ExpandableSection
              title="Especificações Técnicas"
              icon={Tags}
              isExpanded={expandedSections.specifications}
              onToggle={() => toggleSection('specifications')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(productData.data.product_information).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <div className="text-sm font-medium text-gray-600">{key}</div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Imagens */}
          {productData.data.product_photos?.length > 0 && (
            <ExpandableSection
              title={`Imagens do Produto (${productData.data.product_photos.length})`}
              icon={ImageIcon}
              isExpanded={expandedSections.images}
              onToggle={() => toggleSection('images')}
            >
              <div className="mb-4">
                <Button 
                  onClick={downloadAllImages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar todas as imagens ({productData.data.product_photos.length})
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {productData.data.product_photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`${productData.data.product_title} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Vídeos */}
          {(productData.data.product_videos?.length > 0 || productData.data.user_uploaded_videos?.length > 0) && (
            <ExpandableSection
              title={`Vídeos do Produto (${(productData.data.product_videos?.length || 0) + (productData.data.user_uploaded_videos?.length || 0)})`}
              icon={Video}
              isExpanded={expandedSections.videos}
              onToggle={() => toggleSection('videos')}
            >
              {/* Vídeos Oficiais */}
              {productData.data.product_videos?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Vídeos Oficiais</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productData.data.product_videos.map((video: any, index: number) => (
                      <div key={`official-${index}`} className="bg-gray-50 p-4 rounded-lg">
                        <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center">
                          {video.video_url ? (
                            <video 
                              controls 
                              poster={video.video_thumbnail || ''}
                              className="w-full h-full rounded"
                            >
                              <source src={video.video_url} type="video/mp4" />
                              Seu navegador não suporta vídeos.
                            </video>
                          ) : video.video_thumbnail ? (
                            <img 
                              src={video.video_thumbnail} 
                              alt={video.video_title || 'Vídeo do produto'}
                              className="w-full h-full object-cover rounded cursor-pointer"
                              onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                            />
                          ) : (
                            <Video className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        {video.video_title && (
                          <h5 className="font-medium text-sm mb-1">{video.video_title}</h5>
                        )}
                        {video.video_duration && (
                          <p className="text-xs text-gray-600">Duração: {video.video_duration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vídeos de Usuários */}
              {productData.data.user_uploaded_videos?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Vídeos de Usuários</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productData.data.user_uploaded_videos.slice(0, 6).map((video: any, index: number) => (
                      <div key={`user-${index}`} className="bg-gray-50 p-4 rounded-lg">
                        <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center">
                          {video.video_url ? (
                            <video 
                              controls 
                              poster={video.video_image_url || ''}
                              className="w-full h-full rounded"
                            >
                              <source src={video.video_url} type="video/mp4" />
                              Seu navegador não suporta vídeos.
                            </video>
                          ) : video.video_image_url ? (
                            <img 
                              src={video.video_image_url} 
                              alt={video.title || 'Vídeo de usuário'}
                              className="w-full h-full object-cover rounded cursor-pointer"
                              onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                            />
                          ) : (
                            <Video className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        {video.title && (
                          <h5 className="font-medium text-sm mb-1">{video.title}</h5>
                        )}
                        {video.public_name && (
                          <p className="text-xs text-gray-600">por {video.public_name}</p>
                        )}
                        {video.date && (
                          <p className="text-xs text-gray-500">{video.date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {productData.data.user_uploaded_videos.length > 6 && (
                    <p className="text-sm text-gray-600 mt-3">
                      Mostrando 6 de {productData.data.user_uploaded_videos.length} vídeos de usuários
                    </p>
                  )}
                </div>
              )}

              {/* Caso não haja vídeos */}
              {(!productData.data.product_videos?.length && !productData.data.user_uploaded_videos?.length) && (
                <div className="text-center py-8 text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum vídeo disponível para este produto</p>
                </div>
              )}
            </ExpandableSection>
          )}
        </div>
      )}
    </div>
  );
};

export default AmazonProductDetails;