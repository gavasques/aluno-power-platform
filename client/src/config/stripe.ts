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
  ],

  // Pacotes de Créditos Avulsos
  creditPackages: [
    {
      id: 'credits-100',
      name: '100 Créditos',
      description: 'Pacote básico de créditos',
      price: 19.90,
      priceId: 'price_1RhzYxJX2OwQ92jAEmsBYGxp',
      credits: 100
    },
    {
      id: 'credits-300',
      name: '300 Créditos',
      description: 'Pacote popular de créditos',
      price: 49.90,
      priceId: 'price_1RhzYyJX2OwQ92jAUtCdkBRM',
      credits: 300,
      bonus: 30 // 10% de bônus
    },
    {
      id: 'credits-700',
      name: '700 Créditos',
      description: 'Pacote avançado de créditos',
      price: 99.90,
      priceId: 'price_1RhzYyJX2OwQ92jAmMux0Kic',
      credits: 700,
      bonus: 100 // ~14% de bônus
    },
    {
      id: 'credits-1500',
      name: '1500 Créditos',
      description: 'Pacote premium de créditos',
      price: 199.00,
      priceId: 'price_1RhzYyJX2OwQ92jAhn5aUMPj',
      credits: 1500,
      bonus: 300 // 20% de bônus
    }
  ]
};

// Formatter para moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};