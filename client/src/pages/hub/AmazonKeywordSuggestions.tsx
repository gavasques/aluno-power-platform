import React, { useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CreditCostButton } from '@/components/CreditCostButton';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { CountrySelector, COUNTRIES } from '@/components/common/CountrySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CopyButton } from '@/components/common/CopyButton';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';

interface KeywordSuggestionsData {
  meta: {
    prefix: string;
    region: string;
    hostname: string;
    language_code: string;
    currency_code: string;
    currency_symbol: string;
  };
  suggestions: string[];
}

const FEATURE_CODE = 'tools.keyword_suggestions';

export default function AmazonKeywordSuggestions() {
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const { execute, loading, error } = useApiRequest<KeywordSuggestionsData>({
    successMessage: 'Sugestões carregadas com sucesso!',
  });
  const { balance: userBalance } = useUserCreditBalance();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    const data = await execute(
      () => fetch(`/api/amazon-keyword-suggestions?prefix=${encodeURIComponent(keyword)}&region=${selectedCountry}`),
      (response) => response.data
    );

    if (data?.suggestions) {
      setSuggestions(data.suggestions);
      setIsExpanded(true);
      
      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'amazon',
        model: 'keyword-suggestions',
        prompt: `Sugestões de palavras-chave para: ${keyword}`,
        response: `${data.suggestions.length} sugestões encontradas`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });
    }
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Tag className="h-8 w-8" />
          Amazon Keyword Suggestions
        </h1>
        <p className="text-muted-foreground">
          Descubra palavras-chave relacionadas para seus produtos Amazon em diferentes países
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Sugestões de Keywords</CardTitle>
          <CardDescription>
            Digite uma palavra-chave inicial e selecione o país para obter sugestões relacionadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Digite uma palavra-chave (ex: notebook gamer)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <CountrySelector
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              placeholder="Selecione o país"
            />
          </div>

          <CreditCostButton
            featureName="tools.keyword_suggestions"
            userBalance={userBalance}
            onProcess={handleSearch}
            disabled={loading || !keyword.trim()}
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Buscando...' : 'Buscar Sugestões'}
          </CreditCostButton>

          {loading && <LoadingSpinner message="Buscando sugestões..." />}
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Sugestões para "{keyword}"
                </CardTitle>
                <CardDescription>
                  {suggestions.length} sugestões encontradas para {selectedCountryData?.flag} {selectedCountryData?.name}
                </CardDescription>
              </div>
              <CopyButton
                text={suggestions.join('\n')}
                label="Copiar Todas"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span>Clique para {isExpanded ? 'recolher' : 'expandir'} as sugestões</span>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md group">
                      <Badge variant="outline" className="flex-1 justify-start">
                        {suggestion}
                      </Badge>
                      <CopyButton
                        text={suggestion}
                        label=""
                        variant="ghost"
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  );
}