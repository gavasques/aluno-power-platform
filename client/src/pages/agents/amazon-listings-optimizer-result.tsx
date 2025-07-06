import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  CheckCircle2,
  AlertCircle,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AmazonListingsOptimizerResult() {
  const [location, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session');
    
    if (id) {
      setSessionId(id);
      loadResults(id);
    } else {
      setError('ID da sessão não encontrado');
      setIsLoading(false);
    }
  }, []);

  const loadResults = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/amazon-sessions/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar resultados');
      }
      const data = await response.json();
      setResults(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    if (!results) return;
    
    const content = `
RESULTADOS - OTIMIZADOR DE LISTAGENS AMAZON
=========================================

PRODUTO: ${results.nomeProduto || 'N/A'}
MARCA: ${results.marca || 'N/A'}
CATEGORIA: ${results.categoria || 'N/A'}

ANÁLISE DAS AVALIAÇÕES:
${results.reviewsInsight || 'Não disponível'}

TÍTULOS OTIMIZADOS:
${results.titulos || 'Não disponível'}

Data de geração: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amazon-listing-${results.nomeProduto || 'resultado'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Carregando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/agents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Agentes
            </Button>
          </Link>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/agents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Agentes
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Resultados da Otimização
        </h1>
        <p className="text-muted-foreground">
          Análise de avaliações e títulos otimizados para Amazon
        </p>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Produto</Label>
                  <p className="text-sm text-muted-foreground">{results.nomeProduto || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Marca</Label>
                  <p className="text-sm text-muted-foreground">{results.marca || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm text-muted-foreground">{results.categoria || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1 Results */}
          {results.reviewsInsight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Análise das Avaliações</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(results.reviewsInsight)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={results.reviewsInsight}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2 Results */}
          {results.titulos && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Títulos Otimizados</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(results.titulos)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={results.titulos}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={downloadResults} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar Resultados
            </Button>
            <Link href="/agents/amazon-listings-optimizer">
              <Button variant="outline" className="flex-1">
                Nova Otimização
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}