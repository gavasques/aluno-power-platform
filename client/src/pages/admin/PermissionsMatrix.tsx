import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingBag,
  Camera,
  FileImage,
  MessageSquare,
  Building,
  Calculator,
  TrendingUp,
  FileText,
  Wrench,
  Layout,
  Play,
  CreditCard
} from 'lucide-react';
import { useState } from 'react';

interface FeatureAccess {
  featureKey: string;
  featureName: string;
  featureCategory: string;
  creditCost: number;
  estimatedApiCost?: string;
  hasAccess: boolean;
  icon?: string;
  description?: string;
}

interface UserGroup {
  name: string;
  displayName: string;
  description: string;
}

const iconMap = {
  ShoppingBag,
  Camera,
  Users,
  FileImage,
  MessageSquare,
  Package,
  Building,
  Calculator,
  TrendingUp,
  BarChart3,
  Shield,
  FileText,
  Wrench,
  Layout,
  Play,
  CreditCard,
  Settings
};

function PermissionsMatrix() {
  const [selectedGroup, setSelectedGroup] = useState<string>('ADMIN');

  // Fetch user's current permissions
  const { data: userFeatures, isLoading: loadingFeatures } = useQuery({
    queryKey: ['/api/permissions/features'],
    retry: false,
  });

  // Fetch user's group information
  const { data: userGroup, isLoading: loadingGroup } = useQuery({
    queryKey: ['/api/permissions/group'],
    retry: false,
  });

  // Mock admin matrix data for demonstration (in real app, this would come from admin endpoint)
  const mockPermissionsMatrix = [
    {
      groupName: 'FREE',
      groupDisplayName: 'Usuário Gratuito',
      features: [
        { name: 'Acesso a Materiais', category: 'Hub Resources', hasAccess: true },
        { name: 'Conteúdo em Vídeo', category: 'Hub Resources', hasAccess: true },
        { name: 'Insights do Dashboard', category: 'Analytics', hasAccess: true },
      ]
    },
    {
      groupName: 'BASIC',
      groupDisplayName: 'Plano Básico',
      features: [
        { name: 'Amazon Listing Optimizer', category: 'AI Agents', hasAccess: true },
        { name: 'Respondedor de Reviews Negativos', category: 'AI Agents', hasAccess: true },
        { name: 'Catálogo de Produtos', category: 'Products', hasAccess: true },
        { name: 'Calculadora de Preços', category: 'Products', hasAccess: true },
        { name: 'Análise de Custos', category: 'Products', hasAccess: true },
        { name: 'Analytics de Uso', category: 'Analytics', hasAccess: true },
        { name: 'Insights do Dashboard', category: 'Analytics', hasAccess: true },
        { name: 'Acesso a Materiais', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Ferramentas', category: 'Hub Resources', hasAccess: true },
        { name: 'Conteúdo em Vídeo', category: 'Hub Resources', hasAccess: true },
      ]
    },
    {
      groupName: 'PREMIUM',
      groupDisplayName: 'Plano Premium',
      features: [
        { name: 'Amazon Listing Optimizer', category: 'AI Agents', hasAccess: true },
        { name: 'Editor de Foto Amazon', category: 'AI Agents', hasAccess: true },
        { name: 'Gerador de Infográficos', category: 'AI Agents', hasAccess: true },
        { name: 'Respondedor de Reviews Negativos', category: 'AI Agents', hasAccess: true },
        { name: 'Gestão de Fornecedores', category: 'Suppliers', hasAccess: true },
        { name: 'Catálogo de Produtos', category: 'Products', hasAccess: true },
        { name: 'Calculadora de Preços', category: 'Products', hasAccess: true },
        { name: 'Análise de Custos', category: 'Products', hasAccess: true },
        { name: 'Analytics de Uso', category: 'Analytics', hasAccess: true },
        { name: 'Rastreamento de Conversão', category: 'Analytics', hasAccess: true },
        { name: 'Insights do Dashboard', category: 'Analytics', hasAccess: true },
        { name: 'Acesso a Materiais', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Ferramentas', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Templates', category: 'Hub Resources', hasAccess: true },
        { name: 'Conteúdo em Vídeo', category: 'Hub Resources', hasAccess: true },
      ]
    },
    {
      groupName: 'MASTER',
      groupDisplayName: 'Plano Master',
      features: [
        { name: 'Amazon Listing Optimizer', category: 'AI Agents', hasAccess: true },
        { name: 'Editor de Foto Amazon', category: 'AI Agents', hasAccess: true },
        { name: 'Editor Lifestyle com Modelo', category: 'AI Agents', hasAccess: true },
        { name: 'Gerador de Infográficos', category: 'AI Agents', hasAccess: true },
        { name: 'Respondedor de Reviews Negativos', category: 'AI Agents', hasAccess: true },
        { name: 'Gestão de Fornecedores', category: 'Suppliers', hasAccess: true },
        { name: 'Catálogo de Produtos', category: 'Products', hasAccess: true },
        { name: 'Calculadora de Preços', category: 'Products', hasAccess: true },
        { name: 'Análise de Custos', category: 'Products', hasAccess: true },
        { name: 'Analytics de Uso', category: 'Analytics', hasAccess: true },
        { name: 'Rastreamento de Conversão', category: 'Analytics', hasAccess: true },
        { name: 'Insights do Dashboard', category: 'Analytics', hasAccess: true },
        { name: 'Acesso a Materiais', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Ferramentas', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Templates', category: 'Hub Resources', hasAccess: true },
        { name: 'Conteúdo em Vídeo', category: 'Hub Resources', hasAccess: true },
      ]
    },
    {
      groupName: 'ADMIN',
      groupDisplayName: 'Administrador',
      features: [
        { name: 'Amazon Listing Optimizer', category: 'AI Agents', hasAccess: true },
        { name: 'Editor de Foto Amazon', category: 'AI Agents', hasAccess: true },
        { name: 'Editor Lifestyle com Modelo', category: 'AI Agents', hasAccess: true },
        { name: 'Gerador de Infográficos', category: 'AI Agents', hasAccess: true },
        { name: 'Respondedor de Reviews Negativos', category: 'AI Agents', hasAccess: true },
        { name: 'Gestão de Fornecedores', category: 'Suppliers', hasAccess: true },
        { name: 'Catálogo de Produtos', category: 'Products', hasAccess: true },
        { name: 'Calculadora de Preços', category: 'Products', hasAccess: true },
        { name: 'Análise de Custos', category: 'Products', hasAccess: true },
        { name: 'Analytics de Uso', category: 'Analytics', hasAccess: true },
        { name: 'Rastreamento de Conversão', category: 'Analytics', hasAccess: true },
        { name: 'Insights do Dashboard', category: 'Analytics', hasAccess: true },
        { name: 'Acesso a Materiais', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Ferramentas', category: 'Hub Resources', hasAccess: true },
        { name: 'Acesso a Templates', category: 'Hub Resources', hasAccess: true },
        { name: 'Conteúdo em Vídeo', category: 'Hub Resources', hasAccess: true },
        { name: 'Gestão de Usuários', category: 'Administration', hasAccess: true },
        { name: 'Gestão de Assinaturas', category: 'Administration', hasAccess: true },
        { name: 'Configuração do Sistema', category: 'Administration', hasAccess: true },
      ]
    }
  ];

  const groupAccessCounts = {
    'FREE': { total: 19, accessible: 3, percentage: 15.8 },
    'BASIC': { total: 19, accessible: 10, percentage: 52.6 },
    'PREMIUM': { total: 19, accessible: 15, percentage: 78.9 },
    'MASTER': { total: 19, accessible: 16, percentage: 84.2 },
    'ADMIN': { total: 19, accessible: 19, percentage: 100.0 }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'AI Agents': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Products': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Analytics': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Hub Resources': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Suppliers': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Administration': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const selectedGroupData = mockPermissionsMatrix.find(g => g.groupName === selectedGroup);
  const selectedGroupStats = groupAccessCounts[selectedGroup as keyof typeof groupAccessCounts];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matriz de Permissões</h1>
        <p className="text-muted-foreground">
          Sistema de 5 grupos com permissões granulares - 19 funcionalidades em 6 categorias
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Suas Permissões Atuais
          </CardTitle>
          <CardDescription>
            Informações sobre seu nível de acesso na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingGroup ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold">
                  {userGroup?.data?.displayName || 'Usuário Gratuito'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({userGroup?.data?.name || 'FREE'})
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {userGroup?.data?.description || 'Acesso limitado às funcionalidades básicas'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Grupos</CardTitle>
          <CardDescription>
            Selecione um grupo para ver suas permissões detalhadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Object.entries(groupAccessCounts).map(([groupName, stats]) => (
              <Button
                key={groupName}
                variant={selectedGroup === groupName ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGroup(groupName)}
                className="flex flex-col h-auto p-3"
              >
                <span className="font-semibold">{groupName}</span>
                <span className="text-xs opacity-75">
                  {stats.accessible}/{stats.total}
                </span>
                <span className="text-xs opacity-75">
                  {stats.percentage}%
                </span>
              </Button>
            ))}
          </div>

          {/* Selected Group Details */}
          {selectedGroupData && selectedGroupStats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{selectedGroupData.groupDisplayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroupStats.accessible} de {selectedGroupStats.total} funcionalidades ({selectedGroupStats.percentage}% de acesso)
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {selectedGroupStats.percentage}%
                </Badge>
              </div>

              {/* Features by Category */}
              <div className="space-y-4">
                {['AI Agents', 'Products', 'Analytics', 'Hub Resources', 'Suppliers', 'Administration'].map(category => {
                  const categoryFeatures = selectedGroupData.features.filter(f => f.category === category);
                  if (categoryFeatures.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(category)}>
                          {category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {categoryFeatures.length} funcionalidades
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                        {categoryFeatures.map(feature => (
                          <div
                            key={feature.name}
                            className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              feature.hasAccess ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dados em Tempo Real</CardTitle>
          <CardDescription>
            Dados reais da API de permissões (quando disponível)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFeatures ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : userFeatures?.data ? (
            <div className="space-y-4">
              <p className="text-sm text-green-600">
                ✅ API de permissões funcionando - {userFeatures.data.length} funcionalidades carregadas
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {userFeatures.data.slice(0, 6).map((feature: FeatureAccess, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      feature.hasAccess ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">{feature.featureName}</span>
                    <Badge variant="outline" size="sm">
                      {feature.creditCost} créditos
                    </Badge>
                  </div>
                ))}
              </div>
              {userFeatures.data.length > 6 && (
                <p className="text-xs text-muted-foreground">
                  ... e mais {userFeatures.data.length - 6} funcionalidades
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              ⚠️ API de permissões não disponível - usando dados de demonstração
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PermissionsMatrix;