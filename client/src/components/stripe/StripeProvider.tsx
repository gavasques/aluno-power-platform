import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  isLoading: true,
  error: null,
});

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe deve ser usado dentro de StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: React.ReactNode;
  publishableKey: string;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  publishableKey,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (err) {
        setError('Erro ao carregar Stripe');
        console.error('Erro ao inicializar Stripe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, [publishableKey]);

  return (
    <StripeContext.Provider value={{ stripe, isLoading, error }}>
      {children}
    </StripeContext.Provider>
  );
};