import React from 'react';
import { useLocation } from 'wouter';
import { PartnerStatsWidget } from '@/components/dashboard/widgets/PartnerStatsWidget';
import { BaseWidget } from '@/components/dashboard/widgets/BaseWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  Package, 
  Wrench, 
  TrendingUp, 
  Activity,
  Calendar,
  Bell
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  totalUsers: number;
  totalPartners: number;
  totalTools: number;
  totalMaterials: number;
  recentActivity: Array<{
    id: string;
    type: 'partner' | 'tool' | 'material' | 'user';
    message: string;
    timestamp: Date;
  }>;
}

export const DashboardRefactored: React.FC = () => {
  const navigate = useNavigate();

  // Fetch dashboard data from multiple endpoints
  const { data: partners = [] } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await fetch('/api/partners');
      if (!response.ok) throw new Error('Failed to fetch partners');
      return response.json();
    }
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      return response.json();
    }
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: async () => {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      return response.json();
    }
  });

  const quickActions = [
    {
      title: 'Ver Parceiros',
      description: 'Explore nossos parceiros verificados',
      icon: <Users className="h-5 w-5" />,
      action: () => navigate('/hub/parceiros'),
      color: 'bg-blue-500'
    },
    {
      title: 'Ferramentas',
      description: 'Acesse ferramentas especializadas',
      icon: <Wrench className="h-5 w-5" />,
      action: () => navigate('/hub/ferramentas'),
      color: 'bg-green-500'
    },
    {
      title: 'Materiais',
      description: 'Consulte materiais educativos',
      icon: <FileText className="h-5 w-5" />,
      action: () => navigate('/hub/materiais'),
      color: 'bg-purple-500'
    },
    {
      title: 'Fornecedores',
      description: 'Encontre fornecedores confiáveis',
      icon: <Package className="h-5 w-5" />,
      action: () => navigate('/hub/fornecedores'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Dashboard</h1>
        <p className="text-blue-100">
          Gerencie seus parceiros, ferramentas e recursos em um só lugar
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BaseWidget
          title="Parceiros"
          icon={<Users className="h-4 w-4" />}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{partners.length}</div>
            <p className="text-sm text-gray-600 mt-1">Parceiros ativos</p>
          </div>
        </BaseWidget>

        <BaseWidget
          title="Ferramentas"
          icon={<Wrench className="h-4 w-4" />}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{tools.length}</div>
            <p className="text-sm text-gray-600 mt-1">Ferramentas disponíveis</p>
          </div>
        </BaseWidget>

        <BaseWidget
          title="Materiais"
          icon={<FileText className="h-4 w-4" />}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{materials.length}</div>
            <p className="text-sm text-gray-600 mt-1">Materiais educativos</p>
          </div>
        </BaseWidget>

        <BaseWidget
          title="Atividade"
          icon={<Activity className="h-4 w-4" />}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {partners.length + tools.length + materials.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total de recursos</p>
          </div>
        </BaseWidget>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner Statistics */}
        <div className="lg:col-span-2">
          <PartnerStatsWidget />
        </div>

        {/* Quick Actions */}
        <div>
          <BaseWidget
            title="Ações Rápidas"
            icon={<TrendingUp className="h-4 w-4" />}
          >
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={action.action}
                >
                  <div className={`${action.color} p-2 rounded-md text-white mr-3`}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </BaseWidget>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseWidget
          title="Atividade Recente"
          icon={<Bell className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Novos parceiros adicionados</p>
                <p className="text-xs text-gray-500">Sistema atualizado com dados reais</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Wrench className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Ferramentas sincronizadas</p>
                <p className="text-xs text-gray-500">Base de dados atualizada</p>
              </div>
            </div>
          </div>
        </BaseWidget>

        <BaseWidget
          title="Próximas Tarefas"
          icon={<Calendar className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Revisar avaliações de parceiros</p>
                <p className="text-xs text-gray-500">Pendente aprovação</p>
              </div>
              <div className="text-yellow-600 text-xs font-medium">Hoje</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Atualizar informações de contato</p>
                <p className="text-xs text-gray-500">Manter dados atualizados</p>
              </div>
              <div className="text-blue-600 text-xs font-medium">Amanhã</div>
            </div>
          </div>
        </BaseWidget>
      </div>
    </div>
  );
};