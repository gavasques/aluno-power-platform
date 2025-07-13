
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Package, Rss, Truck, Youtube, TrendingUp, Users, BookOpen, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import React, { memo } from "react";
import { useYoutube } from "@/contexts/YoutubeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/youtube/VideoCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { News, Update } from "@shared/schema";
import { SystemAnalytics } from "@/components/analytics/SystemAnalytics";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon: Icon, gradient, iconColor }) => (
  <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
      <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

const Dashboard = memo(() => {
  const { videos, loading, refetch } = useYoutube();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Debug: Log videos to console
  React.useEffect(() => {
    console.log('🎥 Dashboard videos loaded:', videos.length, 'videos');
    if (videos.length > 0) {
      console.log('🎥 First 3 videos:', videos.slice(0, 3).map(v => ({
        title: v.title,
        publishedAt: v.publishedAt,
        isActive: v.isActive
      })));
    }
  }, [videos]);

  // Force fresh fetch immediately to bypass cache issues
  React.useEffect(() => {
    console.log('🔄 Forcing fresh YouTube data fetch...');
    // Completely invalidate YouTube cache
    queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
    console.log('🗑️ Cache invalidated for YouTube videos');
    // Force fresh fetch after cache invalidation
    setTimeout(() => {
      refetch();
      console.log('🔄 Refetch triggered after cache invalidation');
    }, 500);
  }, [refetch, queryClient]);
  
  const recentVideos = React.useMemo(() => 
    videos
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6),
    [videos]
  );

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
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    gcTime: 10 * 60 * 1000,
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
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    gcTime: 10 * 60 * 1000,
  });

  const recentNews = newsData.slice(0, 3);
  const recentUpdates = updatesData.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="layout-full-width flex flex-col gap-8 py-6">


        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Fornecedores Cadastrados" 
            value="12" 
            icon={Truck} 
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-100"
          />
          <StatCard 
            title="Produtos Cadastrados" 
            value="45" 
            icon={Package} 
            gradient="from-blue-500 to-cyan-600"
            iconColor="text-blue-100"
          />
          <StatCard 
            title="Créditos de IA" 
            value="1.250" 
            icon={BrainCircuit} 
            gradient="from-purple-500 to-pink-600"
            iconColor="text-purple-100"
          />
          <StatCard 
            title="Cursos Ativos" 
            value="3" 
            icon={BookOpen} 
            gradient="from-orange-500 to-red-600"
            iconColor="text-orange-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* YouTube Feed Card */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Feed de Conteúdo</CardTitle>
                  <p className="text-red-100 text-sm mt-1">
                    Os 6 últimos vídeos do canal do YouTube
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentVideos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                  <div className="flex justify-center pt-4">
                    <Button asChild variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                      <Link to="/videos">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver todos os vídeos
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center mx-auto">
                    <Youtube className="h-10 w-10 text-red-500" />
                  </div>
                  <p className="text-gray-700 text-lg">Nenhum vídeo encontrado</p>
                  <p className="text-gray-500 text-sm">Os vídeos do YouTube serão sincronizados automaticamente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
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
                      Últimas notícias
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                {newsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentNews.length > 0 ? (
                  <div className="space-y-4">
                    {recentNews.map((news) => (
                      <div key={news.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                          {news.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">{news.category}</p>
                        {news.summary && (
                          <p className="text-xs text-gray-600 line-clamp-2">{news.summary}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {news.createdAt ? new Date(news.createdAt).toLocaleDateString('pt-BR') : ''}
                          </div>
                          {news.isFeatured && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-3">
                      <Button asChild variant="outline" size="sm" className="w-full border-blue-500 text-blue-500 hover:bg-blue-50">
                        <Link to="/noticias">
                          Ver todas as notícias
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto">
                      <Rss className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-gray-700 text-sm">Nenhuma notícia publicada</p>
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
              <CardContent className="p-6 bg-white">
                {updatesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {recentUpdates.map((update) => (
                      <div key={update.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                            {update.title}
                          </h4>
                          {update.version && (
                            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full shrink-0">
                              v{update.version}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            update.type === 'feature' ? 'bg-blue-100 text-blue-600' :
                            update.type === 'improvement' ? 'bg-green-100 text-green-600' :
                            update.type === 'bugfix' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {update.type === 'feature' ? 'Nova Funcionalidade' :
                             update.type === 'improvement' ? 'Melhoria' :
                             update.type === 'bugfix' ? 'Correção' : 'Atualização'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            update.priority === 'high' ? 'bg-red-100 text-red-600' :
                            update.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {update.priority === 'high' ? 'Alta' :
                             update.priority === 'medium' ? 'Média' : 'Normal'}
                          </span>
                        </div>
                        {update.summary && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{update.summary}</p>
                        )}
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {update.createdAt ? new Date(update.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </div>
                      </div>
                    ))}
                    <div className="pt-3">
                      <Button asChild variant="outline" size="sm" className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                        <Link to="/novidades">
                          Ver todas as novidades
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-gray-700 text-sm">Nenhuma novidade publicada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>



      </div>
    </div>
  );
});
Dashboard.displayName = 'Dashboard';

export default Dashboard;
