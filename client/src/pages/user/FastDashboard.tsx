import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Coins, 
  CreditCard, 
  Zap,
  Calendar,
  ArrowUpRight,
  Star,
  Youtube,
  ExternalLink,
  Play,
  ShoppingBag,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const FastDashboard = () => {
  const { user } = useAuth();
  
  // Apenas vídeos do YouTube com cache otimizado
  const { data: youtubeVideos = [], isLoading: videosLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    enabled: true,
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });

  const recentVideos = youtubeVideos.slice(0, 6);

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium': return <Star className="h-3 w-3" />;
      case 'master': return <Crown className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Simplificado */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {user?.name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo à sua área pessoal
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Gratuito
              </Badge>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  0 créditos
                </div>
                <div className="text-sm text-gray-500">
                  Plano gratuito ativo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/assinatura'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Créditos
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/assinatura'}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/agentes'}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Agentes IA
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/minha-area'}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Produtos
                </Button>
              </CardContent>
            </Card>

            {/* Créditos Disponíveis */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    Créditos Disponíveis
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">Gratuito</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <p className="text-sm text-gray-600">
                    Sem créditos disponíveis
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = '/assinatura'}
                  >
                    Comprar Créditos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Últimos Vídeos do Canal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Últimos Vídeos do Canal
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/videos'}
                  >
                    Ver Todos os Vídeos do Canal
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <CardDescription>
                  Conteúdo mais recente para impulsionar suas vendas na Amazon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg aspect-video mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : recentVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentVideos.map((video) => (
                      <div
                        key={video.id}
                        className="group cursor-pointer"
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-100">
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
                    <Youtube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-700 text-lg">Nenhum vídeo encontrado</p>
                    <p className="text-gray-500 text-sm">Os vídeos do YouTube serão sincronizados automaticamente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FastDashboard;