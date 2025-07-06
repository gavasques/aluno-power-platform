// Stripe API Response Types
export interface CheckoutResponse {
  sessionId: string;
  url?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface Subscription {
  id: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  priceId: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    email: string;
  };
  created: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  created: number;
  due_date: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  lines: {
    data: Array<{
      description: string;
      amount: number;
      currency: string;
    }>;
  };
}

// Credit Package Configuration
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
  bonus?: number;
}

// Stripe Configuration
export interface StripeConfig {
  plans: Plan[];
  creditPackages: CreditPackage[];
}

// Default configuration for the application
export const STRIPE_CONFIG: StripeConfig = {
  plans: [
    {
      id: 'basic',
      name: 'Basic',
      price: 39.90,
      credits: 1000,
      priceId: 'price_basic_monthly',
      features: [
        '1.000 créditos mensais',
        'Acesso a todos os agentes',
        'Suporte por email',
        'Histórico de uso',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 79.90,
      credits: 2500,
      priceId: 'price_premium_monthly',
      features: [
        '2.500 créditos mensais',
        'Acesso a todos os agentes',
        'Suporte prioritário',
        'Histórico detalhado',
        'Exportação de relatórios',
      ],
      popular: true,
    },
    {
      id: 'master',
      name: 'Master',
      price: 199.00,
      credits: 10000,
      priceId: 'price_master_monthly',
      features: [
        '10.000 créditos mensais',
        'Acesso completo',
        'Suporte 24/7',
        'API personalizada',
        'Integrações avançadas',
        'Consultoria inclusa',
      ],
    },
  ],
  creditPackages: [
    {
      id: 'credits_1000',
      name: '1.000 Créditos',
      credits: 1000,
      price: 19.90,
      priceId: 'price_credits_1000',
    },
    {
      id: 'credits_2500',
      name: '2.500 Créditos',
      credits: 2500,
      price: 45.90,
      priceId: 'price_credits_2500',
      bonus: 100,
    },
    {
      id: 'credits_5000',
      name: '5.000 Créditos',
      credits: 5000,
      price: 89.90,
      priceId: 'price_credits_5000',
      bonus: 500,
    },
    {
      id: 'credits_10000',
      name: '10.000 Créditos',
      credits: 10000,
      price: 169.90,
      priceId: 'price_credits_10000',
      bonus: 1500,
    },
  ],
};