// Configuração dos produtos e preços do Stripe
export const STRIPE_CONFIG = {
  // Planos de Assinatura
  subscriptionPlans: [
    {
      id: 'basic',
      name: 'Plano Basic',
      description: 'Ideal para iniciantes no e-commerce',
      price: 39.90,
      priceId: 'price_1RhzvQJX2OwQ92jArTiSMjIn',
      credits: 500,
      features: [
        '500 créditos mensais de IA',
        'Acesso a todos os agentes',
        'Suporte por email',
        'Análise de produtos limitada'
      ]
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      description: 'Perfeito para vendedores ativos',
      price: 79.90,
      priceId: 'price_1Rhzw4JX2OwQ92jAwXdSc4mk',
      credits: 1200,
      features: [
        '1.200 créditos mensais de IA',
        'Acesso a todos os agentes',
        'Suporte prioritário',
        'Análise de produtos completa',
        'Relatórios avançados'
      ],
      popular: true
    },
    {
      id: 'master',
      name: 'Plano Master',
      description: 'Para vendedores profissionais',
      price: 199.00,
      priceId: 'price_1RhzwJJX2OwQ92jAhoyOwZQY',
      credits: 3000,
      features: [
        '3.000 créditos mensais de IA',
        'Acesso a todos os agentes',
        'Suporte 24/7',
        'Análise de produtos ilimitada',
        'Relatórios personalizados',
        'Consultoria mensal'
      ]
    }
  ]
};

import { formatters } from '@/lib/utils/unifiedFormatters';

// Formatter para moeda brasileira
export const formatCurrency = formatters.currency;