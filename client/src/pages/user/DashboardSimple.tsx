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
  const { data: newsData = [], isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['/api/news/published/preview'],
    queryFn: async () => {
      console.log('🔥 Buscando notícias...');
      const response = await fetch('/api/news/published/preview');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      console.log('📰 Dados de notícias recebidos:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Fetch published updates preview
  const { data: updatesData = [], isLoading: updatesLoading, error: updatesError } = useQuery({
    queryKey: ['/api/updates/published/preview'],
    queryFn: async () => {
      console.log('🔥 Buscando novidades...');
      const response = await fetch('/api/updates/published/preview');
      if (!response.ok) throw new Error('Failed to fetch updates');
      const data = await response.json();
      console.log('🚀 Dados de novidades recebidos:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  console.log('📊 Estado das queries:', { 
    newsData: newsData?.length, 
    updatesData: updatesData?.length,
    newsLoading,
    updatesLoading,
    newsError: newsError?.message,
    updatesError: updatesError?.message
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
        {/* Welcome Header - Minimalista */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                Bem-vindo, {user.name}!
              </h1>
              <p className="text-gray-600">
                Dashboard da Plataforma Core Guilherme Vasques
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-amber-600" />
                    <span className="text-2xl font-semibold text-gray-900">{user.credits || '0'}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Créditos disponíveis</p>
                </div>
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                  <Crown className="w-4 h-4 mr-2" />
                  {user.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Conecte-se Conosco - Minimalista */}
        <div className="mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Conecte-se Conosco
              </CardTitle>
              <CardDescription className="text-gray-600">
                Siga nossas redes sociais e participe da nossa comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="justify-start bg-pink-50 hover:bg-pink-100 text-gray-700 border-pink-200 hover:border-pink-300 h-12"
                  onClick={() => window.open('https://www.instagram.com/guilhermevasques.oficial/', '_blank')}
                >
                  <Instagram className="h-4 w-4 mr-3 text-pink-600" />
                  <div className="text-left">
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-gray-500">Dicas diárias</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start bg-blue-50 hover:bg-blue-100 text-gray-700 border-blue-200 hover:border-blue-300 h-12"
                  onClick={() => window.open('https://discord.gg/uMQ8Vbp94q', '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Discord</p>
                    <p className="text-xs text-gray-500">Comunidade oficial</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start bg-green-50 hover:bg-green-100 text-gray-700 border-green-200 hover:border-green-300 h-12"
                  onClick={() => window.open('https://wa.me/5545999858475', '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-xs text-gray-500">nosso Grupo Aberto</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start bg-purple-50 hover:bg-purple-100 text-gray-700 border-purple-200 hover:border-purple-300 h-12"
                  onClick={() => window.open('https://portal.guilhermevasques.club', '_blank')}
                >
                  <Star className="h-4 w-4 mr-3 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Portal</p>
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
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md"
                onClick={() => window.open('https://venda.amazon.com.br/?ld=elbrsoa_atesliberdade_virtualsoftsrp2025na', '_blank')}
              >
                Cadastre-se →
              </Button>
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
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
                onClick={() => window.open('https://amzn.to/3RTu5Sk', '_blank')}
              >
                Cadastre-se →
              </Button>
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
              <div className="flex gap-2">
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

        {/* Grid Principal - Notícias e Novidades lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Notícias */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                <Rss className="h-5 w-5 text-green-600" />
                Notícias
              </CardTitle>
              <CardDescription className="text-gray-600">
                Últimas atualizações da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {newsData && newsData.length > 0 ? (
                  newsData.slice(0, 3).map((news: any) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Rss className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma notícia disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Novidades */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Novidades
              </CardTitle>
              <CardDescription className="text-gray-600">
                Recursos e melhorias recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {updatesData && updatesData.length > 0 ? (
                  updatesData.slice(0, 3).map((update: any) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma novidade disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Ações Rápidas</CardTitle>
              <CardDescription className="text-gray-600">
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