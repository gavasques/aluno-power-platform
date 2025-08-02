import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Bot, AlertCircle, ArrowRight, Clock, Target, User, Building, Package, Hash, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
// Layout removed - component is already wrapped by app layout
import { Link } from "wouter";
import { useCreditSystem } from '@/hooks/useCreditSystem';

const AmazonNegativeReviews = () => {
  const [negativeReview, setNegativeReview] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPosition, setSellerPosition] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast } = useCreditSystem();

  const FEATURE_CODE = 'agents.negative_reviews';

  const fillExample = () => {
    setNegativeReview("Produto chegou com defeito, a trava do suporte da cabeça não está fixando corretamente. Além disso, demorou muito para chegar e a embalagem estava danificada. Muito decepcionado com a compra, esperava muito mais qualidade pelo preço pago. Não recomendo.");
    setUserInfo("Cliente comprou durante promoção. Primeira compra na nossa loja. Produto enviado via transportadora regional.");
    setSellerName("Carlos Silva");
    setSellerPosition("Gerente de Atendimento");
    setCustomerName("Maria Santos");
    setOrderId("123-4567890-1234567");
  };

  const handleSubmit = async () => {
    if (!negativeReview.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira a avaliação negativa do cliente.",
        variant: "destructive",
      });
      return;
    }

    if (!sellerName.trim() || !sellerPosition.trim() || !customerName.trim() || !orderId.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsProcessing(true);

    try {
      const sessionId = `nr-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const response = await apiRequest("/api/agents/amazon-negative-reviews/process", {
        method: "POST",
        body: {
          sessionId,
          negativeReview: negativeReview.trim(),
          userInfo: userInfo.trim() || "",
          sellerName: sellerName.trim(),
          sellerPosition: sellerPosition.trim(),
          customerName: customerName.trim(),
          orderId: orderId.trim()
        },
      });

      if (response.sessionId) {
        setLocation(`/agentes/amazon-negative-reviews/resultado/${response.sessionId}`);
      }
    } catch (error: any) {
      console.error("Error processing review response:", error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Ocorreu um erro ao processar a resposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed debug logging

  return (
    <PermissionGuard 
      featureCode="agents.negative_reviews"
      showMessage={true}
      message="Você não tem permissão para usar o Amazon Negative Reviews Response."
    >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/agentes">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="bg-red-100 p-3 rounded-lg">
            <MessageSquare className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Amazon Negative Reviews Response</h1>
            <p className="text-gray-600">Agente especializado em responder avaliações negativas com tom caloroso e soluções proativas</p>
          </div>
        </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Dados para Resposta
              </CardTitle>
              <CardDescription>
                Forneça os dados da avaliação negativa e suas informações para gerar uma resposta empática e estratégica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="negativeReview" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Avaliação Negativa do Cliente *
                </Label>
                <Textarea
                  id="negativeReview"
                  placeholder="Cole aqui a avaliação negativa recebida do cliente..."
                  value={negativeReview}
                  onChange={(e) => setNegativeReview(e.target.value)}
                  className="mt-2 min-h-[120px]"
                  required
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Seu Nome *
                  </Label>
                  <Input
                    id="sellerName"
                    placeholder="Nome do vendedor que está respondendo"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sellerPosition" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Cargo *
                  </Label>
                  <Input
                    id="sellerPosition"
                    placeholder="Cargo do vendedor que está respondendo"
                    value={sellerPosition}
                    onChange={(e) => setSellerPosition(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome do Cliente *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Nome do cliente que fez a avaliação"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="orderId" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID do Pedido *
                  </Label>
                  <Input
                    id="orderId"
                    placeholder="ID do pedido do cliente"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="userInfo" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informações Adicionais
                </Label>
                <Textarea
                  id="userInfo"
                  placeholder="Informações que possam ser úteis para a resposta (histórico do cliente, detalhes do produto, etc.) - Opcional"
                  value={userInfo}
                  onChange={(e) => setUserInfo(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? "Gerando Resposta..." : "Gerar Resposta Estratégica"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={fillExample}
                  disabled={isProcessing}
                >
                  Usar Exemplo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O que este agente faz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Resposta Empática</span>
                  <p className="text-gray-600">Reconhece frustração e demonstra compreensão genuína</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Solução Proativa</span>
                  <p className="text-gray-600">Oferece reembolso completo e gestos extras de boa vontade</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Tom Caloroso</span>
                  <p className="text-gray-600">Mantém linguagem pessoal e acessível para humanizar a interação</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Convite Futuro</span>
                  <p className="text-gray-600">Cria oportunidade para nova experiência positiva</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Dica Estratégica</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <p>A aplicação da resposta é fundamental no atendimento Amazon. Este agente cria experiências tão positivas que clientes <strong>voluntariamente</strong> atualizam suas avaliações negativas.</p>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
    </PermissionGuard>
  );
};

export default AmazonNegativeReviews;