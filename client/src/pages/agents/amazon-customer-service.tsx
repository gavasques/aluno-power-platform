import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Bot, AlertCircle, ArrowRight, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";


const AmazonCustomerService = () => {
  const [emailContent, setEmailContent] = useState("");
  const [userObservations, setUserObservations] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o email do cliente",
        variant: "destructive",
      });
      return;
    }

    if (!userObservations.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira suas observações sobre o ocorrido",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a new session for this analysis
      const sessionResponse = await apiRequest('/api/agents/amazon-customer-service/sessions', {
        method: 'POST',
        body: JSON.stringify({
          input_data: {
            emailContent: emailContent.trim(),
            userObservations: userObservations.trim()
          }
        }),
      });

      if (sessionResponse?.sessionId) {
        // Start processing
        const processResponse = await apiRequest('/api/agents/amazon-customer-service/process', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: sessionResponse.sessionId,
            emailContent: emailContent.trim(),
            userObservations: userObservations.trim()
          }),
        });

        if (processResponse?.sessionId) {
          // Navigate to results page
          setLocation(`/agentes/amazon-customer-service/resultado/${processResponse.sessionId}`);
        } else {
          throw new Error('Session ID not received');
        }
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error: any) {
      console.error('Error processing email:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleEmail = `Assunto: Produto com defeito - Pedido #123-4567890-1234567

Olá,

Comprei um fone de ouvido Bluetooth da marca XYZ pelo valor de R$ 149,90 há 5 dias (pedido #123-4567890-1234567) e já está apresentando problemas sérios.

O fone simplesmente não conecta com meu celular. Já tentei de tudo - resetei o fone, esqueci e reconectei o Bluetooth, testei em outros dispositivos, mas nada funciona. A bateria também não dura nem 2 horas quando deveria durar 8 horas conforme descrito no anúncio.

Estou muito frustrado porque preciso deste fone para trabalhar e agora vou ter que comprar outro em outro lugar. Quero devolver este produto e receber meu dinheiro de volta o mais rápido possível.

Este foi o pior produto que já comprei na Amazon. Vou deixar uma avaliação negativa para avisar outros compradores.

Aguardo retorno urgente.

João Silva`;

  return (
      <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Amazon Customer Service Email Response</h1>
            <p className="text-muted-foreground">
              Agente especializado em responder emails de clientes insatisfeitos com tom caloroso e soluções proativas
            </p>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Dados para Atendimento
              </CardTitle>
              <CardDescription>
                Forneça o email do cliente e suas observações sobre o caso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailContent">Email do Cliente *</Label>
                <Textarea
                  id="emailContent"
                  placeholder="Cole aqui o email completo do cliente..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userObservations">Informações do Usuário *</Label>
                <Textarea
                  id="userObservations"
                  placeholder="Explique o que ocorreu, contexto adicional, observações sobre o caso..."
                  value={userObservations}
                  onChange={(e) => setUserObservations(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || !emailContent.trim() || !userObservations.trim()}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Bot className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Resposta...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Gerar Resposta Profissional
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailContent(exampleEmail);
                    setUserObservations("Produto com defeito de fabricação confirmado. Cliente relatou que já tentou soluções básicas. Oferecemos troca imediata e acompanhamento personalizado para reverter possível avaliação negativa.");
                  }}
                  disabled={isProcessing}
                >
                  Usar Exemplo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O que este agente faz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Resposta Empática</p>
                  <p className="text-sm text-muted-foreground">
                    Reconhece frustração e demonstra compreensão
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Solução Proativa</p>
                  <p className="text-sm text-muted-foreground">
                    Oferece soluções concretas e múltiplas opções
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tom Caloroso</p>
                  <p className="text-sm text-muted-foreground">
                    Mantém proximidade e compromisso da marca
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Call to Action</p>
                  <p className="text-sm text-muted-foreground">
                    Próximos passos claros para o cliente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> A agilidade na resposta é fundamental no atendimento Amazon. 
              Este agente gera respostas que abrem caminho para reverter avaliações negativas.
            </AlertDescription>
          </Alert>

          {/* Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Requisitos:</strong> Forneça o email completo do cliente e suas observações 
              sobre o caso para uma resposta personalizada e eficaz.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default AmazonCustomerService;