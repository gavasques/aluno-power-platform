import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, AlertCircle, Globe, Star, Package, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Product {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price?: string;
  currency: string;
  product_star_rating?: string;
  product_num_ratings: number;
  product_url: string;
  product_photo: string;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  is_prime: boolean;
  sales_volume?: string;
  delivery?: string;
  product_badge?: string;
  product_byline?: string;
}

interface SearchState {
  isSearching: boolean;
  currentPage: number;
  totalPages: number;
  progress: number;
  products: Product[];
  totalProducts: number;
  searchParams: any;
  errors: string[];
}

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'AE', name: 'Emirados Árabes', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' }
];

const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevância' },
  { value: 'LOWEST_PRICE', label: 'Menor Preço' },
  { value: 'HIGHEST_PRICE', label: 'Maior Preço' },
  { value: 'REVIEWS', label: 'Avaliações' },
  { value: 'NEWEST', label: 'Novos' },
  { value: 'BEST_SELLERS', label: 'Mais Vendidos' }
];

const DEALS_OPTIONS = [
  { value: 'NONE', label: 'Nenhum' },
  { value: 'ALL_DISCOUNTS', label: 'Todos Descontos' },
  { value: 'TODAYS_DEALS', label: 'Ofertas do Dia' }
];

export default function KeywordSearchReport() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    query: '',
    country: 'BR',
    sort_by: 'RELEVANCE',
    min_price: '',
    max_price: '',
    brand: '',
    is_prime: false,
    seller_id: '',
    deals_and_discounts: 'NONE'
  });

  const [state, setState] = useState<SearchState>({
    isSearching: false,
    currentPage: 0,
    totalPages: 7,
    progress: 0,
    products: [],
    totalProducts: 0,
    searchParams: null,
    errors: []
  });

  const updateSearchParam = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const searchProducts = async (page: number): Promise<Product[]> => {
    const response = await fetch('/api/amazon-keywords/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...searchParams,
        page,
        min_price: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
        max_price: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro desconhecido');
    }

    return data.data.products || [];
  };

  const startSearch = async () => {
    if (!searchParams.query.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite uma palavra-chave para buscar.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      currentPage: 0,
      progress: 0,
      products: [],
      errors: [],
      searchParams: { ...searchParams }
    }));

    // Log da busca (uma vez apenas)
    try {
      await fetch('/api/amazon-keywords/log-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchParams.query,
          country: searchParams.country,
          filters: {
            sort_by: searchParams.sort_by,
            brand: searchParams.brand,
            min_price: searchParams.min_price,
            max_price: searchParams.max_price,
            is_prime: searchParams.is_prime,
            seller_id: searchParams.seller_id,
            deals_and_discounts: searchParams.deals_and_discounts,
          }
        })
      });
    } catch (logError) {
      console.warn('Erro ao salvar log da busca:', logError);
    }

    try {
      let allProducts: Product[] = [];
      const totalPages = 7;

      for (let page = 1; page <= totalPages; page++) {
        setState(prev => ({
          ...prev,
          currentPage: page,
          progress: (page / totalPages) * 100
        }));

        try {
          const products = await searchProducts(page);
          allProducts = [...allProducts, ...products];
          
          // Atualizar estado em tempo real
          setState(prev => ({
            ...prev,
            products: allProducts,
            totalProducts: allProducts.length
          }));
          
          // Delay entre requests para evitar rate limiting
          if (page < totalPages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          const errorMsg = `Erro na página ${page}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          setState(prev => ({
            ...prev,
            errors: [...prev.errors, errorMsg]
          }));
        }
      }

      setState(prev => ({
        ...prev,
        isSearching: false,
        products: allProducts,
        totalProducts: allProducts.length,
        progress: 100
      }));

      toast({
        title: "Busca concluída",
        description: `${allProducts.length} produtos encontrados em ${totalPages} páginas.`
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        errors: [...prev.errors, `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }));
      
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro durante a busca. Verifique os logs abaixo.",
        variant: "destructive"
      });
    }
  };

  const stopSearch = () => {
    setState(prev => ({
      ...prev,
      isSearching: false
    }));
    
    toast({
      title: "Busca interrompida",
      description: "A busca foi cancelada pelo usuário."
    });
  };

  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return 'N/A';
    return price.replace(/[^\d.,]/g, '');
  };

  const formatRating = (rating: string | null | undefined): string => {
    if (!rating) return 'N/A';
    return `${rating} ⭐`;
  };

  const downloadXLSX = () => {
    if (state.products.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há produtos para exportar.",
        variant: "destructive"
      });
      return;
    }

    const workbookData = state.products.map((product, index) => ({
      'Nº': index + 1,
      'ASIN': product.asin,
      'Título do Produto': product.product_title,
      'Preço': formatPrice(product.product_price),
      'Preço Original': formatPrice(product.product_original_price),
      'Moeda': product.currency || 'N/A',
      'Avaliação': product.product_star_rating || 'N/A',
      'Número de Avaliações': product.product_num_ratings || 0,
      'Best Seller': product.is_best_seller ? 'Sim' : 'Não',
      'Amazon Choice': product.is_amazon_choice ? 'Sim' : 'Não',
      'Prime': product.is_prime ? 'Sim' : 'Não',
      'Volume de Vendas': product.sales_volume || 'N/A',
      'Entrega': product.delivery || 'N/A',
      'Badge': product.product_badge || 'N/A',
      'Descrição': product.product_byline || 'N/A',
      'URL do Produto': product.product_url,
      'URL da Imagem': product.product_photo
    }));

    const worksheet = XLSX.utils.json_to_sheet(workbookData);
    const workbook = XLSX.utils.book_new();
    
    // Configurar larguras das colunas
    const colWidths = [
      { wch: 5 },   // Nº
      { wch: 12 },  // ASIN
      { wch: 50 },  // Título
      { wch: 12 },  // Preço
      { wch: 12 },  // Preço Original
      { wch: 8 },   // Moeda
      { wch: 10 },  // Avaliação
      { wch: 12 },  // Nº Avaliações
      { wch: 12 },  // Best Seller
      { wch: 12 },  // Amazon Choice
      { wch: 8 },   // Prime
      { wch: 20 },  // Volume
      { wch: 30 },  // Entrega
      { wch: 15 },  // Badge
      { wch: 30 },  // Descrição
      { wch: 40 },  // URL Produto
      { wch: 40 }   // URL Imagem
    ];
    
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Produtos');
    
    const fileName = `relatorio_keywords_${searchParams.query.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, fileName);

    toast({
      title: "Download iniciado",
      description: `Arquivo XLSX com ${state.products.length} produtos exportado.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Relatório de Busca por Keywords</h1>
          <p className="text-muted-foreground">
            Busque produtos na Amazon por palavras-chave com filtros avançados e exporte para XLSX
          </p>
        </div>
      </div>

      {/* Formulário de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Parâmetros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Palavra-chave obrigatória */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Palavra-chave *</Label>
              <Input
                id="query"
                placeholder="Digite a palavra-chave para buscar..."
                value={searchParams.query}
                onChange={(e) => updateSearchParam('query', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País *</Label>
              <Select value={searchParams.country} onValueChange={(value) => updateSearchParam('country', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ordenação e Preços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_by">Ordenar por *</Label>
              <Select value={searchParams.sort_by} onValueChange={(value) => updateSearchParam('sort_by', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_price">Preço Mínimo</Label>
              <Input
                id="min_price"
                type="number"
                placeholder="Ex: 10"
                value={searchParams.min_price}
                onChange={(e) => updateSearchParam('min_price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_price">Preço Máximo</Label>
              <Input
                id="max_price"
                type="number"
                placeholder="Ex: 100"
                value={searchParams.max_price}
                onChange={(e) => updateSearchParam('max_price', e.target.value)}
              />
            </div>
          </div>

          {/* Filtros Avançados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="Ex: Samsung, Apple..."
                value={searchParams.brand}
                onChange={(e) => updateSearchParam('brand', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller_id">ID do Vendedor</Label>
              <Input
                id="seller_id"
                placeholder="ID do vendedor (opcional)"
                value={searchParams.seller_id}
                onChange={(e) => updateSearchParam('seller_id', e.target.value)}
              />
            </div>
          </div>

          {/* Switches e Ofertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_prime"
                checked={searchParams.is_prime}
                onCheckedChange={(checked) => updateSearchParam('is_prime', checked)}
              />
              <Label htmlFor="is_prime">Apenas produtos Prime</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deals">Ofertas e Descontos</Label>
              <Select value={searchParams.deals_and_discounts} onValueChange={(value) => updateSearchParam('deals_and_discounts', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEALS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão de Busca */}
          <div className="flex gap-3">
            <Button
              onClick={startSearch}
              disabled={state.isSearching || !searchParams.query.trim()}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              {state.isSearching ? 'Buscando...' : 'Iniciar Busca (7 páginas)'}
            </Button>
            
            {state.isSearching && (
              <Button variant="outline" onClick={stopSearch}>
                Parar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      {state.isSearching && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Busca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={state.progress} className="w-full" />
            <div className="text-sm text-muted-foreground">
              <div>Página atual: {state.currentPage}/{state.totalPages}</div>
              <div>{Math.round(state.progress)}% concluído</div>
              <div>Produtos encontrados: {state.products.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {(state.products.length > 0 || state.errors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da Busca</span>
              {state.products.length > 0 && (
                <Button onClick={downloadXLSX}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar XLSX
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.products.length > 0 && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">
                  {state.products.length} produtos encontrados
                </div>
                
                {/* Prévia dos produtos */}
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                  <div className="grid gap-2 p-4">
                    {state.products.slice(0, 10).map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                        <img 
                          src={product.product_photo} 
                          alt={product.product_title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{product.product_title}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatPrice(product.product_price)}</span>
                            {product.product_star_rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {product.product_star_rating}
                              </span>
                            )}
                            {product.is_prime && <span className="text-blue-600">Prime</span>}
                            {product.is_best_seller && <span className="text-orange-600">Best Seller</span>}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ASIN: {product.asin}
                        </div>
                      </div>
                    ))}
                    {state.products.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        ... e mais {state.products.length - 10} produtos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Erros encontrados:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {state.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}