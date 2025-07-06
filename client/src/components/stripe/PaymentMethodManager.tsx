import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod } from '@/types/stripe';

export const PaymentMethodManager: React.FC = () => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethodsData, isLoading } = useQuery({
    queryKey: ['/api/stripe/payment-methods'],
    queryFn: () => apiRequest('/api/stripe/payment-methods'),
  });

  const paymentMethods = paymentMethodsData as PaymentMethod[] | null;

  const deleteMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      apiRequest(`/api/stripe/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/payment-methods'] });
      toast({
        title: "Cartão removido",
        description: "Método de pagamento removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover método de pagamento",
        variant: "destructive",
      });
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/stripe/setup-intent', {
        method: 'POST',
      }),
    onSuccess: (data: any) => {
      // Em um cenário real, você redirecionaria para o Stripe para adicionar o cartão
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar método de pagamento",
        variant: "destructive",
      });
    },
  });

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    if (window.confirm('Tem certeza que deseja remover este método de pagamento?')) {
      deleteMutation.mutate(paymentMethodId);
    }
  };

  const handleAddPaymentMethod = () => {
    addPaymentMethodMutation.mutate();
  };

  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
      unknown: 'Desconhecido',
    };
    return brands[brand] || brand;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Métodos de Pagamento</h3>
        <button
          onClick={handleAddPaymentMethod}
          disabled={addPaymentMethodMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {addPaymentMethodMutation.isPending ? 'Adicionando...' : 'Adicionar Cartão'}
        </button>
      </div>

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {method.card ? formatCardBrand(method.card.brand) : method.type}
                  </span>
                </div>
                
                <div>
                  {method.card && (
                    <>
                      <p className="font-medium">
                        •••• •••• •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Exp: {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                      </p>
                    </>
                  )}
                  {method.billing_details.name && (
                    <p className="text-sm text-gray-600">
                      {method.billing_details.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Adicionado em {new Date(method.created * 1000).toLocaleDateString('pt-BR')}
                </span>
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18v10H3V10zM3 22h18v10H3V22zM25 10h18v10H25V10zM25 22h18v10H25V22z"
            />
          </svg>
          <h4 className="mt-2 text-lg font-medium text-gray-900">
            Nenhum método de pagamento
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            Adicione um cartão de crédito para facilitar os pagamentos.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddPaymentMethod}
              disabled={addPaymentMethodMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {addPaymentMethodMutation.isPending ? 'Adicionando...' : 'Adicionar Primeiro Cartão'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};