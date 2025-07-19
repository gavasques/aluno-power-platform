import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Crown, 
  Coins, 
  Star,
  Zap,
  Youtube,
  ExternalLink,
  Instagram,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Rss
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';



const DashboardSimple: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados para modais
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);



  // Fetch published news preview
  const { data: newsData = [] } = useQuery({
    queryKey: ['/api/news/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/news/published/preview');
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Fetch published updates preview
  const { data: updatesData = [] } = useQuery({
    queryKey: ['/api/updates/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/updates/published/preview');
      if (!response.ok) throw new Error('Failed to fetch updates');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

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
      console.error('Erro ao buscar notícia completa:', error);
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
      console.error('Erro ao buscar novidade completa:', error);
    }
    return null;
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

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-4">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bem-vindo, {user.name}!
              </h1>
              <p className="text-blue-100">
                Dashboard da Plataforma Core Guilherme Vasques
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-yellow-300" />
                    <span className="text-2xl font-bold text-yellow-300">{user.credits || '0'}</span>
                  </div>
                  <p className="text-blue-100 text-sm">Créditos disponíveis</p>
                </div>
                <Badge className="bg-white/20 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  {user.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conecte-se Conosco
              </CardTitle>
              <CardDescription className="text-gray-400">
                Siga nossas redes sociais e participe da nossa comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white hover:opacity-90 justify-start h-auto py-3"
                  onClick={() => window.open('https://www.instagram.com/guilhermevasques.oficial/', '_blank')}
                >
                  <Instagram className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-pink-100">Dicas diárias</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-red-600 to-red-700 border-0 text-white hover:opacity-90 justify-start h-auto py-3"
                  onClick={() => window.open('https://youtube.com/@guilhermeavasques', '_blank')}
                >
                  <Youtube className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">YouTube</p>
                    <p className="text-xs text-red-100">Vídeos exclusivos</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white hover:opacity-90 justify-start h-auto py-3"
                  onClick={() => window.open('https://discord.gg/uMQ8Vbp94q', '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Discord</p>
                    <p className="text-xs text-indigo-100">Comunidade oficial</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Promoções - Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Venda Moda na Amazon */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">Venda Moda na Amazon</h3>
                  <p className="text-purple-100 text-sm">0% de Comissão para novas contas</p>
                </div>
                <Crown className="h-8 w-8 text-white opacity-80" />
              </div>
              <Button 
                size="sm" 
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold"
                onClick={() => window.open('https://venda.amazon.com.br/?ld=elbrsoa_atesliberdade_virtualsoftsrp2025na', '_blank')}
              >
                Cadastre-se →
              </Button>
            </CardContent>
          </Card>

          {/* Venda na Amazon */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">Venda na Amazon</h3>
                  <p className="text-blue-100 text-sm">Tenha nossos benefícios exclusivos</p>
                </div>
                <Star className="h-8 w-8 text-white opacity-80" />
              </div>
              <Button 
                size="sm" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                onClick={() => window.open('https://amzn.to/3RTu5Sk', '_blank')}
              >
                Cadastre-se →
              </Button>
            </CardContent>
          </Card>

          {/* Helium10 */}
          <Card className="bg-gradient-to-br from-orange-600 to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">Helium 10</h3>
                  <p className="text-orange-100 text-sm">Software para encontrar produtos</p>
                </div>
                <Zap className="h-8 w-8 text-white opacity-80" />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-white text-orange-700 hover:bg-orange-50 font-semibold text-xs px-3"
                  onClick={() => window.open('https://helium10.com/go/guilherme74', '_blank')}
                >
                  Anual
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 font-semibold text-xs px-3"
                  onClick={() => window.open('https://helium10.com/go/guilherme20', '_blank')}
                >
                  Mensal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal - 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sidebar - Notícias e Novidades */}
          <div className="space-y-6">
            {/* Notícias */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rss className="h-5 w-5 text-blue-600" />
                  Notícias
                </CardTitle>
                <CardDescription>
                  Últimas atualizações da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {newsData.slice(0, 3).map((news: any) => (
                    <div
                      key={news.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={async () => {
                        const fullNews = await fetchFullNews(news.id);
                        if (fullNews) {
                          setSelectedNews(fullNews);
                          setNewsModalOpen(true);
                        }
                      }}
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{news.title}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{news.summary}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={news.category === 'Funcionalidades' ? 'default' : 'secondary'} className="text-xs">
                          {news.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {news.createdAt ? formatPublishedDate(news.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Novidades */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Novidades
                </CardTitle>
                <CardDescription>
                  Recursos e melhorias recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {updatesData.slice(0, 3).map((update: any) => (
                    <div
                      key={update.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={async () => {
                        const fullUpdate = await fetchFullUpdate(update.id);
                        if (fullUpdate) {
                          setSelectedUpdate(fullUpdate);
                          setUpdateModalOpen(true);
                        }
                      }}
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{update.title}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{update.summary}</p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={update.type === 'feature' ? 'default' : update.type === 'improvement' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {update.type === 'feature' ? 'Novo' : update.type === 'improvement' ? 'Melhoria' : 'Correção'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {update.createdAt ? formatPublishedDate(update.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse as principais funcionalidades da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => window.location.href = '/agentes'}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="text-blue-600 font-medium mb-1">Agentes IA</div>
                  <div className="text-sm text-gray-600">Otimização Amazon</div>
                  <ArrowRight className="h-4 w-4 text-blue-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/hub'}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="text-green-600 font-medium mb-1">Hub de Recursos</div>
                  <div className="text-sm text-gray-600">Ferramentas e materiais</div>
                  <ArrowRight className="h-4 w-4 text-green-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/produtos-pro'}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="text-purple-600 font-medium mb-1">Produtos PRO</div>
                  <div className="text-sm text-gray-600">Gestão multi-canal</div>
                  <ArrowRight className="h-4 w-4 text-purple-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/simuladores'}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="text-orange-600 font-medium mb-1">Simuladores</div>
                  <div className="text-sm text-gray-600">Cálculos e análises</div>
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Notícias */}
      <Dialog open={newsModalOpen} onOpenChange={setNewsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNews?.title}</DialogTitle>
            <DialogDescription>
              {selectedNews?.category} • {selectedNews?.createdAt ? formatPublishedDate(selectedNews.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600">{selectedNews?.summary}</p>
              {selectedNews?.content && (
                <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
              )}
            </div>
            {selectedNews?.tags && selectedNews.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedNews.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Novidades */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUpdate?.title}</DialogTitle>
            <DialogDescription>
              {selectedUpdate?.type === 'feature' ? 'Novo Recurso' : selectedUpdate?.type === 'improvement' ? 'Melhoria' : 'Correção'} • 
              {selectedUpdate?.createdAt ? formatPublishedDate(selectedUpdate.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600">{selectedUpdate?.summary}</p>
              {selectedUpdate?.content && (
                <div dangerouslySetInnerHTML={{ __html: selectedUpdate.content }} />
              )}
            </div>
            {selectedUpdate?.tags && selectedUpdate.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUpdate.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardSimple;