import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Download, AlertCircle, Globe, Star, Package, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CountrySelector, COUNTRIES } from '@/components/common/CountrySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreditCostButton } from '@/components/CreditCostButton';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Types
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

// Constants
const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevância' },
  { value: 'PRICE_LOW_TO_HIGH', label: 'Menor Preço' },
  { value: 'PRICE_HIGH_TO_LOW', label: 'Maior Preço' },
  { value: 'REVIEWS', label: 'Avaliações' },
  { value: 'NEWEST', label: 'Novos' },
  { value: 'BEST_SELLERS', label: 'Mais Vendidos' }
];

const DEALS_OPTIONS = [
  { value: 'NONE', label: 'Nenhum' },
  { value: 'ALL_DISCOUNTS', label: 'Todos Descontos' },
  { value: 'TODAYS_DEALS', label: 'Ofertas do Dia' }
];

const FEATURE_CODE = 'tools.keyword_report';

export default function KeywordSearchReport() {
  const [searchParams, setSearchParams] = useState({
    query: '',
    country: 'BR',
    sort_by: 'RELEVANCE',
    min_price: '',
    max_price: '',
    brand: '',
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

  const { execute, loading } = useApiRequest();
  const { balance: userBalance } = useUserCreditBalance();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();
  const { token } = useAuth();

  const updateSearchParam = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const searchProducts = async (page: number): Promise<Product[]> => {
    const data = await execute(
      () => fetch('/api/amazon-keywords/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...searchParams,
          page,
          min_price: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
          max_price: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
        })
      })
    );

    if (data?.success) {
      return data.data.products || [];
    }
    
    throw new Error('Falha na busca de produtos');
  };

  const startSearch = async () => {
    if (!searchParams.query.trim()) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
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

    // Log da busca inicial
    try {
      await fetch('/api/amazon-keywords/log-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchParams.query,
          country: searchParams.country,
          filters: {
            sort_by: searchParams.sort_by,
            brand: searchParams.brand,
            min_price: searchParams.min_price,
            max_price: searchParams.max_price,
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
          
          setState(prev => ({
            ...prev,
            products: allProducts,
            totalProducts: allProducts.length
          }));
          
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

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'amazon',
        model: 'keyword-search',
        prompt: `Pesquisa: ${searchParams.query}`,
        response: `${allProducts.length} produtos encontrados`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        errors: [...prev.errors, `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }));
    }
  };

  const stopSearch = () => {
    setState(prev => ({
      ...prev,
      isSearching: false
    }));
  };

  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return 'N/A';
    return price.replace(/[^\d.,]/g, '');
  };

  const downloadXLSX = () => {
    console.log('🔍 [DOWNLOAD] Iniciando download XLSX...');
    console.log('🔍 [DOWNLOAD] Produtos disponíveis:', state.products.length);
    
    if (state.products.length === 0) {
      console.log('❌ [DOWNLOAD] Nenhum produto disponível para download');
      toast({
        title: "Erro no Download",
        description: "Nenhum produto encontrado para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
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

      console.log('🔍 [DOWNLOAD] WorkbookData criado:', workbookData.length, 'itens');

      const worksheet = XLSX.utils.json_to_sheet(workbookData);
      const workbook = XLSX.utils.book_new();
      
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
        { wch: 40 }, { wch: 40 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Produtos');
      
      const fileName = `relatorio_keywords_${searchParams.query.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('🔍 [DOWNLOAD] Nome do arquivo:', fileName);
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      console.log('🔍 [DOWNLOAD] Blob criado:', blob.size, 'bytes');
      
      saveAs(blob, fileName);
      
      console.log('✅ [DOWNLOAD] Download iniciado com sucesso!');
      toast({
        title: "Download Iniciado",
        description: `Arquivo ${fileName} está sendo baixado.`,
      });
      
    } catch (error) {
      console.error('❌ [DOWNLOAD] Erro no download:', error);
      toast({
        title: "Erro no Download",
        description: "Falha ao gerar arquivo XLSX. Tente novamente.",
        variant: "destructive",
      });
    }
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
              <CountrySelector
                value={searchParams.country}
                onValueChange={(value) => updateSearchParam('country', value)}
                placeholder="Selecione o país"
              />
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

          {/* Ofertas */}
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

          {/* Botão de Busca */}
          <div className="flex gap-3">
            <CreditCostButton
              featureName="tools.keyword_report"
              userBalance={userBalance}
              onProcess={startSearch}
              disabled={state.isSearching || !searchParams.query.trim()}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              {state.isSearching ? 'Buscando...' : 'Iniciar Busca (7 páginas)'}
            </CreditCostButton>
            
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

      {loading && <LoadingSpinner message="Buscando produtos..." />}

      {/* Resultados */}
      {(state.products.length > 0 || state.errors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da Busca</span>
              {state.products.length > 0 && (
                <Button onClick={downloadXLSX}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar XLSX ({state.products.length} produtos)
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Produtos */}
            {state.products.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.products.slice(0, 12).map((product, index) => (
                    <div key={product.asin} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3">
                        <img
                          src={product.product_photo}
                          alt={product.product_title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2 mb-1">
                            {product.product_title}
                          </h4>
                          <div className="text-sm text-muted-foreground mb-2">
                            ASIN: {product.asin}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-green-600">
                              {formatPrice(product.product_price)}
                            </span>
                            {product.product_star_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{product.product_star_rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.is_best_seller && (
                              <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                                Best Seller
                              </span>
                            )}
                            {product.is_amazon_choice && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                Choice
                              </span>
                            )}
                            {product.is_prime && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                Prime
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {state.products.length > 12 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... e mais {state.products.length - 12} produtos no arquivo XLSX
                  </p>
                )}
              </div>
            )}

            {/* Erros */}
            {state.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Erros durante a busca:</p>
                    <ul className="text-sm space-y-1">
                      {state.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}