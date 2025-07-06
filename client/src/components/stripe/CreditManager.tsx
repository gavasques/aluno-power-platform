import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity,
  CreditCard,
  Gift,
  Loader2,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  stripePriceId: string;
}

interface CreditTransaction {
  id: number;
  type: 'purchase' | 'usage' | 'bonus' | 'subscription';
  amount: number;
  description: string;
  createdAt: string;
  feature?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits-500',
    name: 'Pacote Starter',
    credits: 500,
    price: 29.90,
    stripePriceId: 'price_credits_500'
  },
  {
    id: 'credits-1000',
    name: 'Pacote Básico',
    credits: 1000,
    price: 49.90,
    bonus: 100,
    stripePriceId: 'price_credits_1000'
  },
  {
    id: 'credits-2500',
    name: 'Pacote Avançado',
    credits: 2500,
    price: 99.90,
    bonus: 500,
    popular: true,
    stripePriceId: 'price_credits_2500'
  },
  {
    id: 'credits-5000',
    name: 'Pacote Profissional',
    credits: 5000,
    price: 179.90,
    bonus: 1500,
    stripePriceId: 'price_credits_5000'
  }
];

export default function CreditManager() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: creditBalance } = useQuery({
    queryKey: ['/api/stripe/credit-balance'],
    enabled: true
  });

  const { data: creditTransactions } = useQuery({
    queryKey: ['/api/stripe/credit-transactions'],
    enabled: true
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    enabled: true
  });

  const handleCreditPurchase = async (creditPackage: CreditPackage) => {
    setIsLoading(creditPackage.id);
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          priceId: creditPackage.stripePriceId,
          planId: 'credits',
          successUrl: `${window.location.origin}/minha-area/assinaturas?tab=credits&success=true`,
          cancelUrl: `${window.location.origin}/minha-area/assinaturas?tab=credits&canceled=true`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirecionar para o Stripe Checkout
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Erro no checkout de créditos:', error);
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra de créditos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <Plus className="h-4 w-4 text-green-600" />;
      case 'usage': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'bonus': return <Gift className="h-4 w-4 text-purple-600" />;
      case 'subscription': return <Calendar className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentBalance = creditBalance?.currentBalance || 0;
  const monthlyLimit = subscriptionStatus?.credits?.monthly || 0;
  const usagePercentage = monthlyLimit > 0 ? ((monthlyLimit - currentBalance) / monthlyLimit) * 100 : 0;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="purchase">Comprar Créditos</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">créditos disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Mensais</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyLimit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">da sua assinatura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creditBalance?.totalSpent || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">créditos utilizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Adquirido</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creditBalance?.totalEarned || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">créditos obtidos</p>
            </CardContent>
          </Card>
        </div>

        {monthlyLimit > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uso Mensal</CardTitle>
              <CardDescription>
                Você usou {((monthlyLimit - currentBalance) / monthlyLimit * 100).toFixed(1)}% dos seus créditos mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{(monthlyLimit - currentBalance).toLocaleString()} utilizados</span>
                <span>{currentBalance.toLocaleString()} restantes</span>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="purchase" className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprar Créditos Avulsos</h3>
          <p className="text-gray-600">Adquira créditos extras para usar quando precisar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <Coins className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>
                  {pkg.credits.toLocaleString()} créditos
                  {pkg.bonus && (
                    <span className="text-green-600 font-semibold">
                      {' '}+ {pkg.bonus.toLocaleString()} bônus
                    </span>
                  )}
                </CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold">R$ {pkg.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  {pkg.bonus && (
                    <Badge variant="secondary" className="mb-2">
                      Total: {(pkg.credits + pkg.bonus).toLocaleString()} créditos
                    </Badge>
                  )}
                  <p>R$ {(pkg.price / (pkg.credits + (pkg.bonus || 0)) * 1000).toFixed(2).replace('.', ',')} por 1000 créditos</p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleCreditPurchase(pkg)}
                  disabled={isLoading === pkg.id}
                >
                  {isLoading === pkg.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Comprar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Acompanhe todas as movimentações dos seus créditos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {creditTransactions && creditTransactions.length > 0 ? (
              <div className="space-y-4">
                {creditTransactions.map((transaction: CreditTransaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                          {transaction.feature && ` • ${transaction.feature}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">créditos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma transação encontrada</p>
                <p className="text-sm text-gray-400">Suas movimentações de créditos aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}