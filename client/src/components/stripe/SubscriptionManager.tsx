import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  XCircle, 
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionManager() {
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    enabled: true
  });

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }

      const result = await response.json();
      
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso. Você ainda terá acesso até o final do período atual.",
        variant: "default"
      });

      // Refresh subscription status
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription-status'] });
      setShowCancelConfirm(false);
      
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro no cancelamento",
        description: "Não foi possível cancelar a assinatura. Tente novamente ou entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/minha-area/assinaturas`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao acessar portal de cobrança');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('Erro ao acessar portal:', error);
      toast({
        title: "Erro no portal",
        description: "Não foi possível acessar o portal de cobrança. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'incomplete':
        return <Badge className="bg-orange-100 text-orange-800">Incompleto</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus?.hasSubscription) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-gray-400" />
          </div>
          <CardTitle>Nenhuma Assinatura Ativa</CardTitle>
          <CardDescription>
            Você não possui uma assinatura ativa no momento. Escolha um plano para começar a usar todos os recursos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const subscription = subscriptionStatus.subscription;
  const currentPlan = subscriptionStatus.currentPlan;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{currentPlan?.name || 'Assinatura Ativa'}</CardTitle>
                <CardDescription>Gerencie sua assinatura e faturamento</CardDescription>
              </div>
            </div>
            {getStatusBadge(subscription?.status || 'unknown')}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Valor Mensal</p>
                <p className="text-xl font-bold text-blue-600">
                  R$ {currentPlan?.price?.toFixed(2).replace('.', ',') || '0,00'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Próxima Cobrança</p>
                <p className="text-sm font-semibold">
                  {subscription?.nextBillingDate ? 
                    formatDate(subscription.nextBillingDate) : 
                    'Não disponível'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Créditos Mensais</p>
                <p className="text-xl font-bold text-green-600">
                  {subscriptionStatus.credits?.monthly?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {subscription?.cancelledAt && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sua assinatura foi cancelada e será encerrada em {formatDate(subscription.endDate)}.
                Você ainda pode usar todos os recursos até esta data.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={handleManageBilling}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Portal de Cobrança
            </Button>

            {subscription?.status === 'active' && !subscription?.cancelledAt && (
              <>
                {!showCancelConfirm ? (
                  <Button 
                    onClick={() => setShowCancelConfirm(true)}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      variant="destructive"
                      size="sm"
                    >
                      {isCanceling && <ButtonLoader />}
                      Confirmar Cancelamento
                    </Button>
                    <Button 
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      size="sm"
                    >
                      Manter Assinatura
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {showCancelConfirm && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tem certeza que deseja cancelar?</strong><br />
                Você perderá acesso aos créditos mensais e recursos premium, mas manterá acesso até o final do período atual.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos do seu Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentPlan.features?.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}