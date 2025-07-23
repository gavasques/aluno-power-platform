import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Coins, Star, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Componentes reutilizáveis
import PromotionalSection from './PromotionalSection';
import SocialLinksSection from './SocialLinksSection';
import NewsSection from './NewsSection';
import UpdatesSection from './UpdatesSection';
import NewsAndUpdatesModals from './NewsAndUpdatesModals';
import useNewsAndUpdates from '@/hooks/useNewsAndUpdates';

interface UnifiedDashboardProps {
  variant?: 'full' | 'simple';
  showAdvancedFeatures?: boolean;
  showUserStats?: boolean;
  showQuickActions?: boolean;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  variant = 'full',
  showAdvancedFeatures = true,
  showUserStats = true,
  showQuickActions = true,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Hook para notícias e novidades
  const {
    newsData,
    updatesData,
    newsLoading,
    updatesLoading,
    selectedNews,
    selectedUpdate,
    newsModalOpen,
    updateModalOpen,
    setNewsModalOpen,
    setUpdateModalOpen,
    openNewsModal,
    openUpdateModal,
    formatCreatedDate,
  } = useNewsAndUpdates();

  // Fetch user summary apenas para a versão full
  const { data: userSummary, isLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    enabled: variant === 'full',
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'agents':
        case 'agentes':
          window.location.href = '/agentes';
          break;
        case 'products':
          window.location.href = '/myarea/products';
          break;
        case 'hub':
          window.location.href = '/hub';
          break;
        case 'produtos-pro':
          window.location.href = '/produtos-pro';
          break;
        case 'simuladores':
          window.location.href = '/simuladores';
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
      console.error('Erro ao executar ação rápida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar esta ação.",
        variant: "destructive",
      });
    }
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

  if (isLoading && variant === 'full') {
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

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Dados do usuário
  const currentUser = variant === 'full' ? ((userSummary as any)?.user || {}) : user;
  const creditBalance = variant === 'full' 
    ? ((userSummary as any)?.credits?.current || 0)
    : (user.credits || 0);
  const planName = variant === 'full' 
    ? ((userSummary as any)?.subscription?.planName || (userSummary as any)?.user?.plan || 'Gratuito')
    : (user.role === 'admin' ? 'Admin' : 'Usuário');

  if (!userSummary && variant === 'full') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar</h3>
              <p className="text-gray-600 mb-4">Não foi possível carregar os dados do dashboard.</p>
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
      <div className="container mx-auto px-4 py-4">
        
        {/* Header Section */}
        <div className="mb-6">
          {variant === 'simple' ? (
            // Header Simples
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                    Bem-vindo, {currentUser.name}!
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
                        <span className="text-2xl font-semibold text-gray-900">{creditBalance.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-500 text-sm">Créditos disponíveis</p>
                    </div>
                    <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                      <Crown className="w-4 h-4 mr-2" />
                      {planName}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Header Completo
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Olá, {currentUser.name || 'Usuário'}! 👋
                </h1>
                <p className="text-gray-600">
                  Aqui está um resumo das suas atividades e novidades da plataforma
                </p>
              </div>
              
              {showUserStats && (
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
              )}
            </div>
          )}
        </div>

        {/* Links Sociais */}
        <SocialLinksSection variant={variant} />

        {/* Seção de Promoções */}
        <PromotionalSection />

        {/* Grid Principal - Notícias e Novidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <NewsSection 
            newsData={newsData}
            newsLoading={newsLoading}
            onNewsClick={openNewsModal}
            formatCreatedDate={formatCreatedDate}
            variant={variant}
          />
          
          <UpdatesSection 
            updatesData={updatesData}
            updatesLoading={updatesLoading}
            onUpdateClick={openUpdateModal}
            formatCreatedDate={formatCreatedDate}
            variant={variant}
          />
        </div>

        {/* Ações Rápidas - apenas para versão simple */}
        {variant === 'simple' && showQuickActions && (
          <Card className="bg-white border border-gray-200 shadow-sm mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ações Rápidas</h3>
              <p className="text-gray-600 mb-4">Acesse as principais funcionalidades da plataforma</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleQuickAction('agentes')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="text-blue-600 font-medium mb-1">Agentes IA</div>
                  <div className="text-sm text-gray-600">Otimização Amazon</div>
                  <ArrowRight className="h-4 w-4 text-blue-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => handleQuickAction('hub')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="text-green-600 font-medium mb-1">Hub de Recursos</div>
                  <div className="text-sm text-gray-600">Ferramentas e materiais</div>
                  <ArrowRight className="h-4 w-4 text-green-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => handleQuickAction('produtos-pro')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="text-purple-600 font-medium mb-1">Produtos PRO</div>
                  <div className="text-sm text-gray-600">Gestão multi-canal</div>
                  <ArrowRight className="h-4 w-4 text-purple-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => handleQuickAction('simuladores')}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="text-orange-600 font-medium mb-1">Simuladores</div>
                  <div className="text-sm text-gray-600">Cálculos e análises</div>
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modais */}
      <NewsAndUpdatesModals
        selectedNews={selectedNews}
        selectedUpdate={selectedUpdate}
        newsModalOpen={newsModalOpen}
        updateModalOpen={updateModalOpen}
        setNewsModalOpen={setNewsModalOpen}
        setUpdateModalOpen={setUpdateModalOpen}
        formatCreatedDate={formatCreatedDate}
      />
    </div>
  );
};

export default UnifiedDashboard;