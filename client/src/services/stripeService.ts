import { apiRequest } from '@/lib/queryClient';
import { logger } from '@/utils/logger';

export interface CreateCheckoutRequest {
  priceId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalRequest {
  returnUrl?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface SubscriptionInfo {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    canceledAt: number | null;
  } | null;
  plan: {
    id: string;
    name: string;
    unitAmount: number;
    currency: string;
    interval: string;
    credits: number;
  } | null;
}

export interface InvoicesResponse {
  invoices: Array<{
    id: string;
    amountPaid: number;
    amountDue: number;
    currency: string;
    status: string;
    created: number;
    periodStart: number;
    periodEnd: number;
    hostedInvoiceUrl: string;
    invoicePdf: string;
  }>;
}

export interface ProductsResponse {
  subscriptions: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    prices: Array<{
      id: string;
      unitAmount: number;
      currency: string;
      interval: string;
      credits: number;
    }>;
  }>;
  credits: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    prices: Array<{
      id: string;
      unitAmount: number;
      currency: string;
      credits: number;
    }>;
  }>;
}

export const stripeService = {
  // Create subscription checkout session
  createSubscriptionCheckout: async (request: CreateCheckoutRequest): Promise<CheckoutResponse> => {
    logger.debug('🔍 [STRIPE SERVICE] Creating subscription checkout:', request);
    
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        priceId: request.priceId,
        successUrl: request.successUrl || `${window.location.origin}/minha-area/assinaturas?success=true`,
        cancelUrl: request.cancelUrl || `${window.location.origin}/minha-area/assinaturas?canceled=true`
      })
    });

    logger.debug('🔍 [STRIPE SERVICE] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      logger.error('🔍 [STRIPE SERVICE] Error response:', error);
      throw new Error(error.details || 'Failed to create subscription checkout');
    }

    const data = await response.json();
    logger.debug('🔍 [STRIPE SERVICE] Success response:', data);
    
    const result = { sessionId: data.sessionId || '', url: data.checkoutUrl };
    logger.debug('🔍 [STRIPE SERVICE] Returning data:', result);
    
    return result;
  },

  // Create credits checkout session
  createCreditsCheckout: async (request: CreateCheckoutRequest): Promise<CheckoutResponse> => {
    const response = await apiRequest('/api/stripe/create-credits-checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to create credits checkout');
    }

    return response.json();
  },

  // Create customer portal session
  createCustomerPortal: async (request: CustomerPortalRequest = {}): Promise<CustomerPortalResponse> => {
    const response = await apiRequest('/api/stripe/create-customer-portal', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to create customer portal');
    }

    return response.json();
  },

  // Get user's subscription info
  getSubscription: async (): Promise<SubscriptionInfo> => {
    const response = await apiRequest('/api/stripe/subscription');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to get subscription info');
    }

    return response.json();
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, atPeriodEnd: boolean = true): Promise<void> => {
    const response = await apiRequest('/api/stripe/cancel-subscription', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId, atPeriodEnd }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to cancel subscription');
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, newPriceId: string): Promise<void> => {
    const response = await apiRequest('/api/stripe/update-subscription', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId, newPriceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to update subscription');
    }
  },

  // Get invoices
  getInvoices: async (limit: number = 10): Promise<InvoicesResponse> => {
    const response = await apiRequest(`/api/stripe/invoices?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to get invoices');
    }

    return response.json();
  },

  // Get available products and prices
  getProducts: async (): Promise<ProductsResponse> => {
    const response = await apiRequest('/api/stripe/products');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to get products');
    }

    return response.json();
  },
};

// Utility functions for Stripe integration
export const formatStripeAmount = (amount: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe amounts are in cents
};

export const formatStripeDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
};

export const getSubscriptionStatusBadge = (status: string): { text: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } => {
  switch (status) {
    case 'active':
      return { text: 'Ativo', variant: 'default' };
    case 'canceled':
      return { text: 'Cancelado', variant: 'destructive' };
    case 'incomplete':
      return { text: 'Incompleto', variant: 'secondary' };
    case 'incomplete_expired':
      return { text: 'Expirado', variant: 'destructive' };
    case 'past_due':
      return { text: 'Em Atraso', variant: 'outline' };
    case 'unpaid':
      return { text: 'Não Pago', variant: 'destructive' };
    default:
      return { text: status, variant: 'secondary' };
  }
};