import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Database, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  Settings,
  MessageSquare,
  ExternalLink,
  Package,
  Bot,
  Youtube
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { StandardizedLayout, PageWrapper, ResponsiveGrid } from '@/components/layout/StandardizedLayout';

// Dashboard data interface
interface DashboardData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalContent: number;
  publishedContent: number;
  totalAgents: number;
  activeAgents: number;
  totalVideos: number;
  recentVideos: number;
  recentActivity: Array<{
    action: string;
    details: string;
    type: string;
    timestamp: string;
  }>;
}

// Admin Dashboard Metrics with real data
const AdminDashboard = memo(() => {
  const [, setLocation] = useLocation();

  // Real data queries
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard-stats'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoized metrics from real data
  const metrics = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      {
        title: 'Total de Usuários',
        value: dashboardData.totalUsers.toString(),
        change: `+${dashboardData.newUsersThisMonth} este mês`,
        icon: Users,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      },
      {
        title: 'Conteúdos Ativos',
        value: dashboardData.totalContent.toString(),
        change: `${dashboardData.publishedContent} publicados`,
        icon: FileText,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      },
      {
        title: 'Agentes IA',
        value: dashboardData.totalAgents.toString(),
        change: `${dashboardData.activeAgents} ativos`,
        icon: Bot,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      },
      {
        title: 'Vídeos YouTube',
        value: dashboardData.totalVideos.toString(),
        change: `${dashboardData.recentVideos} recentes`,
        icon: Youtube,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700'
      }
    ];
  }, [dashboardData]);

  // Quick actions for admin
  const quickActions = useMemo(() => [
    {
      title: 'Usuários',
      description: 'Gerenciar contas e permissões',
      href: '/admin/usuarios',
      icon: Users,
      color: 'border-blue-200 hover:border-blue-300'
    },
    {
      title: 'Conteúdo',
      description: 'Hub de recursos e materiais',
      href: '/admin/conteudo',
      icon: FileText,
      color: 'border-emerald-200 hover:border-emerald-300'
    },
    {
      title: 'Agentes IA',
      description: 'Configurações e provedores',
      href: '/admin/agents',
      icon: Bot,
      color: 'border-purple-200 hover:border-purple-300'
    },
    {
      title: 'Configurações',
      description: 'Sistema e preferências',
      href: '/admin/configuracoes',
      icon: Settings,
      color: 'border-gray-200 hover:border-gray-300'
    }
  ], []);

  // Recent activity from real data
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recentActivity) return [];
    
    return dashboardData.recentActivity.slice(0, 5).map((activity) => ({
      ...activity,
      badge: getActivityBadge(activity.type)
    }));
  }, [dashboardData?.recentActivity]);

  const getActivityBadge = (type: string) => {
    const badges = {
      user: <Badge variant="secondary" className="bg-blue-50 text-blue-700">Usuário</Badge>,
      content: <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Conteúdo</Badge>,
      agent: <Badge variant="secondary" className="bg-purple-50 text-purple-700">Agente IA</Badge>,
      system: <Badge variant="secondary" className="bg-gray-50 text-gray-700">Sistema</Badge>
    };
    return badges[type as keyof typeof badges] || badges.system;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <StandardizedLayout variant="admin">
        <PageWrapper title="Dashboard Administrativo" description="Carregando dados...">
          <ResponsiveGrid columns={4} gap="md">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="card-optimized">
                <CardContent className="p-6">
                  <div className="skeleton-optimized h-4 w-3/4 mb-2" />
                  <div className="skeleton-optimized h-8 w-1/2 mb-2" />
                  <div className="skeleton-optimized h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </PageWrapper>
      </StandardizedLayout>
    );
  }

  return (
    <StandardizedLayout variant="admin">
      <PageWrapper 
        title="Dashboard Administrativo"
        description="Visão geral da plataforma e métricas principais"
      >
        <div className="space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Métricas Principais</h2>
            <ResponsiveGrid columns={4} gap="md">
              {metrics.map((metric, index) => (
                <Card key={index} className="card-optimized hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                        <metric.icon className={`h-6 w-6 ${metric.textColor}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.change}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <ResponsiveGrid columns={4} gap="md">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className={`card-optimized cursor-pointer transition-all duration-200 ${action.color}`}
                  onClick={() => setLocation(action.href)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 rounded-full bg-muted/50">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        Acessar
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Atividade Recente</h2>
              <Button variant="outline" size="sm">
                Ver Todas
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <Card className="card-optimized">
              <CardContent className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.details}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.badge}
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* System Status */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
            <div className="layout-grid-3">
              <Card className="card-optimized">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Banco de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Operacional</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-optimized">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    APIs de IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Funcionando</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-optimized">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    Sync YouTube
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">Configuração necessária</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </PageWrapper>
    </StandardizedLayout>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;