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
  Play,
  Youtube,
  ExternalLink,
  Clock
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

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/test/dashboard'],
    enabled: true
  });

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

        {/* Status Cards - Only showing Credits and Subscription */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                      onClick={() => handleQuickAction('agents')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Usar Agentes IA
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleQuickAction('products')}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Meus Produtos
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Últimos Vídeos do YouTube */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-600" />
                      Últimos Vídeos
                    </CardTitle>
                    <CardDescription>
                      Os 6 vídeos mais recentes do canal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {videosLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-3 animate-pulse">
                            <div className="w-16 h-12 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : youtubeVideos && youtubeVideos.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {youtubeVideos.slice(0, 6).map((video) => (
                          <div 
                            key={video.id} 
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                            onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-20 h-14 rounded object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 hover:opacity-100 transition-opacity">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5">
                                {video.title}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatPublishedDate(video.publishedAt)}
                                  </span>
                                  <span>•</span>
                                  <span>{formatViewCount(video.viewCount)} visualizações</span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Youtube className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhum vídeo encontrado</p>
                      </div>
                    )}
                    
                    {youtubeVideos && youtubeVideos.length > 6 && (
                      <div className="mt-4 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.location.href = '/videos'}
                        >
                          Ver Todos os Vídeos
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