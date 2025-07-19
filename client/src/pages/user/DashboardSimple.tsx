import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Coins } from 'lucide-react';

const DashboardSimple: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
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
            <Badge className="bg-white/20 text-white mb-2">
              <Crown className="w-4 h-4 mr-2" />
              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Credits Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Créditos Disponíveis
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {user.credits || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Créditos para uso de IA e ferramentas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status da Conta
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Ativo
            </div>
            <p className="text-xs text-muted-foreground">
              Conta em funcionamento normal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Telefone Verificado
            </CardTitle>
            <div className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.phoneVerified ? (
                <span className="text-green-600">✓ Sim</span>
              ) : (
                <span className="text-orange-600">⏳ Pendente</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status da verificação telefônica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
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
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-blue-600 font-medium">Agentes IA</div>
              <div className="text-sm text-gray-600">Otimização Amazon</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/hub'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-green-600 font-medium">Hub de Recursos</div>
              <div className="text-sm text-gray-600">Ferramentas e materiais</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/produtos-pro'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-purple-600 font-medium">Produtos PRO</div>
              <div className="text-sm text-gray-600">Gestão multi-canal</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/simuladores'}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="text-orange-600 font-medium">Simuladores</div>
              <div className="text-sm text-gray-600">Cálculos e análises</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de Login</span>
              <Badge className="bg-green-100 text-green-700">
                ✓ Funcionando
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">APIs Backend</span>
              <Badge className="bg-green-100 text-green-700">
                ✓ Funcionando
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de Créditos</span>
              <Badge className="bg-green-100 text-green-700">
                ✓ Funcionando
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSimple;