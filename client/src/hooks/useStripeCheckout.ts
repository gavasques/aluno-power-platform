import { useState } from 'react';
import { useStripe } from '../components/stripe/StripeProvider';
import { apiRequest } from '@/lib/queryClient';

interface UseStripeCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useStripeCheckout = (options: UseStripeCheckoutOptions = {}) => {
  const { stripe } = useStripe();
  const [loading, setLoading] = useState(false);

  const createSubscriptionCheckout = async (priceId: string) => {
    if (!stripe) {
      options.onError?.('Stripe não está carregado');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = response as { sessionId: string };
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        options.onError?.(error.message || 'Erro no checkout');
      } else {
        options.onSuccess?.();
      }
    } catch (error: any) {
      const message = error.message || 'Erro ao iniciar checkout';
      options.onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const createCreditsCheckout = async (priceId: string, quantity: number = 1) => {
    if (!stripe) {
      options.onError?.('Stripe não está carregado');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/api/stripe/create-credits-checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId, quantity }),
      });

      const { sessionId } = response as { sessionId: string };
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        options.onError?.(error.message || 'Erro no checkout');
      } else {
        options.onSuccess?.();
      }
    } catch (error: any) {
      const message = error.message || 'Erro ao iniciar checkout';
      options.onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    createSubscriptionCheckout,
    createCreditsCheckout,
    loading,
  };
};