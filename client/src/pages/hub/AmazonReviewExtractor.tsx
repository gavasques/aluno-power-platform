import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Download, ExternalLink, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewData {
  review_title: string;
  review_star_rating: string;
  review_comment: string;
}

interface ExtractorState {
  urls: string[];
  isExtracting: boolean;
  progress: number;
  currentPage: number;
  totalPages: number;
  currentProduct: string;
  extractedReviews: ReviewData[];
  errors: string[];
}

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
];

export default function AmazonReviewExtractor() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [state, setState] = useState<ExtractorState>({
    urls: [],
    isExtracting: false,
    progress: 0,
    currentPage: 0,
    totalPages: 10, // Mudado para 10 como solicitado
    currentProduct: '',
    extractedReviews: [],
    errors: []
  });

  // Função para extrair ASIN da URL da Amazon ou validar ASIN direto
  const extractOrValidateASIN = (input: string): string | null => {
    // Se for um ASIN direto (10 caracteres alfanuméricos)
    if (/^[A-Z0-9]{10}$/.test(input.trim())) {
      return input.trim();
    }

    // Se for uma URL, tenta extrair o ASIN
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/product\/([A-Z0-9]{10})/,
      /asin=([A-Z0-9]{10})/,
      /\/([A-Z0-9]{10})(?:\/|\?|$)/
    ];

    for (const pattern of asinPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // Adicionar URL ou ASIN à lista
  const addUrl = () => {
    if (!urlInput.trim()) return;

    const asin = extractOrValidateASIN(urlInput);
    if (!asin) {
      toast({
        title: "Entrada inválida",
        description: "Insira uma URL da Amazon válida ou um ASIN de 10 caracteres.",
        variant: "destructive"
      });
      return;
    }

    // Verifica se o ASIN já existe na lista
    const existingAsins = state.urls.map(url => extractOrValidateASIN(url));
    if (existingAsins.includes(asin)) {
      toast({
        title: "ASIN duplicado",
        description: "Este ASIN já foi adicionado à lista.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({
      ...prev,
      urls: [...prev.urls, urlInput]
    }));
    setUrlInput('');
    
    toast({
      title: "Produto adicionado",
      description: `ASIN ${asin} adicionado à lista.`
    });
  };

  // Remover URL da lista
  const removeUrl = (index: number) => {
    setState(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
  };

  // Função para salvar log de uso
  const saveUsageLog = async (asin: string) => {
    if (!user) return;
    
    const maxPages = (selectedCountry === 'BR' || selectedCountry === 'MX') ? 1 : 10;
    
    try {
      await fetch('/api/tool-usage-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          toolName: 'Extrator de Reviews Amazon',
          asin,
          country: selectedCountry,
          additionalData: {
            country: selectedCountry,
            totalPages: maxPages
          }
        })
      });
    } catch (error) {
      console.error('Erro ao salvar log de uso:', error);
    }
  };

  // Função para buscar reviews de uma página específica
  const fetchReviews = async (asin: string, page: number): Promise<ReviewData[]> => {
    const response = await fetch('/api/amazon-reviews/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asin,
        page,
        country: selectedCountry,
        sort_by: 'MOST_RECENT'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar reviews: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`API retornou erro: ${data.message || 'Erro desconhecido'}`);
    }

    return data.data.reviews.map((review: any) => ({
      review_title: review.review_title || '',
      review_star_rating: review.review_star_rating || '',
      review_comment: review.review_comment || ''
    }));
  };

  // Função principal para extrair reviews
  const extractReviews = async () => {
    if (state.urls.length === 0) {
      toast({
        title: "Nenhuma URL",
        description: "Adicione pelo menos uma URL antes de iniciar a extração.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({
      ...prev,
      isExtracting: true,
      progress: 0,
      extractedReviews: [],
      errors: []
    }));

    const allReviews: ReviewData[] = [];
    const errors: string[] = [];

    try {
      for (let urlIndex = 0; urlIndex < state.urls.length; urlIndex++) {
        const url = state.urls[urlIndex];
        const asin = extractOrValidateASIN(url);
        
        if (!asin) {
          errors.push(`URL ${urlIndex + 1}: ASIN não encontrado`);
          continue;
        }

        // Salvar log de uso
        await saveUsageLog(asin);

        // Definir número máximo de páginas baseado no país
        const maxPages = (selectedCountry === 'BR' || selectedCountry === 'MX') ? 1 : 10;

        setState(prev => ({
          ...prev,
          currentProduct: `Produto ${urlIndex + 1}/${state.urls.length} (${asin})`,
          totalPages: maxPages
        }));

        // Buscar páginas de reviews para cada produto (limitado por país)
        for (let page = 1; page <= maxPages; page++) {
          try {
            setState(prev => ({
              ...prev,
              currentPage: page,
              progress: ((urlIndex * maxPages + page) / (state.urls.length * maxPages)) * 100
            }));

            const reviews = await fetchReviews(asin, page);
            
            if (reviews.length === 0) {
              // Se não há mais reviews, parar de buscar páginas
              break;
            }

            allReviews.push(...reviews);

            // Pequeno delay para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (error) {
            errors.push(`${asin} - Página ${page}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            // Se der erro numa página, tentar a próxima
            continue;
          }
        }
      }

      setState(prev => ({
        ...prev,
        extractedReviews: allReviews,
        errors,
        progress: 100
      }));

      toast({
        title: "Extração concluída",
        description: `${allReviews.length} reviews extraídos com sucesso.`
      });

    } catch (error) {
      errors.push(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setState(prev => ({
        ...prev,
        errors
      }));
      
      toast({
        title: "Erro na extração",
        description: "Ocorreu um erro durante a extração. Verifique os detalhes.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({
        ...prev,
        isExtracting: false
      }));
    }
  };

  // Função para baixar CSV
  const downloadCSV = () => {
    if (state.extractedReviews.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há reviews para baixar.",
        variant: "destructive"
      });
      return;
    }

    const csvHeader = 'review_title,review_star_rating,review_comment\n';
    const csvData = state.extractedReviews.map(review => {
      const title = `"${(review.review_title || '').replace(/"/g, '""')}"`;
      const rating = review.review_star_rating || '';
      const comment = `"${(review.review_comment || '').replace(/"/g, '""')}"`;
      return `${title},${rating},${comment}`;
    }).join('\n');

    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amazon_reviews_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Download iniciado",
      description: `Arquivo CSV com ${state.extractedReviews.length} reviews baixado.`
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extrator de Reviews Amazon</h1>
          <p className="text-muted-foreground mt-2">
            Extraia reviews de produtos da Amazon para análise e insights
          </p>
        </div>
      </div>

      {/* Adição de URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos para Análise</CardTitle>
          <CardDescription>
            Adicione URLs da Amazon ou ASINs diretos. Avaliações do Brasil e México são limitadas a 1 página. Os demais países irão puxar até 10 páginas de avaliações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="url-input">URL da Amazon ou ASIN</Label>
              <Input
                id="url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="URL: https://amazon.com.br/dp/B0CGJKTB6K ou ASIN: B0CGJKTB6K"
                onKeyDown={(e) => e.key === 'Enter' && addUrl()}
              />
            </div>
            <div>
              <Label htmlFor="country-select">País da Amazon</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Alerta sobre limitações por país */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Limitações por país:</strong> {' '}
              {selectedCountry === 'BR' || selectedCountry === 'MX' 
                ? `${COUNTRIES.find(c => c.code === selectedCountry)?.flag} ${COUNTRIES.find(c => c.code === selectedCountry)?.name} está limitado a 1 página de avaliações.`
                : `${COUNTRIES.find(c => c.code === selectedCountry)?.flag} ${COUNTRIES.find(c => c.code === selectedCountry)?.name} irá extrair até 10 páginas de avaliações.`
              }
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-end">
            <Button onClick={addUrl} disabled={state.isExtracting}>
              Adicionar Produto
            </Button>
          </div>

          {/* Lista de URLs */}
          {state.urls.length > 0 && (
            <div className="space-y-2">
              <Label>URLs Adicionadas ({state.urls.length})</Label>
              {state.urls.map((url, index) => {
                const asin = extractOrValidateASIN(url);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">ASIN: {asin}</div>
                      <div className="text-sm text-muted-foreground truncate">{url}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrl(index)}
                        disabled={state.isExtracting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Extração */}
      <Card>
        <CardHeader>
          <CardTitle>Extração de Reviews</CardTitle>
          <CardDescription>
            Inicie a extração de reviews. Serão coletadas até 10 páginas por produto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={extractReviews} 
            disabled={state.isExtracting || state.urls.length === 0}
            className="w-full"
          >
            {state.isExtracting ? 'Extraindo...' : 'Iniciar Extração'}
          </Button>
        </CardContent>
      </Card>

      {/* Progresso */}
      {state.isExtracting && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Extração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={state.progress} className="w-full" />
            <div className="text-sm text-muted-foreground">
              {state.currentProduct && (
                <div>Produto atual: {state.currentProduct}</div>
              )}
              {state.currentPage > 0 && (
                <div>Página: {state.currentPage}/{state.totalPages}</div>
              )}
              <div>{Math.round(state.progress)}% concluído</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {(state.extractedReviews.length > 0 || state.errors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.extractedReviews.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    {state.extractedReviews.length} reviews extraídos
                  </div>
                  <Button onClick={downloadCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  {state.extractedReviews.slice(0, 10).map((review, index) => (
                    <div key={index} className="border-b pb-2 mb-2 last:border-b-0">
                      <div className="font-medium">{review.review_title}</div>
                      <div className="text-sm text-muted-foreground">
                        ⭐ {review.review_star_rating} estrelas
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {review.review_comment.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                  {state.extractedReviews.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... e mais {state.extractedReviews.length - 10} reviews
                    </div>
                  )}
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