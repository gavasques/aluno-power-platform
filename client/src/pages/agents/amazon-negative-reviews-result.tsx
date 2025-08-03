import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Copy, Download, MessageSquare, RefreshCw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SessionData {
  id: string;
  status: 'processing' | 'completed' | 'error';
  input_data: {
    negativeReview: string;
    userInfo?: string;
    sellerName: string;
    sellerPosition: string;
    customerName: string;
    orderId: string;
  };
  result_data?: {
    response: string;
    analysis: {
      sentiment: string;
      urgency: string;
      keyIssues: string[];
    };
  };
  processing_time?: number;

  completed_at?: string;
  error_message?: string;
}

const AmazonNegativeReviewsResult = () => {
  // Get sessionId from URL path
  const sessionId = window.location.pathname.split('/').pop();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const fetchSessionData = async () => {
    if (!sessionId) return;

    try {
      const data = await apiRequest(`/api/agents/amazon-negative-reviews/sessions/${sessionId}`) as SessionData;
      setSessionData(data);
      setError(null);

      console.log('📊 [FRONTEND] Session data received:', {
        sessionId: data.id,
        status: data.status,
        hasResult: !!data.result_data,
        hasResponse: !!data.result_data?.response
      });

      // If still processing, continue polling
      if (data.status === 'processing') {
        setTimeout(fetchSessionData, 2000);
      }
    } catch (err: any) {
      console.error('❌ [FRONTEND] Error fetching session:', err);
      setError(err.message || 'Erro ao carregar resultado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const copyToClipboard = async () => {
    if (!sessionData?.result_data?.response) return;

    try {
      await navigator.clipboard.writeText(sessionData.result_data.response);
      setIsCopied(true);
      toast({
        title: "Copiado!",
        description: "Resposta copiada para a área de transferência",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a resposta",
        variant: "destructive",
      });
    }
  };

  const downloadResponse = () => {
    if (!sessionData?.result_data?.response) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `negative_response_${timestamp}.txt`;
    
    const element = document.createElement('a');
    const file = new Blob([sessionData.result_data.response], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download iniciado!",
      description: `Arquivo ${filename} baixado com sucesso`,
    });
  };

  const goBack = () => {
    setLocation("/agentes/amazon-negative-reviews");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Gerando resposta estratégica...</h2>
            <p className="text-gray-600">Analisando a avaliação negativa e criando resposta empática</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro no processamento</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sessão não encontrada</h2>
            <p className="text-gray-600 mb-4">A sessão solicitada não foi encontrada</p>
            <Button onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resposta Gerada</h1>
            <p className="text-gray-600">Resultado da análise da avaliação negativa</p>
          </div>
        </div>
        
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nova Resposta
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {sessionData.status === 'processing' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Processando...</h3>
                    <p className="text-blue-700">Gerando resposta estratégica para a avaliação negativa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sessionData.status === 'completed' && sessionData.result_data && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resposta Estratégica Gerada
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {isCopied ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadResponse}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Resposta empática e proativa para transformar a experiência negativa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-gray-900">
                    {sessionData.result_data.response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {sessionData.status === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Erro no processamento</h3>
                    <p className="text-red-700">{sessionData.error_message || 'Ocorreu um erro inesperado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Dados da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Avaliação Negativa:</h4>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-sm text-gray-800">{sessionData.input_data.negativeReview}</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vendedor:</h4>
                  <p className="text-sm text-gray-600">{sessionData.input_data.sellerName}</p>
                  <p className="text-xs text-gray-500">{sessionData.input_data.sellerPosition}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cliente:</h4>
                  <p className="text-sm text-gray-600">{sessionData.input_data.customerName}</p>
                  <p className="text-xs text-gray-500">Pedido: {sessionData.input_data.orderId}</p>
                </div>
              </div>

              {sessionData.input_data.userInfo && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Informações Adicionais:</h4>
                    <p className="text-sm text-gray-600">{sessionData.input_data.userInfo}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Geração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={sessionData.status === 'completed' ? 'default' : sessionData.status === 'processing' ? 'secondary' : 'destructive'}>
                  {sessionData.status === 'completed' ? 'Concluído' : 
                   sessionData.status === 'processing' ? 'Processando' : 'Erro'}
                </Badge>
              </div>

              {sessionData.processing_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo:</span>
                  <span className="text-sm font-medium">{(sessionData.processing_time / 1000).toFixed(1)}s</span>
                </div>
              )}

              {sessionData.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Concluído:</span>
                  <span className="text-sm font-medium">
                    {new Date(sessionData.completed_at).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>



          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              <p>✅ Copie a resposta gerada</p>
              <p>✅ Envie para o cliente rapidamente</p>
              <p>✅ Acompanhe o processo de reembolso</p>
              <p>✅ Monitore se o cliente atualiza a avaliação</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmazonNegativeReviewsResult;