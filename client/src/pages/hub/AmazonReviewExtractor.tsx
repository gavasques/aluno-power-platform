import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, ExternalLink, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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

export default function AmazonReviewExtractor() {
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [state, setState] = useState<ExtractorState>({
    urls: [],
    isExtracting: false,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    currentProduct: '',
    extractedReviews: [],
    errors: []
  });

  // Função para extrair ASIN da URL da Amazon
  const extractASIN = (url: string): string | null => {
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/product\/([A-Z0-9]{10})/,
      /asin=([A-Z0-9]{10})/,
      /\/([A-Z0-9]{10})(?:\/|\?|$)/
    ];

    for (const pattern of asinPatterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // Adicionar URL à lista
  const addUrl = () => {
    if (!urlInput.trim()) return;

    const asin = extractASIN(urlInput);
    if (!asin) {
      toast({
        title: "URL inválida",
        description: "Não foi possível extrair o ASIN da URL fornecida.",
        variant: "destructive"
      });
      return;
    }

    if (state.urls.includes(urlInput)) {
      toast({
        title: "URL duplicada",
        description: "Esta URL já foi adicionada à lista.",
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
      title: "URL adicionada",
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
        country: 'BR',
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
        const asin = extractASIN(url);
        
        if (!asin) {
          errors.push(`URL ${urlIndex + 1}: ASIN não encontrado`);
          continue;
        }

        setState(prev => ({
          ...prev,
          currentProduct: `Produto ${urlIndex + 1}/${state.urls.length} (${asin})`,
          totalPages: 10
        }));

        // Buscar até 10 páginas de reviews para cada produto
        for (let page = 1; page <= 10; page++) {
          try {
            setState(prev => ({
              ...prev,
              currentPage: page,
              progress: ((urlIndex * 10 + page) / (state.urls.length * 10)) * 100
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
          <CardTitle>URLs dos Produtos</CardTitle>
          <CardDescription>
            Adicione URLs de produtos da Amazon. O ASIN será extraído automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="url-input">URL do Produto Amazon</Label>
              <Input
                id="url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.amazon.com.br/dp/B0CGJKTB6K"
                onKeyDown={(e) => e.key === 'Enter' && addUrl()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addUrl} disabled={state.isExtracting}>
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de URLs */}
          {state.urls.length > 0 && (
            <div className="space-y-2">
              <Label>URLs Adicionadas ({state.urls.length})</Label>
              {state.urls.map((url, index) => {
                const asin = extractASIN(url);
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