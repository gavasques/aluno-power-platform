import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Coins, 
  CreditCard, 
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  Star,
  CheckCircle,
  Youtube,
  ExternalLink,
  AlertTriangle,
  Play,
  Rss,
  Users,
  Clock,
  Eye,
  X,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { News, Update } from '@shared/schema';
import { PromotionalBanners } from '@/components/banners/PromotionalBanners';
import { logger } from '@/utils/logger';

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
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Estados para modais
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Função para buscar dados completos de uma notícia
  const fetchFullNews = async (newsId: number) => {
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.error('Erro ao buscar notícia completa:', error);
    }
    return null;
  };

  // Função para buscar dados completos de uma novidade
  const fetchFullUpdate = async (updateId: number) => {
    try {
      const response = await fetch(`/api/updates/${updateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.error('Erro ao buscar novidade completa:', error);
    }
    return null;
  };

  // Função para abrir modal de notícia
  const openNewsModal = async (news: any) => {
    const fullNews = await fetchFullNews(news.id);
    if (fullNews) {
      setSelectedNews(fullNews);
      setNewsModalOpen(true);
    }
  };

  // Função para abrir modal de novidade
  const openUpdateModal = async (update: any) => {
    const fullUpdate = await fetchFullUpdate(update.id);
    if (fullUpdate) {
      setSelectedUpdate(fullUpdate);
      setUpdateModalOpen(true);
    }
  };

  // Simplificar carregamento - apenas dados essenciais
  const { data: userSummary, isLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Log para debug
  const { data: youtubeVideos, isLoading: videosLoading, refetch: refetchVideos } = useQuery<YouTubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache normal
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false, // Sem refetch automático
    refetchOnMount: false, // Cache normal
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
      switch (action) {
        case 'agents':
          window.location.href = '/agents';
          break;
        case 'products':
          window.location.href = '/myarea/products';
          break;
        case 'buy-credits':
          window.location.href = '/subscription';
          break;
        case 'upgrade':
          window.location.href = '/subscription';
          break;
        case 'videos':
          window.location.href = '/videos';
          break;
        default:
          console.log('Ação não implementada:', action);
      }
    } catch (error) {
      logger.error('Erro ao executar ação rápida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar esta ação.",
        variant: "destructive",
      });
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  };

  const formatCreatedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  };

  const getPlanColor = (level: string) => {
    switch (level) {
      case 'master': return 'text-purple-600';
      case 'premium': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPlanIcon = (level: string) => {
    switch (level) {
      case 'master': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'premium': return <Star className="h-4 w-4 text-blue-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div className="container mx-auto px-4 py-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
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
  const currentUser = (userSummary as any)?.user || {};
  const creditBalance = (userSummary as any)?.credits?.current || 0;
  const creditsUsedThisMonth = (userSummary as any)?.credits?.usageThisMonth || 0;
  
  const subscription = (userSummary as any)?.subscription || {};
  const planName = subscription?.planName || (userSummary as any)?.user?.plan || 'Gratuito';
  const planStatus = subscription?.status || 'active';
  const nextBilling = subscription?.nextBilling || 'N/A';
  const planCredits = subscription?.planCredits || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="w-full px-2 py-3 space-y-3">
        
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg p-3 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Crown className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">
                    Olá, {currentUser.name || 'Usuário'}!
                  </h1>
                  <p className="text-blue-100 text-xs">
                    Bem-vindo ao seu painel de controle
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-yellow-300" />
                  <span className="text-xs text-blue-100">Créditos</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {creditBalance.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20">
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-purple-300" />
                  <span className="text-xs text-blue-100">Plano</span>
                </div>
                <div className="text-xs font-bold text-white capitalize">
                  {planName}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-4 gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs h-6"
              onClick={() => handleQuickAction('agents')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Agentes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs h-6"
              onClick={() => handleQuickAction('products')}
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Produtos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs h-6"
              onClick={() => handleQuickAction('buy-credits')}
            >
              <Coins className="h-3 w-3 mr-1" />
              Comprar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs h-6"
              onClick={() => handleQuickAction('upgrade')}
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Promotional Banners */}
        <PromotionalBanners />

        {/* Layout Principal - Grid 3x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Coluna 1: Vídeos do YouTube (Expandido) */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-md border-0 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
                      <Youtube className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white">
                        Últimos Vídeos
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-xs">
                        Conteúdo sobre Amazon FBA e e-commerce
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs h-6"
                      onClick={() => handleQuickAction('videos')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Ver Todos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs h-6"
                      onClick={() => window.open('https://youtube.com/@guilhermeavasques', '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Canal
                    </Button>
                    {(userSummary as any)?.user?.role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          logger.debug('🔄 Invalidating cache and refreshing videos...');
                          await queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
                          await refetchVideos();
                          logger.debug('✅ Videos refreshed!');
                        }}
                        className="text-gray-400 hover:text-white text-xs h-6"
                      >
                        🔄
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 rounded-md h-16 mb-1"></div>
                        <div className="bg-gray-700 h-2 rounded mb-1"></div>
                        <div className="bg-gray-700 h-2 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : youtubeVideos && youtubeVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {youtubeVideos
                      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                      .slice(0, 8).map((video) => (
                      <div 
                        key={video.id} 
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        <div className="relative bg-gray-700 rounded-md overflow-hidden mb-1 aspect-video">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <Play className="h-3 w-3 text-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <h3 className="text-white font-semibold text-xs mb-1 line-clamp-2 group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between text-gray-400 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-2 w-2" />
                            {formatViewCount(video.viewCount)}
                          </div>
                          <span>{formatPublishedDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Youtube className="h-4 w-4 text-gray-400" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-300 mb-1">Nenhum vídeo disponível</h3>
                    <p className="text-gray-500 text-xs">Os últimos vídeos do YouTube aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Sidebar com Notícias e Novidades */}
          <div className="space-y-3">
            {/* News Section - Compacto */}
            <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-lg shadow-md border-0 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center backdrop-blur-sm">
                    <Rss className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Notícias
                    </CardTitle>
                    <CardDescription className="text-blue-100 text-xs">
                      Últimas novidades
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {newsLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white/20 h-2 rounded mb-1"></div>
                        <div className="bg-white/20 h-2 rounded w-3/4 mb-1"></div>
                        <div className="bg-white/20 h-2 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : newsData && newsData.length > 0 ? (
                  <div className="space-y-2">
                    {newsData.slice(0, 4).map((news) => (
                      <div 
                        key={news.id} 
                        className="bg-white/10 rounded-md p-2 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => openNewsModal(news)}
                      >
                        <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-blue-100 text-xs mb-1 line-clamp-1">
                          {news.summary || news.content?.substring(0, 60) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div className="bg-white/20 px-1 py-0.5 rounded-full text-blue-100 text-xs">
                              {news.category || 'Geral'}
                            </div>
                            {(news as any).featured && (
                              <div className="bg-yellow-400/20 px-1 py-0.5 rounded-full text-yellow-200 border border-yellow-400/30 text-xs">
                                Destaque
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-blue-200 text-xs">
                            <Clock className="h-2 w-2" />
                            {formatCreatedDate(String(news.createdAt || ''))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-6"
                      onClick={() => window.location.href = '/noticias'}
                    >
                      Ver Todas
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Rss className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-xs font-semibold text-white mb-1">Nenhuma notícia</h3>
                    <p className="text-blue-200 text-xs">As últimas notícias aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Updates Section - Compacto */}
            <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-lg shadow-md border-0 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Novidades
                    </CardTitle>
                    <CardDescription className="text-emerald-100 text-xs">
                      Atualizações do sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {updatesLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white/20 h-2 rounded mb-1"></div>
                        <div className="bg-white/20 h-2 rounded w-3/4 mb-1"></div>
                        <div className="bg-white/20 h-2 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : updatesData && updatesData.length > 0 ? (
                  <div className="space-y-2">
                    {updatesData.slice(0, 4).map((update) => (
                      <div 
                        key={update.id} 
                        className="bg-white/10 rounded-md p-2 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => openUpdateModal(update)}
                      >
                        <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2">
                          {update.title}
                        </h3>
                        <p className="text-emerald-100 text-xs mb-1 line-clamp-1">
                          {update.summary || update.content?.substring(0, 60) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div className="bg-white/20 px-1 py-0.5 rounded-full text-emerald-100 text-xs">
                              {update.version || 'v1.0'}
                            </div>
                            <div className="bg-white/20 px-1 py-0.5 rounded-full text-emerald-100 text-xs">
                              {update.type || 'Feature'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-2 w-2" />
                            {formatCreatedDate(String(update.createdAt || ''))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-6"
                      onClick={() => window.location.href = '/novidades'}
                    >
                      Ver Todas
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-xs font-semibold text-white mb-1">Nenhuma novidade</h3>
                    <p className="text-emerald-200 text-xs">As últimas atualizações aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white rounded-lg shadow-sm border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Uso Este Mês</p>
                  <p className="text-sm font-bold">{creditsUsedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Próxima Cobrança</p>
                  <p className="text-sm font-bold">{nextBilling}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Créditos do Plano</p>
                  <p className="text-sm font-bold">{planCredits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <Star className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-bold capitalize">{planStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para Notícias */}
      <Dialog open={newsModalOpen} onOpenChange={setNewsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 mb-2 pr-4">
                      {selectedNews.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedNews.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {selectedNews.category}
                        </Badge>
                      )}
                      {selectedNews.isFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Destaque
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatCreatedDate(selectedNews.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedNews.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                {selectedNews.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{selectedNews.summary}</p>
                  </div>
                )}
                
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedNews.content}
                </div>
              </div>

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Novidades */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedUpdate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 mb-2 pr-4">
                      {selectedUpdate.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedUpdate.version && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {selectedUpdate.version}
                        </Badge>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`${
                          selectedUpdate.type === 'feature' ? 'bg-blue-100 text-blue-800' :
                          selectedUpdate.type === 'bugfix' ? 'bg-red-100 text-red-800' :
                          selectedUpdate.type === 'improvement' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedUpdate.type || 'Feature'}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={`${
                          selectedUpdate.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedUpdate.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedUpdate.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedUpdate.priority || 'Normal'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatCreatedDate(selectedUpdate.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="prose max-w-none">
                {selectedUpdate.summary && (
                  <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{selectedUpdate.summary}</p>
                  </div>
                )}
                
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedUpdate.content}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;