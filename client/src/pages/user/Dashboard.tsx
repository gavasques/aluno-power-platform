import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Coins, 
  TrendingUp, 
  CreditCard, 
  Zap,
  Calendar,
  ArrowUpRight,
  Target,
  Gift,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  user: {
    name: string;
    plan: {
      name: string;
      level: 'basic' | 'premium' | 'master';
      credits: number;
      nextBilling: string;
      status: 'active' | 'pending' | 'cancelled';
    };
    creditBalance: number;
    totalSpent: number;
    savings: number;
  };
  usage: {
    thisMonth: number;
    lastMonth: number;
    topFeatures: Array<{name: string; usage: number; percentage: number}>;
    projection: number;
    dailyUsage: Array<{date: string; usage: number}>;
  };
  activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    cost: number;
    status: 'completed' | 'processing' | 'failed';
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    type: 'feature' | 'upgrade' | 'tip' | 'tutorial';
    priority: 'high' | 'medium' | 'low';
    actionText: string;
    actionUrl: string;
  }>;
  stats: {
    totalGenerations: number;
    averageSessionTime: number;
    featuresUsed: number;
    successRate: number;
  };
}

const UserDashboard = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/test/dashboard'],
    enabled: true
  });

  const handleQuickAction = async (action: string) => {
    try {
      // Implementar ações rápidas
      switch (action) {
        case 'buy-credits':
          window.location.href = '/minha-area/assinaturas?tab=plans';
          break;
        case 'upgrade':
          window.location.href = '/minha-area/assinaturas?tab=plans';
          break;
        case 'manage-subscription':
          window.location.href = '/minha-area/assinaturas';
          break;
        default:
          toast({
            title: "Ação não implementada",
            description: "Esta funcionalidade será implementada em breve.",
          });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível executar a ação.",
        variant: "destructive"
      });
    }
  };

  const getPlanColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'master': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (level: string) => {
    switch (level) {
      case 'basic': return <Zap className="h-4 w-4" />;
      case 'premium': return <Star className="h-4 w-4" />;
      case 'master': return <Crown className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Erro ao carregar
              </CardTitle>
              <CardDescription>
                Não foi possível carregar os dados do dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="w-full">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {dashboardData.user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Aqui está um resumo da sua conta e atividades recentes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Badge className={`${getPlanColor(dashboardData.user.plan.level)} flex items-center gap-1`}>
                {getPlanIcon(dashboardData.user.plan.level)}
                {dashboardData.user.plan.name}
              </Badge>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.user.creditBalance.toLocaleString()} créditos
                </div>
                <div className="text-sm text-gray-500">
                  Próxima cobrança: {dashboardData.user.plan.nextBilling}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Créditos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
              <Coins className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.user.creditBalance.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {dashboardData.usage.thisMonth} usados este mês
                </p>
                <Button size="sm" onClick={() => handleQuickAction('buy-credits')}>
                  Comprar
                </Button>
              </div>
              <Progress 
                value={(dashboardData.usage.thisMonth / dashboardData.user.plan.credits) * 100} 
                className="mt-3"
              />
            </CardContent>
          </Card>

          {/* Assinatura */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinatura</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.user.plan.name}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Status: {dashboardData.user.plan.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
                <Button size="sm" onClick={() => handleQuickAction('manage-subscription')}>
                  Gerenciar
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-gray-500">
                  {dashboardData.user.plan.credits.toLocaleString()} créditos/mês
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Uso Mensal */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso Mensal</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.usage.thisMonth.toLocaleString()}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <p className="text-xs text-gray-500">
                  {dashboardData.usage.thisMonth > dashboardData.usage.lastMonth ? '+' : ''}
                  {((dashboardData.usage.thisMonth - dashboardData.usage.lastMonth) / dashboardData.usage.lastMonth * 100).toFixed(1)}% vs mês anterior
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Projeção: {dashboardData.usage.projection.toLocaleString()} créditos
              </div>
            </CardContent>
          </Card>

          {/* Economia */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia</CardTitle>
              <Gift className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {dashboardData.user.savings.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Economia vs compra avulsa
              </p>
              <div className="mt-3 flex items-center gap-1">
                <Target className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-gray-500">
                  Total investido: R$ {dashboardData.user.totalSpent.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

              {/* Ações Rápidas */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                      Acesso direto às funcionalidades principais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleQuickAction('buy-credits')}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Comprar Créditos
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleQuickAction('upgrade')}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/agents'}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Usar Agentes IA
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/minha-area/produtos'}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Meus Produtos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>




        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;