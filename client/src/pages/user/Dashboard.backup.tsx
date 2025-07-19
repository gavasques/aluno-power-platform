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
  AlertTriangle,
  Rss,
  Users,
  Clock,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  Instagram,
  MessageCircle,
  MessageSquare,
  Bot,
  Archive
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
      <div className="container-responsive py-4">
        
        {/* Header Section - Boas-vindas e Estatísticas Principais */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Olá, {currentUser.name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600">
                Aqui está um resumo das suas atividades e novidades da plataforma
              </p>
            </div>
            
            {/* Quick Stats Cards - Minimalista */}
            <div className="mt-4 lg:mt-0 flex gap-4">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Coins className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Créditos</p>
                      <p className="text-xl font-semibold text-gray-900">{creditBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <div className="text-blue-600">
                        {getPlanIcon(planName)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Plano</p>
                      <p className="text-lg font-semibold text-gray-900">{planName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Links Sociais e Comunidade - Minimalista */}
        <div className="mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Conecte-se Conosco
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Siga nossas redes sociais e participe da nossa comunidade
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start bg-pink-50 hover:bg-pink-100 text-gray-700 border-pink-200 hover:border-pink-300 h-12"
                  onClick={() => window.open('https://instagram.com/guivasques_', '_blank')}
                >
                  <Instagram className="h-4 w-4 mr-3 text-pink-500" />
                  <div className="text-left">
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-gray-500">Dicas diárias</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start bg-green-50 hover:bg-green-100 text-gray-700 border-green-200 hover:border-green-300 h-12"
                  onClick={() => window.open('https://wa.me/5545999858475', '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-xs text-gray-500">Contato direto</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start bg-blue-50 hover:bg-blue-100 text-gray-700 border-blue-200 hover:border-blue-300 h-12"
                  onClick={() => window.open('https://discord.gg/guilhermevasques', '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Discord</p>
                    <p className="text-xs text-gray-500">Comunidade oficial</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start bg-purple-50 hover:bg-purple-100 text-gray-700 border-purple-200 hover:border-purple-300 h-12"
                  onClick={() => window.open('https://portal.guilhermevasques.club', '_blank')}
                >
                  <Star className="h-4 w-4 mr-3 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Portal do Curso</p>
                    <p className="text-xs text-gray-500">Acesso exclusivo</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Promoções - Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Venda Moda na Amazon */}
          <Card className="bg-purple-50 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-purple-900 mb-2">Venda Moda na Amazon</h3>
                  <p className="text-purple-700 text-sm leading-relaxed">0% de Comissão para novas contas</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md"
                  onClick={() => window.open('https://venda.amazon.com.br/?ld=elbrsoa_atesliberdade_virtualsoftsrp2025na', '_blank')}
                >
                  Cadastre-se →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Venda na Amazon */}
          <Card className="bg-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-blue-900 mb-2">Venda na Amazon</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">Tenha nossos benefícios exclusivos</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
                  onClick={() => window.open('https://amzn.to/3RTu5Sk', '_blank')}
                >
                  Cadastre-se →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Helium 10 */}
          <Card className="bg-orange-50 border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-orange-900 mb-2">Helium 10</h3>
                  <p className="text-orange-700 text-sm leading-relaxed">Software para encontrar produtos</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1 rounded text-xs"
                  onClick={() => window.open('https://helium10.com/go/guilherme74', '_blank')}
                >
                  Anual
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 font-medium px-3 py-1 rounded text-xs"
                  onClick={() => window.open('https://helium10.com/go/guilherme20', '_blank')}
                >
                  Mensal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid - Notícias e Novidades */}
        <div className="layout-grid-3 gap-6">
          {/* Notícias e Novidades - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-3">
            
            {/* Notícias - Minimalista */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Rss className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Notícias
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Últimas atualizações da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-6">
                {newsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : newsData && newsData.length > 0 ? (
                  <div className="space-y-3">
                    {newsData.slice(0, 3).map((news) => (
                      <div 
                        key={news.id} 
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => openNewsModal(news)}
                      >
                        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {news.summary || news.content?.substring(0, 100) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                              {news.category || 'Geral'}
                            </Badge>
                            {(news as any).featured && (
                              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatCreatedDate(String(news.createdAt || ''))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => window.location.href = '/noticias'}
                    >
                      Ver Todas as Notícias
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Rss className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhuma notícia</h3>
                    <p className="text-gray-500 text-xs">As últimas notícias aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Novidades - Minimalista */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Novidades
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Recursos e melhorias recentes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-6">
                {updatesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : updatesData && updatesData.length > 0 ? (
                  <div className="space-y-3">
                    {updatesData.slice(0, 3).map((update) => (
                      <div 
                        key={update.id} 
                        className="bg-green-50 rounded-lg p-4 border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                        onClick={() => openUpdateModal(update)}
                      >
                        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                          {update.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {update.summary || update.content?.substring(0, 100) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 text-xs">
                              {update.version || 'v1.0'}
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 text-xs">
                              {update.type || 'Feature'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatCreatedDate(String(update.createdAt || ''))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => window.location.href = '/novidades'}
                    >
                      Ver Todas as Novidades
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhuma novidade</h3>
                    <p className="text-gray-500 text-xs">As últimas atualizações aparecerão aqui</p>
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