import { useState, useEffect } from 'react';
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
  X
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
        case 'videos':
          window.location.href = '/videos';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="w-full px-2 py-6 space-y-6">
        
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Olá, {currentUser.name || 'Usuário'}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Bem-vindo ao seu painel de controle
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm text-blue-100">Créditos Disponíveis</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {creditBalance.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5 text-purple-300" />
                  <span className="text-sm text-blue-100">Plano Atual</span>
                </div>
                <div className="text-xl font-bold text-white capitalize">
                  {planName}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={() => handleQuickAction('agents')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Usar Agentes IA
            </Button>
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={() => handleQuickAction('products')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Meus Produtos
            </Button>
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={() => handleQuickAction('buy-credits')}
            >
              <Coins className="h-4 w-4 mr-2" />
              Comprar Créditos
            </Button>
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={() => handleQuickAction('upgrade')}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Melhorar Plano
            </Button>
          </div>
        </div>

        {/* Promotional Banners */}
        <PromotionalBanners />

        {/* Modern Full-Width Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* YouTube Videos Preview - Simplified */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">
                        Últimos Vídeos
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Conteúdo sobre Amazon FBA e e-commerce
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => handleQuickAction('videos')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => window.open('https://youtube.com/@guilhermeavasques', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Canal
                    </Button>
                    {userSummary?.user?.role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          logger.debug('🔄 Invalidating cache and refreshing videos...');
                          // Invalidar cache primeiro
                          await queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
                          // Depois refetch
                          await refetchVideos();
                          logger.debug('✅ Videos refreshed!');
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        🔄 Atualizar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 rounded-xl h-32 mb-3"></div>
                        <div className="bg-gray-700 h-3 rounded mb-2"></div>
                        <div className="bg-gray-700 h-2 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : youtubeVideos && youtubeVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {youtubeVideos
                      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                      .slice(0, 3).map((video) => (
                      <div 
                        key={video.id} 
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        <div className="relative bg-gray-700 rounded-xl overflow-hidden mb-3 aspect-video">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                              <Play className="h-6 w-6 text-white ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {formatViewCount(video.viewCount)}
                          </div>
                          <span>{formatPublishedDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Youtube className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhum vídeo disponível</h3>
                    <p className="text-gray-500">Os últimos vídeos do YouTube aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* News Section - Blue Modern Container */}
          <div>
            <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl border-0 text-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Rss className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Central de Notícias
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Últimas novidades e anúncios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {newsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white/20 h-4 rounded mb-2"></div>
                        <div className="bg-white/20 h-3 rounded w-3/4 mb-2"></div>
                        <div className="bg-white/20 h-3 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : newsData && newsData.length > 0 ? (
                  <div className="space-y-4">
                    {newsData.slice(0, 5).map((news) => (
                      <div 
                        key={news.id} 
                        className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => openNewsModal(news)}
                      >
                        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-blue-100 text-sm mb-3 line-clamp-2">
                          {news.summary || news.content?.substring(0, 120) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 px-2 py-1 rounded-full text-blue-100">
                              {news.category || 'Geral'}
                            </div>
                            {news.featured && (
                              <div className="bg-yellow-400/20 px-2 py-1 rounded-full text-yellow-200 border border-yellow-400/30">
                                Destaque
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-blue-200">
                            <Clock className="h-4 w-4" />
                            {formatCreatedDate(news.createdAt || '')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="secondary" 
                      className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                      onClick={() => window.location.href = '/noticias'}
                    >
                      Ver Todas as Notícias
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rss className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhuma notícia disponível</h3>
                    <p className="text-blue-200">As últimas notícias aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Updates Section - Green Modern Container */}
          <div>
            <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl shadow-2xl border-0 text-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Central de Novidades
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      Atualizações do sistema e novas funcionalidades
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {updatesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white/20 h-4 rounded mb-2"></div>
                        <div className="bg-white/20 h-3 rounded w-3/4 mb-2"></div>
                        <div className="bg-white/20 h-3 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : updatesData && updatesData.length > 0 ? (
                  <div className="space-y-4">
                    {updatesData.slice(0, 5).map((update) => (
                      <div 
                        key={update.id} 
                        className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => openUpdateModal(update)}
                      >
                        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                          {update.title}
                        </h3>
                        <p className="text-emerald-100 text-sm mb-3 line-clamp-2">
                          {update.summary || update.content?.substring(0, 120) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 px-2 py-1 rounded-full text-emerald-100">
                              {update.version || 'v1.0'}
                            </div>
                            <div className="bg-white/20 px-2 py-1 rounded-full text-emerald-100">
                              {update.type || 'Feature'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatCreatedDate(update.createdAt || '')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="secondary" 
                      className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                      onClick={() => window.location.href = '/novidades'}
                    >
                      Ver Todas as Novidades
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhuma novidade disponível</h3>
                    <p className="text-emerald-200">As últimas atualizações aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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