import { useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Crown, Coins, Settings, CreditCard } from 'lucide-react';
import StripeCheckout from '@/components/stripe/StripeCheckout';
import SubscriptionManager from '@/components/stripe/SubscriptionManager';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function MySubscriptions() {
  const searchString = useSearch();
  const [activeTab, setActiveTab] = useState('subscription');

  // Parse URL parameters
  const searchParams = new URLSearchParams(searchString);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const tab = searchParams.get('tab');

  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    enabled: true
  });

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas e Créditos</h1>
          <p className="text-gray-600">Gerencie sua assinatura, créditos e faturamento</p>
        </div>
      </div>

      {/* Success/Cancel Alerts */}
      {success === 'true' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Pagamento processado com sucesso! Sua assinatura foi ativada.
          </AlertDescription>
        </Alert>
      )}

      {canceled === 'true' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Pagamento cancelado. Você pode tentar novamente quando desejar.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Faturamento
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionManager />
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Escolha seu Plano</CardTitle>
              <CardDescription>
                {subscriptionStatus?.hasSubscription 
                  ? 'Altere seu plano atual ou assine um plano diferente'
                  : 'Escolha o plano ideal para suas necessidades'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripeCheckout currentPlan={subscriptionStatus?.currentPlan?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portal de Faturamento</CardTitle>
                <CardDescription>
                  Acesse o portal completo do Stripe para gerenciar métodos de pagamento, 
                  baixar faturas e atualizar informações de cobrança.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Clique no botão "Portal de Cobrança" na aba Assinatura para acessar 
                    todas as opções de faturamento.
                  </p>
                  <p className="text-sm text-gray-500">
                    Lá você pode atualizar cartões, baixar faturas, alterar dados de cobrança e muito mais.
                  </p>
                </div>
              </CardContent>
            </Card>

            {subscriptionStatus?.hasSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Cobrança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Plano Atual</p>
                      <p className="text-lg font-semibold">{subscriptionStatus.currentPlan?.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Valor Mensal</p>
                      <p className="text-lg font-semibold">
                        R$ {subscriptionStatus.currentPlan?.price?.toFixed(2).replace('.', ',') || '0,00'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">
                        {subscriptionStatus.subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Próxima Cobrança</p>
                      <p className="text-lg font-semibold">
                        {subscriptionStatus.subscription?.nextBillingDate 
                          ? new Date(subscriptionStatus.subscription.nextBillingDate).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}