import React, { useState } from 'react';
import { useStripe } from './StripeProvider';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutResponse {
  sessionId: string;
  url?: string;
}

interface CheckoutButtonProps {
  type: 'subscription' | 'credits';
  priceId: string;
  quantity?: number;
  planName?: string;
  creditsAmount?: number;
  className?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  type,
  priceId,
  quantity = 1,
  planName,
  creditsAmount,
  className = '',
  children,
  onSuccess,
  onError,
}) => {
  const { stripe, isLoading: stripeLoading } = useStripe();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!stripe || stripeLoading) {
      onError?.('Stripe não está carregado');
      return;
    }

    setLoading(true);

    try {
      const endpoint = type === 'subscription' 
        ? '/api/stripe/create-subscription-checkout'
        : '/api/stripe/create-credits-checkout';

      const payload = type === 'subscription'
        ? { priceId }
        : { priceId, quantity };

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const { sessionId } = response as CheckoutResponse;

      // Redirecionar para checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        onError?.(error.message || 'Erro no checkout');
      } else {
        onSuccess?.();
      }
    } catch (error: any) {
      const message = error.message || 'Erro ao iniciar checkout';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || stripeLoading}
      className={`
        relative inline-flex items-center justify-center
        px-6 py-3 border border-transparent text-base font-medium rounded-md
        text-white bg-blue-600 hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? 'Processando...' : children}
    </button>
  );
};