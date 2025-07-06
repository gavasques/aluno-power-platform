import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CheckoutButton } from './CheckoutButton';
import { useToast } from '@/hooks/use-toast';
import { Subscription, Plan, CustomerPortalResponse } from '@/types/stripe';

export const SubscriptionManager: React.FC = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/stripe/subscription/current'],
    queryFn: () => apiRequest('/api/stripe/subscription/current'),
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/stripe/plans'],
    queryFn: () => apiRequest('/api/stripe/plans'),
  });

  const subscription = subscriptionData as Subscription | null;
  const plans = plansData as Plan[] | null;

  const handleCancelSubscription = async () => {
    try {
      await apiRequest('/api/stripe/subscription/cancel', {
        method: 'POST',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription/current'] });
      setShowCancelModal(false);
      
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura será cancelada ao final do período atual.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Erro ao cancelar assinatura",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const response = await apiRequest('/api/stripe/create-customer-portal', {
        method: 'POST',
      });
      window.location.href = (response as CustomerPortalResponse).url;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao abrir portal do cliente",
        variant: "destructive",
      });
    }
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assinatura Atual */}
      {subscription ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Assinatura Atual</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Plano</p>
              <p className="font-semibold">{subscription?.planName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`
                inline-flex px-2 py-1 text-xs font-semibold rounded-full
                ${subscription?.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Próxima Cobrança</p>
              <p className="font-semibold">
                {subscription?.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Mensal</p>
              <p className="font-semibold">
                R$ {subscription?.amount ? (subscription.amount / 100).toFixed(2) : '0,00'}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={openCustomerPortal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Gerenciar Pagamento
            </button>
            
            {!subscription?.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancelar Assinatura
              </button>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                Sua assinatura será cancelada em{' '}
                {subscription?.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
                  : 'N/A'
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nenhuma Assinatura Ativa</h3>
          <p className="text-gray-600 mb-4">
            Escolha um plano para começar a usar todos os recursos da plataforma.
          </p>
        </div>
      )}

      {/* Planos Disponíveis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Planos Disponíveis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans && plans.map((plan: Plan) => (
            <div
              key={plan.id}
              className={`
                border rounded-lg p-6 relative
                ${subscription?.planName === plan.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
                }
              `}
            >
              {subscription?.planName === plan.name && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs rounded-bl">
                  Atual
                </div>
              )}

              <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
              <p className="text-3xl font-bold mb-4">
                R$ {plan.price.toFixed(2)}
                <span className="text-sm font-normal text-gray-600">/mês</span>
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {plan.credits.toLocaleString()} créditos/mês
                </li>
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {subscription?.planName !== plan.name && (
                <CheckoutButton
                  type="subscription"
                  priceId={plan.priceId}
                  planName={plan.name}
                  className="w-full"
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription/current'] });
                    toast({
                      title: "Sucesso!",
                      description: `Assinatura do plano ${plan.name} ativada com sucesso.`,
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "Erro",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                >
                  {subscription ? 'Alterar Plano' : 'Assinar'}
                </CheckoutButton>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancelar Assinatura</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso 
              aos recursos até o final do período atual.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex-1 transition-colors"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelSubscription}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex-1 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};