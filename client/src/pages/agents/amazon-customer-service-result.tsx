import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Copy, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SessionData {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  input_data: {
    customerName?: string;
    productPurchased?: string;
    emailContent: string;
    userAnalysis: string;
    isUnderWarranty?: boolean;
    shippingFormat?: string;
  };
  result_data?: {
    response: string;
    analysis?: {
      customerIssue: string;
      sentiment: string;
      urgency: string;
    };
  };
  created_at: string;
  completed_at?: string;
  error?: string;
}

const AmazonCustomerServiceResult = () => {
  const [, params] = useRoute("/agentes/amazon-customer-service/resultado/:sessionId");
  const sessionId = params?.sessionId;
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSessionData = async () => {
    if (!sessionId) return;

    try {
      const data = await apiRequest(`/api/agents/amazon-customer-service/sessions/${sessionId}`);
      setSessionData(data);
      setError(null);

      // If still processing, continue polling
      if (data.status === 'processing') {
        setTimeout(fetchSessionData, 2000);
      }
    } catch (err: any) {
      console.error('Error fetching session:', err);
      setError(err.message || 'Erro ao carregar resultado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Resposta copiada para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  const downloadResponse = () => {
    if (!sessionData?.result_data?.response) return;

    // Criar nome do arquivo com timestamp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `customer_service_${year}${month}${day}_${hours}${minutes}${seconds}.txt`;

    const element = document.createElement("a");
    const file = new Blob([sessionData.result_data.response], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Content Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Sessão não encontrada"}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processando</Badge>;
      case 'completed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resposta Gerada para Cliente</h1>
              <p className="text-muted-foreground">
                Email de atendimento personalizado e profissional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(sessionData.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {sessionData.status === 'processing' && (
        <Alert className="mb-6">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>Processando...</strong> Nosso agente está analisando o email e gerando uma resposta personalizada.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {sessionData.status === 'failed' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {sessionData.error || "Falha no processamento"}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {sessionData.status === 'completed' && sessionData.result_data && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Response */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Resposta Profissional Gerada
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(sessionData.result_data!.response)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
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
                  Email pronto para envio seguindo as melhores práticas de atendimento Amazon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div 
                    className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sessionData.result_data.response
                        .replace(/\\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/--/g, '—')
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Original Email */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Email Original do Cliente</CardTitle>
                <CardDescription>
                  Conteúdo que foi analisado para gerar a resposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-red-500">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {sessionData.input_data.emailContent}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Additional Customer Info */}
            {(sessionData.input_data.customerName || sessionData.input_data.productPurchased || 
              sessionData.input_data.isUnderWarranty !== undefined || sessionData.input_data.shippingFormat) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Informações Adicionais</CardTitle>
                  <CardDescription>
                    Dados complementares sobre o cliente e produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {sessionData.input_data.customerName && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nome do Comprador</p>
                        <p className="text-sm">{sessionData.input_data.customerName}</p>
                      </div>
                    )}
                    {sessionData.input_data.productPurchased && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Produto Comprado</p>
                        <p className="text-sm">{sessionData.input_data.productPurchased}</p>
                      </div>
                    )}
                    {sessionData.input_data.isUnderWarranty !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Está na Garantia?</p>
                        <Badge variant={sessionData.input_data.isUnderWarranty ? "default" : "secondary"}>
                          {sessionData.input_data.isUnderWarranty ? "Sim" : "Não"}
                        </Badge>
                      </div>
                    )}
                    {sessionData.input_data.shippingFormat && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Formato de Envio</p>
                        <Badge variant="outline">{sessionData.input_data.shippingFormat}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Analysis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Análise do Usuário</CardTitle>
                <CardDescription>
                  Observações e contexto adicional fornecido para o atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {sessionData.input_data.userAnalysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(sessionData.status)}
                </div>
                <div>
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sessionData.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {sessionData.completed_at && (
                  <div>
                    <p className="text-sm font-medium">Concluído em</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sessionData.completed_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      )}
    </div>
  );
};

export default AmazonCustomerServiceResult;