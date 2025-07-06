import { useState } from 'react';

interface UseStripeCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useStripeCheckout = (options: UseStripeCheckoutOptions = {}) => {
  const [loading, setLoading] = useState(false);

  const createSubscriptionCheckout = async (priceId: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/minha-area/assinaturas?success=true`,
          cancelUrl: `${window.location.origin}/minha-area/assinaturas?canceled=true`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect directly to Stripe Checkout (avoids iframe issues)
      window.location.href = checkoutUrl;
      
      options.onSuccess?.();
    } catch (error: any) {
      const message = error.message || 'Erro ao iniciar checkout';
      options.onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const createCreditsCheckout = async (priceId: string, quantity: number = 1) => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-credits-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ priceId, quantity })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar checkout de créditos');
      }

      const { url } = await response.json();
      
      // Redirect directly to Stripe Checkout (avoids iframe issues)
      window.location.href = url;
      
      options.onSuccess?.();
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