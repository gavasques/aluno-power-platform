import React, { memo, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  Settings,
  ExternalLink,
  Bot,
  Youtube,
  Database
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminGrid, AdminLoader } from '@/components/layout/AdminStandardLayout';

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

  // Helper function for activity badges
  const getActivityBadge = useCallback((type: string) => {
    const badges = {
      user: <Badge variant="secondary" className="bg-blue-50 text-blue-700">Usuário</Badge>,
      content: <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Conteúdo</Badge>,
      agent: <Badge variant="secondary" className="bg-purple-50 text-purple-700">Agente IA</Badge>,
      system: <Badge variant="secondary" className="bg-gray-50 text-gray-700">Sistema</Badge>
    };
    return badges[type as keyof typeof badges] || badges.system;
  }, []);

  // Recent activity from real data
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recentActivity) return [];
    
    return dashboardData.recentActivity.slice(0, 5).map((activity) => ({
      ...activity,
      badge: getActivityBadge(activity.type)
    }));
  }, [dashboardData?.recentActivity, getActivityBadge]);

  // Ultra-lightweight loading state
  if (isLoading) {
    return (
      <AdminStandardLayout title="Dashboard Administrativo">
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title="Dashboard Administrativo"
      description="Visão geral da plataforma"
    >
      <div className="space-y-6">
        {/* Metrics - Simplified */}
        <section>
          <h2 className="text-base font-medium mb-3 text-gray-700">Métricas</h2>
          <AdminGrid>
            {metrics.map((metric, index) => (
              <AdminCard key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{metric.title}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="text-xs text-gray-400">{metric.change}</p>
                  </div>
                  <div className={`p-2 rounded ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.textColor}`} />
                  </div>
                </div>
              </AdminCard>
            ))}
          </AdminGrid>
        </section>

        {/* Quick Actions - Minimal */}
        <section>
          <h2 className="text-base font-medium mb-3 text-gray-700">Ações Rápidas</h2>
          <AdminGrid>
            {quickActions.map((action, index) => (
              <AdminCard 
                key={index}
                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setLocation(action.href)}
              >
                <div className="text-center space-y-2">
                  <action.icon className="h-5 w-5 mx-auto text-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Acessar
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </AdminCard>
            ))}
          </AdminGrid>
        </section>

        {/* Recent Activity - Simplified */}
        <section>
          <AdminCard 
            title="Atividade Recente"
            actions={
              <Button variant="ghost" size="sm">
                Ver Todas
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.badge}
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </AdminCard>
        </section>

        {/* System Status - Minimal */}
        <section>
          <h2 className="text-base font-medium mb-3 text-gray-700">Status</h2>
          <AdminGrid columns={3}>
            <AdminCard>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Banco</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">APIs IA</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-gray-500">Ativo</span>
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center space-x-2">
                <Youtube className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">YouTube</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    <span className="text-xs text-gray-500">Config</span>
                  </div>
                </div>
              </div>
            </AdminCard>
          </AdminGrid>
        </section>
      </div>
    </AdminStandardLayout>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;