import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Calendar, AlertTriangle, ExternalLink, Crown, Zap } from 'lucide-react';
import { stripeService, formatStripeAmount, formatStripeDate, getSubscriptionStatusBadge } from '@/services/stripeService';
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, formatPrice, formatCredits } from '../../../shared/stripe-config';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  // Get current subscription
  const { data: subscriptionData, isLoading: loadingSubscription } = useQuery({
    queryKey: ['stripe-subscription'],
    queryFn: stripeService.getSubscription,
  });

  // Get invoices
  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['stripe-invoices'],
    queryFn: () => stripeService.getInvoices(10),
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: ({ type, priceId }: { type: 'subscription' | 'credits'; priceId: string }) => {
      if (type === 'subscription') {
        return stripeService.createSubscriptionCheckout({ priceId });
      } else {
        return stripeService.createCreditsCheckout({ priceId });
      }
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro no checkout',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setLoadingCheckout(null);
    },
  });

  // Customer portal mutation
  const customerPortalMutation = useMutation({
    mutationFn: stripeService.createCustomerPortal,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Customer portal error:', error);
      toast({
        title: 'Erro ao acessar portal',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const handleSubscribe = async (priceId: string) => {
    setLoadingCheckout(priceId);
    createCheckoutMutation.mutate({ type: 'subscription', priceId });
  };

  const handleBuyCredits = async (priceId: string) => {
    setLoadingCheckout(priceId);
    createCheckoutMutation.mutate({ type: 'credits', priceId });
  };

  const handleManageBilling = () => {
    customerPortalMutation.mutate({});
  };

  const currentSubscription = subscriptionData?.subscription;
  const currentPlan = subscriptionData?.plan;
  const statusBadge = currentSubscription ? getSubscriptionStatusBadge(currentSubscription.status) : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura, compre créditos e visualize seu histórico de cobrança
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando informações da assinatura...</span>
            </div>
          ) : currentSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan?.name || 'Plano Ativo'}</h3>
                  <p className="text-muted-foreground">
                    {formatStripeAmount(currentPlan?.unitAmount || 0, currentPlan?.currency)}
                    /{currentPlan?.interval === 'month' ? 'mês' : 'ano'}
                  </p>
                </div>
                <Badge variant={statusBadge?.variant}>{statusBadge?.text}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                  <p className="text-sm font-medium">
                    {formatStripeDate(currentSubscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créditos mensais</p>
                  <p className="text-sm font-medium">
                    {formatCredits(currentPlan?.credits || 0)} créditos
                  </p>
                </div>
              </div>

              {currentSubscription.cancelAtPeriodEnd && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sua assinatura será cancelada em {formatStripeDate(currentSubscription.currentPeriodEnd)}.
                    Você pode reativar a qualquer momento no portal de cobrança.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleManageBilling}
                  disabled={customerPortalMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {customerPortalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Gerenciar Cobrança
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-muted-foreground mb-4">
                Escolha um plano abaixo para começar a usar todos os recursos da plataforma
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Planos de Assinatura</CardTitle>
          <CardDescription>
            Escolha o plano que melhor se adapta às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Zap className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loadingCheckout === plan.priceId || currentPlan?.id === plan.priceId}
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loadingCheckout === plan.priceId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {currentPlan?.id === plan.priceId ? 'Plano Atual' : 'Assinar'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pacotes de Créditos Avulsos</CardTitle>
          <CardDescription>
            Compre créditos adicionais conforme sua necessidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-4 ${
                  pkg.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <Badge className="mb-2" size="sm">Melhor Valor</Badge>
                )}
                
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold">{pkg.name}</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(pkg.price)}
                  </p>
                  {pkg.bonus && (
                    <p className="text-sm text-green-600">
                      +{formatCredits(pkg.bonus)} créditos bônus
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleBuyCredits(pkg.priceId)}
                  disabled={loadingCheckout === pkg.priceId}
                  className="w-full"
                  variant="outline"
                >
                  {loadingCheckout === pkg.priceId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Comprar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Histórico de Cobrança
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando histórico...</span>
            </div>
          ) : invoicesData?.invoices?.length ? (
            <div className="space-y-4">
              {invoicesData.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {formatStripeAmount(invoice.amountPaid, invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatStripeDate(invoice.created)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                      {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                    {invoice.hostedInvoiceUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                      >
                        Ver Fatura
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}