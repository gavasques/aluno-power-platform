import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Copy, ChevronDown, ChevronRight, Tag } from 'lucide-react';

const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'AE', name: 'Emirados Árabes Unidos', flag: '🇦🇪' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' },
  { code: 'ZA', name: 'África do Sul', flag: '🇿🇦' }
];

interface KeywordSuggestionsResponse {
  status: number;
  data: {
    meta: {
      prefix: string;
      region: string;
      hostname: string;
      language_code: string;
      currency_code: string;
      currency_symbol: string;
    };
    suggestions: string[];
  };
}

export default function AmazonKeywordSuggestions() {
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KeywordSuggestionsResponse | null>(null);
  const [isMetaOpen, setIsMetaOpen] = useState(true);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma palavra-chave para buscar sugestões.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/amazon-keyword-suggestions?prefix=${encodeURIComponent(keyword.trim())}&region=${selectedCountry}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar sugestões de palavras-chave');
      }

      const data: KeywordSuggestionsResponse = await response.json();
      setResults(data);
      
      toast({
        title: 'Sucesso!',
        description: `${data.data.suggestions.length} sugestões de palavras-chave encontradas.`
      });

    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar sugestões de palavras-chave. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado!',
        description: 'Dados copiados para a área de transferência.'
      });
    });
  };

  const copyAllSuggestions = () => {
    if (results?.data.suggestions) {
      const allSuggestions = results.data.suggestions.join('\n');
      copyToClipboard(allSuggestions);
    }
  };

  const selectedCountryData = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Amazon Keyword Suggestions
        </h1>
        <p className="text-gray-600">
          Descubra ideias de palavras-chave relacionadas para otimizar seus produtos na Amazon
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Busca */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Sugestões
            </CardTitle>
            <CardDescription>
              Insira uma palavra-chave para encontrar sugestões relacionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyword">Palavra-chave</Label>
              <Input
                id="keyword"
                placeholder="Ex: notebook gamer"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Sugestões
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {results && (
            <>
              {/* Informações da Busca */}
              <Card>
                <Collapsible open={isMetaOpen} onOpenChange={setIsMetaOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Informações da Busca
                        </span>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(JSON.stringify(results.data.meta, null, 2));
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </Button>
                          {isMetaOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Palavra-chave pesquisada</p>
                          <p className="text-lg font-semibold">{results.data.meta.prefix}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Região</p>
                          <p className="text-lg font-semibold flex items-center gap-2">
                            <span>{selectedCountryData?.flag}</span>
                            <span>{selectedCountryData?.name} ({results.data.meta.region})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Site Amazon</p>
                          <p className="text-sm text-blue-600">{results.data.meta.hostname}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Moeda</p>
                          <p className="text-sm">{results.data.meta.currency_symbol} ({results.data.meta.currency_code})</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Sugestões de Palavras-chave */}
              <Card>
                <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Search className="h-5 w-5" />
                          Sugestões de Palavras-chave ({results.data.suggestions.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAllSuggestions();
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar Todas
                          </Button>
                          {isSuggestionsOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-2">
                        {results.data.suggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{suggestion}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(suggestion)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </>
          )}

          {!results && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma busca realizada
                </h3>
                <p className="text-gray-600">
                  Insira uma palavra-chave para encontrar sugestões relacionadas na Amazon
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}