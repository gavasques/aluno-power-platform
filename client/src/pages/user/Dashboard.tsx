import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Coins, 
  CreditCard, 
  Zap,
  Calendar,
  ArrowUpRight,
  Star,
  CheckCircle,
  Youtube,
  ExternalLink,
  AlertTriangle
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

interface YouTubeVideo {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Buscar dados reais do usuário
  const { data: userSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    enabled: true
  });

  const { data: creditData, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/dashboard/credits'],
    enabled: true
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/dashboard/subscription'],
    enabled: true
  });

  const isLoading = summaryLoading || creditsLoading || subscriptionLoading;

  const { data: youtubeVideos, isLoading: videosLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    enabled: true
  });

  const handleQuickAction = async (action: string) => {
    try {
      // Implementar ações rápidas
      switch (action) {
        case 'buy-credits':
          window.location.href = '/assinatura';
          break;
        case 'upgrade':
          window.location.href = '/assinatura';
          break;
        case 'manage-subscription':
          window.location.href = '/assinatura';
          break;
        case 'agents':
          window.location.href = '/agentes';
          break;
        case 'products':
          window.location.href = '/minha-area/produtos';
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

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? 's' : ''} atrás`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} mês${Math.ceil(diffDays / 30) > 1 ? 'es' : ''} atrás`;
    return `${Math.ceil(diffDays / 365)} ano${Math.ceil(diffDays / 365) > 1 ? 's' : ''} atrás`;
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

  if (!userSummary) {
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

  // Extrair dados reais do sistema
  const currentUser = userSummary?.user || {};
  const creditBalance = creditData?.balance || userSummary?.credits?.current || 0;
  const creditsUsedThisMonth = creditData?.recentTransactions?.reduce((total: number, tx: any) => 
    tx.amount < 0 ? total + Math.abs(tx.amount) : total, 0
  ) || userSummary?.credits?.usageThisMonth || 0;
  
  const subscription = subscriptionData || userSummary?.subscription || {};
  const planName = subscription?.planName || userSummary?.user?.plan || 'Sem Plano';
  const planStatus = subscription?.status || 'cancelled';
  const nextBilling = subscription?.nextBilling || subscription?.nextBillingDate || 'N/A';
  const planCredits = subscription?.planCredits || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {currentUser.name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Aqui está um resumo da sua conta e atividades recentes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Badge className={`${getPlanColor('basic')} flex items-center gap-1`}>
                {getPlanIcon('basic')}
                {planName}
              </Badge>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {creditBalance.toLocaleString()} créditos
                </div>
                <div className="text-sm text-gray-500">
                  Próxima cobrança: {nextBilling}
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Coluna da Esquerda - Ações Rápidas + Status Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Ações Rápidas */}
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('buy-credits')}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Créditos
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('upgrade')}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('agents')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Agentes IA
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('products')}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Produtos
                    </Button>
                  </CardContent>
                </Card>

                {/* Créditos Disponíveis */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
                    <Coins className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {creditBalance.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {creditsUsedThisMonth} usados
                      </p>
                      <Button size="sm" onClick={() => handleQuickAction('buy-credits')}>
                        Comprar
                      </Button>
                    </div>
                    <Progress 
                      value={planCredits > 0 ? (creditsUsedThisMonth / planCredits) * 100 : 0} 
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
                      {planName}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Status: {planStatus === 'active' ? 'Ativo' : 'Inativo'}
                      </p>
                      <Button size="sm" onClick={() => handleQuickAction('manage-subscription')}>
                        Gerenciar
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-500">
                        {planCredits > 0 ? planCredits.toLocaleString() : '0'} créditos/mês
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Últimos Vídeos do YouTube - Destaque Principal */}
              <div className="lg:col-span-3">
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Youtube className="h-6 w-6 text-red-600" />
                      Últimos Vídeos do Canal
                    </CardTitle>
                    <CardDescription className="text-base">
                      Conteúdo mais recente para impulsionar suas vendas na Amazon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {videosLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : youtubeVideos && youtubeVideos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {youtubeVideos.slice(0, 6).map((video) => (
                          <div 
                            key={video.id} 
                            className="group cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200"
                            onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                          >
                            <div className="relative overflow-hidden rounded-t-lg">
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <div className="bg-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {video.duration || ''}
                              </div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 leading-5 mb-2 group-hover:text-red-600 transition-colors text-sm">
                                {video.title}
                              </h4>
                              <div className="flex items-center justify-end text-xs text-gray-500">
                                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-red-500" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Youtube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum vídeo encontrado</p>
                        <p className="text-sm">Os vídeos mais recentes aparecerão aqui</p>
                      </div>
                    )}
                    
                    {youtubeVideos && youtubeVideos.length > 6 && (
                      <div className="mt-6 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = '/videos'}
                        >
                          Ver Todos os Vídeos do Canal
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
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