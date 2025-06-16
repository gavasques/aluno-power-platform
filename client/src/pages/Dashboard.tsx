
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Package, Rss, Truck, Youtube, TrendingUp, Users, BookOpen, ExternalLink } from "lucide-react";
import React, { memo } from "react";
import { useYoutube } from "@/contexts/YoutubeContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/youtube/VideoCard";

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

const Dashboard = () => {
  const { videos, loading } = useYoutube();
  const recentVideos = videos.slice(0, 6);

  // Debug logs
  console.log('Dashboard - videos:', videos);
  console.log('Dashboard - loading:', loading);
  console.log('Dashboard - recentVideos:', recentVideos);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col gap-8 p-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium shadow-lg">
            <TrendingUp className="h-4 w-4 mr-2" />
            Bem-vindo de volta!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Dashboard Principal
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Sua visão geral e dinâmica de atividades e conteúdos. Acompanhe seu progresso e descubra novidades.
          </p>
        </div>

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
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto">
                    <Rss className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-gray-700">Feed de notícias em desenvolvimento</p>
                </div>
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
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-gray-700">Novidades em breve</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Produtos", color: "from-blue-500 to-cyan-600" },
              { icon: Truck, label: "Fornecedores", color: "from-emerald-500 to-teal-600" },
              { icon: BrainCircuit, label: "IA", color: "from-purple-500 to-pink-600" },
              { icon: BookOpen, label: "Cursos", color: "from-orange-500 to-red-600" }
            ].map((item, index) => (
              <Card key={index} className={`bg-gradient-to-r ${item.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}>
                <CardContent className="p-4 text-center">
                  <item.icon className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
