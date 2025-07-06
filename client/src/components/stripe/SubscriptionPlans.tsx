import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_CONFIG, formatCurrency } from '@/config/stripe';

interface SubscriptionStatus {
  hasSubscription: boolean;
  currentPlan?: {
    name: string;
    status: string;
    currentPeriodEnd: string;
  };
  credits: {
    current: number;
    monthly: number;
  };
}

export const SubscriptionPlans: React.FC = () => {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    queryFn: () => apiRequest('/api/stripe/subscription-status'),
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest('/api/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          successUrl: `${window.location.origin}/minha-area/assinaturas?success=true`,
          cancelUrl: `${window.location.origin}/minha-area/assinaturas?cancelled=true`
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar checkout",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
      setIsCreatingCheckout(null);
    }
  });

  const handleSubscribe = async (priceId: string) => {
    setIsCreatingCheckout(priceId);
    createCheckoutMutation.mutate(priceId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const status = subscriptionStatus as SubscriptionStatus;

  return (
    <div className="space-y-6">
      {/* Status atual */}
      {status?.hasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Assinatura Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Plano:</strong> {status.currentPlan?.name}</p>
              <p><strong>Status:</strong> <Badge variant="outline">{status.currentPlan?.status}</Badge></p>
              <p><strong>Próxima cobrança:</strong> {status.currentPlan?.currentPeriodEnd}</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm"><strong>Créditos:</strong> {status.credits.current} / {status.credits.monthly} mensais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos disponíveis */}
      <div className="grid md:grid-cols-3 gap-6">
        {STRIPE_CONFIG.subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="py-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-gray-600">/mês</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="px-3 py-1">
                  {plan.credits} créditos mensais
                </Badge>
              </div>
              
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={isCreatingCheckout === plan.priceId || status?.hasSubscription}
                variant={plan.popular ? "default" : "outline"}
              >
                {isCreatingCheckout === plan.priceId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : status?.hasSubscription ? (
                  'Plano Atual'
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Assinar Agora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pacotes de créditos */}
      <div className="pt-8">
        <h3 className="text-xl font-semibold mb-4">Comprar Créditos Avulsos</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {STRIPE_CONFIG.creditPackages.map((pkg) => (
            <Card key={pkg.id} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(pkg.price)}
                </div>
                {pkg.bonus && (
                  <Badge variant="secondary" className="mx-auto">
                    +{pkg.bonus} bônus
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubscribe(pkg.priceId)}
                  disabled={isCreatingCheckout === pkg.priceId}
                  className="w-full"
                >
                  {isCreatingCheckout === pkg.priceId ? (
                    'Processando...'
                  ) : (
                    'Comprar'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};