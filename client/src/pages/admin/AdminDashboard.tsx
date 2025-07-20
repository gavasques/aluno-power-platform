import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Settings,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminGrid, AdminLoader } from '@/components/layout/AdminStandardLayout';

// Ultra-lightweight dashboard data interface
interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
}

// Ultra-lightweight Admin Dashboard
const AdminDashboard = memo(() => {
  const [, setLocation] = useLocation();

  // Ultra-lightweight data queries - only essentials
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Simple metrics - no heavy calculations
  const metrics = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        title: 'Total de Usuários',
        value: stats.totalUsers.toString(),
        icon: Users,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      },
      {
        title: 'Grupos Ativos',
        value: stats.totalGroups.toString(),
        icon: UserCheck,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      }
    ];
  }, [stats]);

  // Minimal quick actions
  const quickActions = useMemo(() => [
    {
      title: 'Usuários',
      description: 'Gerenciar contas',
      href: '/admin/usuarios',
      icon: Users
    },
    {
      title: 'Configurações',
      description: 'Sistema',
      href: '/admin/configuracoes',
      icon: Settings
    }
  ], []);

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
      description="Visão geral simplificada"
    >
      <div className="space-y-6">
        {/* Ultra-lightweight Metrics */}
        <section>
          <h2 className="text-base font-medium mb-3 text-gray-700">Resumo</h2>
          <AdminGrid>
            {metrics.map((metric, index) => (
              <AdminCard key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{metric.title}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                  </div>
                  <div className={`p-2 rounded ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.textColor}`} />
                  </div>
                </div>
              </AdminCard>
            ))}
          </AdminGrid>
        </section>

        {/* Minimal Quick Actions */}
        <section>
          <h2 className="text-base font-medium mb-3 text-gray-700">Administração</h2>
          <AdminGrid columns={2}>
            {quickActions.map((action, index) => (
              <AdminCard 
                key={index}
                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setLocation(action.href)}
              >
                <div className="text-center space-y-3">
                  <action.icon className="h-6 w-6 mx-auto text-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Acessar
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </AdminCard>
            ))}
          </AdminGrid>
        </section>
      </div>
    </AdminStandardLayout>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;