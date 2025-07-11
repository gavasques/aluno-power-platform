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
  AlertTriangle,
  Play,
  Rss,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { News, Update } from '@shared/schema';

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

  // Simplificar carregamento - apenas dados essenciais
  const { data: userSummary, isLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: youtubeVideos, isLoading: videosLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    enabled: true,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  // Fetch published news preview (lightweight)
  const { data: newsData = [], isLoading: newsLoading } = useQuery<Partial<News>[]>({
    queryKey: ['/api/news/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/news/published/preview');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
  });

  // Fetch published updates preview (lightweight)
  const { data: updatesData = [], isLoading: updatesLoading } = useQuery<Partial<Update>[]>({
    queryKey: ['/api/updates/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/updates/published/preview');
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
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

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
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

  // Dados simplificados do sistema
  const currentUser = userSummary?.user || {};
  const creditBalance = userSummary?.credits?.current || 0;
  const creditsUsedThisMonth = userSummary?.credits?.usageThisMonth || 0;
  
  const subscription = userSummary?.subscription || {};
  const planName = subscription?.planName || userSummary?.user?.plan || 'Gratuito';
  const planStatus = subscription?.status || 'active';
  const nextBilling = subscription?.nextBilling || 'N/A';
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

              {/* News and Updates Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* News Card */}
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Rss className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Central de Notícias</CardTitle>
                        <p className="text-blue-100 text-xs mt-1">
                          Últimas notícias do e-commerce
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {newsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : newsData && newsData.length > 0 ? (
                      <div className="space-y-4">
                        {newsData.slice(0, 3).map((news, index) => (
                          <div 
                            key={news.id || index} 
                            className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                            onClick={() => window.location.href = '/noticias'}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm leading-5 mb-1">
                                  {news.title}
                                </h4>
                                {news.summary && (
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {news.summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="px-2 py-0.5 text-xs">
                                    {news.category || 'Geral'}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatCreatedDate(news.createdAt || '')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Rss className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Nenhuma notícia disponível</p>
                        <p className="text-xs">As últimas notícias aparecerão aqui</p>
                      </div>
                    )}
                    
                    {newsData && newsData.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.location.href = '/noticias'}
                        >
                          Ver Todas as Notícias
                          <ArrowUpRight className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Updates Card */}
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Central de Novidades</CardTitle>
                        <p className="text-emerald-100 text-xs mt-1">
                          Novidades da plataforma
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {updatesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : updatesData && updatesData.length > 0 ? (
                      <div className="space-y-4">
                        {updatesData.slice(0, 3).map((update, index) => (
                          <div 
                            key={update.id || index} 
                            className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                            onClick={() => window.location.href = '/novidades'}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm leading-5 mb-1">
                                  {update.title}
                                </h4>
                                {update.content && (
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {update.content.substring(0, 100)}...
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="px-2 py-0.5 text-xs">
                                    v{update.version || '1.0'}
                                  </Badge>
                                  <Badge 
                                    variant={update.priority === 'high' ? 'destructive' : 
                                           update.priority === 'medium' ? 'default' : 'secondary'} 
                                    className="px-2 py-0.5 text-xs"
                                  >
                                    {update.type || 'Feature'}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatCreatedDate(update.createdAt || '')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Nenhuma novidade disponível</p>
                        <p className="text-xs">As últimas atualizações aparecerão aqui</p>
                      </div>
                    )}
                    
                    {updatesData && updatesData.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.location.href = '/novidades'}
                        >
                          Ver Todas as Novidades
                          <ArrowUpRight className="h-3 w-3 ml-2" />
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