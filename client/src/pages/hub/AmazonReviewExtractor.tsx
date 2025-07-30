import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, ExternalLink, Trash2, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/UserContext';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CountrySelector } from '@/components/common/CountrySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreditCostButton } from '@/components/CreditCostButton';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';

// Types
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
  countryLocked: boolean;
}

// Helper functions
const extractOrValidateASIN = (input: string): string | null => {
  // ASIN direto (10 caracteres alfanuméricos)
  if (/^[A-Z0-9]{10}$/.test(input.trim())) {
    return input.trim();
  }

  // Extração de URL
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

const FEATURE_CODE = 'tools.amazon_reviews';

export default function AmazonReviewExtractor() {
  const { user, token } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [state, setState] = useState<ExtractorState>({
    urls: [],
    isExtracting: false,
    progress: 0,
    currentPage: 0,
    totalPages: 10,
    currentProduct: '',
    extractedReviews: [],
    errors: [],
    countryLocked: false
  });

  const { execute, loading } = useApiRequest();
  const { balance: userBalance } = useUserCreditBalance();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();

  const addUrl = () => {
    if (!urlInput.trim()) return;

    const asin = extractOrValidateASIN(urlInput);
    if (!asin) {
      return;
    }

    if (state.urls.includes(urlInput)) {
      return;
    }

    setState(prev => ({
      ...prev,
      urls: [...prev.urls, urlInput],
      countryLocked: prev.urls.length === 0
    }));
    setUrlInput('');
  };

  const removeUrl = (index: number) => {
    setState(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
      countryLocked: prev.urls.length > 1
    }));
  };

  const fetchReviews = async (asin: string, page: number): Promise<ReviewData[]> => {
    try {
      const data = await execute(
        () => fetch('/api/amazon-reviews/extract', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            asin,
            page,
            country: selectedCountry,
            sort_by: 'MOST_RECENT'
          })
        })
      );

      // Verificar se a resposta foi bem-sucedida
      if (data?.status === 'OK' && data?.data?.reviews) {
        const reviews = data.data.reviews;
        
        // Se reviews é um array válido, mapear os dados
        if (Array.isArray(reviews)) {
          return reviews.map((review: any) => ({
            review_title: review.review_title || '',
            review_star_rating: review.review_star_rating || '',
            review_comment: review.review_comment || ''
          }));
        }
      }
      
      // Se chegou aqui, não há reviews disponíveis nesta página
      return [];
      
    } catch (error: any) {

      
      // Se o erro indica que não há mais reviews (404, ou fim dos dados), retornar array vazio
      if (error.message.includes('404') || error.message.includes('Erro 400')) {
        return [];
      }
      
      // Para outros erros, propagar a exceção
      throw error;
    }
  };

  const extractReviews = async () => {
    if (state.urls.length === 0) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setState(prev => ({
      ...prev,
      isExtracting: true,
      progress: 0,
      extractedReviews: [],
      errors: []
    }));

    try {
      const allReviews: ReviewData[] = [];
      const errors: string[] = [];
      let totalPagesProcessed = 0;
      let totalPagesEstimated = state.urls.length * 3; // Estimativa inicial mais conservadora

      for (const url of state.urls) {
        const asin = extractOrValidateASIN(url);
        if (!asin) {
          errors.push(`URL inválida: ${url}`);
          continue;
        }

        setState(prev => ({ ...prev, currentProduct: asin }));

        let page = 1;
        let consecutiveEmptyPages = 0;
        const MAX_CONSECUTIVE_EMPTY = 2;
        const MAX_PAGES_PER_PRODUCT = state.totalPages;

        while (page <= MAX_PAGES_PER_PRODUCT && consecutiveEmptyPages < MAX_CONSECUTIVE_EMPTY) {
          try {
            setState(prev => ({ ...prev, currentPage: page }));
            
            const reviews = await fetchReviews(asin, page);
            
            if (reviews.length === 0) {
              consecutiveEmptyPages++;

            } else {
              consecutiveEmptyPages = 0; // Reset contador se encontrar reviews
              allReviews.push(...reviews);

            }
            
            // Delay para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error: any) {
            errors.push(`Erro página ${page} - ASIN ${asin}: ${error.message}`);

            consecutiveEmptyPages++;
          }

          totalPagesProcessed++;
          
          // Atualizar estimativa de progresso dinamicamente
          if (consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {
            // Se atingiu o limite de páginas vazias, ajustar estimativa total
            const remainingUrls = state.urls.length - (state.urls.indexOf(url) + 1);
            totalPagesEstimated = totalPagesProcessed + (remainingUrls * page);
          }

          setState(prev => ({ 
            ...prev, 
            progress: Math.min((totalPagesProcessed / totalPagesEstimated) * 100, 99)
          }));

          page++;
        }

        if (consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {

        }
      }

      setState(prev => ({
        ...prev,
        extractedReviews: allReviews,
        errors,
        isExtracting: false,
        progress: 100
      }));



      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'amazon',
        model: 'review-extractor',
        prompt: `Extração de reviews de ${state.urls.length} produtos`,
        response: `${allReviews.length} reviews extraídos com sucesso`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });

      // Exibir toast de sucesso
      toast({
        title: "Extração concluída!",
        description: `${allReviews.length} reviews extraídos de ${state.urls.length} produtos`,
      });

    } catch (error: any) {

      setState(prev => ({
        ...prev,
        isExtracting: false,
        errors: [...prev.errors, `Erro geral: ${error.message}`]
      }));
    }
  };

  const downloadTXT = () => {
    if (state.extractedReviews.length === 0) return;

    const txtContent = state.extractedReviews.map((review, index) => {
      const title = review.review_title || 'Sem título';
      const rating = review.review_star_rating || 'Sem avaliação';
      const comment = review.review_comment || 'Sem comentário';
      
      return `=== REVIEW ${index + 1} ===
Título: ${title}
Avaliação: ${rating} estrelas
Comentário: ${comment}

`;
    }).join('');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amazon_reviews_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Extrator de Reviews Amazon
          </h1>
          <p className="text-muted-foreground mt-2">
            Extraia reviews de produtos Amazon para análise competitiva
          </p>
        </div>
      </div>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Extração</CardTitle>
          <CardDescription>
            Adicione URLs ou ASINs de produtos e selecione o país de origem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="URL da Amazon ou ASIN do produto"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              />
            </div>
            <CountrySelector
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              className={state.countryLocked ? "opacity-50" : ""}
            />
            <Button onClick={addUrl} disabled={!urlInput.trim()}>
              Adicionar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Máximo de páginas por produto</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={state.totalPages}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 10;
                  setState(prev => ({ ...prev, totalPages: Math.max(1, Math.min(50, value)) }));
                }}
                disabled={state.isExtracting}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                O extrator para automaticamente após 2 páginas consecutivas vazias (mesmo antes do limite)
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimativa de reviews</label>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm">
                  Até <span className="font-semibold">{state.urls.length * state.totalPages * 10}</span> reviews
                </p>
                <p className="text-xs text-muted-foreground">
                  ({state.urls.length} produtos × {state.totalPages} páginas × ~10 reviews/página)
                </p>
              </div>
            </div>
          </div>

          {state.urls.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Produtos para extração:</h3>
              <div className="space-y-2">
                {state.urls.map((url, index) => {
                  const asin = extractOrValidateASIN(url);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                          ASIN: {asin}
                        </span>
                        <ExternalLink 
                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(url, '_blank')}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUrl(index)}
                        disabled={state.isExtracting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <CreditCostButton
            featureName="tools.amazon_reviews"
            userBalance={userBalance}
            onProcess={extractReviews}
            disabled={state.urls.length === 0 || state.isExtracting}
            className="w-full"
          >
            {state.isExtracting ? 'Extraindo...' : `Extrair Reviews (${state.urls.length} produtos)`}
          </CreditCostButton>
        </CardContent>
      </Card>

      {/* Progresso */}
      {state.isExtracting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progresso da extração</span>
                <span>
                  {Math.round(state.progress)}%
                  {state.progress >= 99 && state.progress < 100 && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                      (Finalizando...)
                    </span>
                  )}
                </span>
              </div>
              <Progress value={state.progress} />
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Produto atual: <span className="font-mono">{state.currentProduct}</span>
                </div>
                <div>
                  Página: {state.currentPage}
                  {state.extractedReviews.length > 0 && (
                    <span className="ml-4 text-green-600 dark:text-green-400">
                      • {state.extractedReviews.length} reviews coletados
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <LoadingSpinner message="Extraindo reviews..." />}

      {/* Erros */}
      {state.errors.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Erros durante a extração:</p>
              {state.errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {state.extractedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Reviews Extraídos</CardTitle>
                <CardDescription>
                  {state.extractedReviews.length} reviews coletados
                </CardDescription>
              </div>
              <Button onClick={downloadTXT}>
                <Download className="mr-2 h-4 w-4" />
                Baixar TXT
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {state.extractedReviews.slice(0, 10).map((review, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{review.review_title || 'Sem título'}</h4>
                    <span className="text-sm text-muted-foreground">
                      {review.review_star_rating} ⭐
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {review.review_comment || 'Sem comentário'}
                  </p>
                </div>
              ))}
              {state.extractedReviews.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  ... e mais {state.extractedReviews.length - 10} reviews
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}