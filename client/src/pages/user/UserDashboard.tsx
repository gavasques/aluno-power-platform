import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Dashboard Components
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';

interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    plan: string;
    creditBalance: number;
  };
  credits: {
    current: number;
    totalEarned: number;
    totalSpent: number;
    usageThisMonth: number;
  };
  subscription: {
    planName: string;
    status: string;
    nextBilling: string | null;
    billingCycle: string;
  } | null;
  usage: {
    aiRequests: number;
    imageRequests: number;
    toolRequests: number;
    totalCost: number;
    totalTokens: number;
  };
  savings: {
    estimatedMonthly: number;
    currency: string;
  };
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Dashboard Summary Data
  const { data: dashboardData, isLoading: summaryLoading, error: summaryError } = useQuery<DashboardData>({
    queryKey: ['/api/user/dashboard/summary'],
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Credit Details
  const { data: creditData, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/user/dashboard/credits'],
    enabled: !!user,
  });

  // Subscription Details
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user/dashboard/subscription'],
    enabled: !!user,
  });

  // Activity Feed
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/user/dashboard/activity'],
    enabled: !!user,
  });

  // Recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/user/dashboard/recommendations'],
    enabled: !!user,
  });

  const handleQuickAction = async (action: string, data?: any) => {
    try {
      const response = await fetch('/api/user/dashboard/quick-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action, data }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: result.message,
        });

        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        throw new Error(result.error || 'Erro ao executar ação');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleSubscribe = () => {
    handleQuickAction('upgrade_plan');
  };

  const handleManageSubscription = () => {
    if (dashboardData?.subscription) {
      handleQuickAction('upgrade_plan');
    } else {
      handleQuickAction('upgrade_plan');
    }
  };

  const handleViewUsage = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Relatório detalhado de uso em breve!',
    });
  };

  const calculateSavings = () => {
    return dashboardData?.savings?.estimatedMonthly || 0;
  };

  const handleRecommendationInteraction = (recommendation: any, action: string) => {
    console.log('Recommendation interaction:', recommendation, action);
    // Track recommendation interactions for analytics
  };

  // Loading states
  if (summaryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (summaryError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h2 className="text-lg font-semibold mb-2">Erro ao carregar dashboard</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Não foi possível carregar os dados do dashboard.
              </p>
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {dashboardData?.user?.name || user?.name || 'Usuário'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Aqui está um resumo da sua atividade e status da conta.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                {dashboardData?.subscription?.planName || 'Sem Assinatura'}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status da Assinatura</p>
                <p className="text-lg font-semibold">
                  {dashboardData?.subscription?.status === 'active' ? 'Ativa' : 'Inativa'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SubscriptionStatus 
            subscription={dashboardData?.subscription}
            onManage={handleManageSubscription}
          />
          
          {/* Usage Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData?.usage?.aiRequests || 0) + 
                 (dashboardData?.usage?.imageRequests || 0) + 
                 (dashboardData?.usage?.toolRequests || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                solicitações de IA
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>IA Text:</span>
                  <span>{dashboardData?.usage?.aiRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>IA Imagens:</span>
                  <span>{dashboardData?.usage?.imageRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ferramentas:</span>
                  <span>{dashboardData?.usage?.toolRequests || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {calculateSavings().toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                economizados este mês
              </p>
              <p className="text-xs text-green-600 mt-2">
                vs. pagar por uso individual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credits and Activity */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed 
              activities={activityData?.logs || []}
              recentFeatures={activityData?.recentFeatures || []}
              onViewDetails={(id) => console.log('View details:', id)}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions onAction={handleQuickAction} />
            <RecommendationCard 
              recommendations={recommendationsData?.recommendations || []}
              onInteraction={handleRecommendationInteraction}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;