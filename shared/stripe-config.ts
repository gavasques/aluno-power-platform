// Stripe Configuration for Payment Plans and Credit Packages

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  credits: number;
  popular?: boolean;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  credits: number;
  bonus?: number; // Extra credits for larger packages
  popular?: boolean;
}

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para iniciantes em e-commerce',
    priceId: 'price_basic_monthly', // To be replaced with actual Stripe price IDs
    price: 39.90,
    currency: 'BRL',
    interval: 'month',
    credits: 1000,
    features: [
      '1.000 créditos mensais',
      'Acesso ao Amazon Listing Optimizer',
      'Suporte via chat',
      'Templates básicos',
      'Dashboard pessoal'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para vendedores experientes',
    priceId: 'price_premium_monthly',
    price: 79.90,
    currency: 'BRL',
    interval: 'month',
    credits: 2500,
    popular: true,
    features: [
      '2.500 créditos mensais',
      'Todos os agentes de IA',
      'Análise avançada de competidores',
      'Suporte prioritário',
      'Templates premium',
      'Relatórios detalhados',
      'Integrações avançadas'
    ]
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Para vendedores profissionais',
    priceId: 'price_master_monthly',
    price: 199.00,
    currency: 'BRL',
    interval: 'month',
    credits: 5000,
    features: [
      '5.000 créditos mensais',
      'Acesso ilimitado a todos os recursos',
      'Análise competitiva avançada',
      'Suporte telefônico dedicado',
      'Templates exclusivos',
      'API Access',
      'Consultoria mensal inclusa',
      'White-label para agências'
    ]
  }
];

// Credit Packages for one-time purchases
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_1000',
    name: '1.000 Créditos',
    description: 'Pacote inicial',
    priceId: 'price_credits_1000',
    price: 29.90,
    currency: 'BRL',
    credits: 1000
  },
  {
    id: 'credits_2500',
    name: '2.500 Créditos',
    description: 'Melhor valor',
    priceId: 'price_credits_2500',
    price: 69.90,
    currency: 'BRL',
    credits: 2500,
    bonus: 250,
    popular: true
  },
  {
    id: 'credits_5000',
    name: '5.000 Créditos',
    description: 'Para uso intensivo',
    priceId: 'price_credits_5000',
    price: 129.90,
    currency: 'BRL',
    credits: 5000,
    bonus: 750
  },
  {
    id: 'credits_10000',
    name: '10.000 Créditos',
    description: 'Pacote empresarial',
    priceId: 'price_credits_10000',
    price: 239.90,
    currency: 'BRL',
    credits: 10000,
    bonus: 2000
  }
];

// Utility functions
export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function formatCredits(credits: number): string {
  return new Intl.NumberFormat('pt-BR').format(credits);
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getCreditPackageById(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}

export function calculateCreditsWithBonus(baseCredits: number, bonus?: number): number {
  return baseCredits + (bonus || 0);
}