import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

interface StripeCheckoutProps {
  currentPlan?: string | null;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Plano Basic',
    price: 39.90,
    credits: 500,
    stripePriceId: 'price_1RhzvQJX2OwQ92jArTiSMjIn',
    features: [
      '500 créditos mensais de IA',
      'Acesso a todos os agentes',
      'Suporte por email',
      'Análise de produtos limitada'
    ]
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 79.90,
    credits: 1200,
    stripePriceId: 'price_1Rhzw4JX2OwQ92jAwXdSc4mk',
    popular: true,
    features: [
      '1.200 créditos mensais de IA',
      'Acesso a todos os agentes',
      'Suporte prioritário',
      'Análise de produtos completa',
      'Relatórios avançados'
    ]
  },
  {
    id: 'master',
    name: 'Plano Master',
    price: 199.00,
    credits: 3000,
    stripePriceId: 'price_1RhzwJJX2OwQ92jAhoyOwZQY',
    features: [
      '3.000 créditos mensais de IA',
      'Acesso a todos os agentes',
      'Suporte 24/7',
      'Análise de produtos ilimitada',
      'Relatórios personalizados',
      'Consultoria mensal'
    ]
  }
];

export default function StripeCheckout({ currentPlan }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    enabled: true
  });

  const handlePlanPurchase = async (plan: Plan) => {
    if (currentPlan === plan.id) {
      toast({
        title: "Plano atual",
        description: "Você já possui este plano ativo.",
        variant: "default"
      });
      return;
    }

    setIsLoading(plan.id);
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: plan.id,
          successUrl: `${window.location.origin}/minha-area/assinaturas?success=true`,
          cancelUrl: `${window.location.origin}/minha-area/assinaturas?canceled=true`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const { checkoutUrl } = await response.json();
      
      // Abrir Stripe Checkout em nova aba (evita problemas de iframe)
      const newWindow = window.open(checkoutUrl, '_blank');
      
      if (!newWindow) {
        toast({
          title: "Pop-up bloqueado",
          description: "Por favor, permita pop-ups e tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'premium': return <Crown className="h-6 w-6" />;
      case 'master': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.currentPlan?.name?.toLowerCase().includes(planId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu Plano</h2>
        <p className="text-gray-600">Selecione o plano ideal para suas necessidades de e-commerce</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
            } ${isCurrentPlan(plan.id) ? 'bg-green-50 border-green-200' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                {plan.id === 'basic' && 'Ideal para iniciantes no e-commerce'}
                {plan.id === 'premium' && 'Perfeito para vendedores ativos'}
                {plan.id === 'master' && 'Para vendedores profissionais'}
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                <span className="text-gray-500">/mês</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  {plan.credits.toLocaleString()} créditos mensais
                </Badge>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6"
                onClick={() => handlePlanPurchase(plan)}
                disabled={isLoading === plan.id || isCurrentPlan(plan.id)}
                variant={isCurrentPlan(plan.id) ? "secondary" : "default"}
                title="Abrirá o checkout do Stripe em nova aba"
              >
                {isLoading === plan.id && (
                  <ButtonLoader />
                )}
                {isCurrentPlan(plan.id) ? 'Plano Atual' : 'Assinar Agora'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}