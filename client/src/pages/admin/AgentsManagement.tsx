import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  Activity, 
  BarChart,
  Filter,
  Grid3X3,
  List,
  Star,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { useRoute, useLocation } from 'wouter';
import { useAgents } from '@/contexts/AgentsContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AgentsManagement = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/admin/agentes/:section?/:id?/:action?');
  const { 
    agents, 
    categories, 
    executions,
    isLoadingAgents, 
    deleteAgent,
    updateAgent 
  } = useAgents();
  const { hasAdminAccess } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if no admin access
  if (!hasAdminAccess) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Settings className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar a gestão de agentes.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle different sections
  const section = params?.section || 'overview';

  // Filter agents based on search and filters
  const filteredAgents = React.useMemo(() => {
    let result = agents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(agent => agent.category.id === selectedCategory);
    }

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(agent => agent.isActive);
      } else if (statusFilter === 'inactive') {
        result = result.filter(agent => !agent.isActive);
      } else if (statusFilter === 'featured') {
        result = result.filter(agent => agent.isFeatured);
      }
    }

    return result;
  }, [agents, searchQuery, selectedCategory, statusFilter]);

  // Statistics
  const stats = React.useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.isActive).length;
    const featuredAgents = agents.filter(a => a.isFeatured).length;
    const totalExecutions = executions.length;
    const avgRating = agents.length > 0 
      ? (agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1)
      : '0.0';

    return {
      totalAgents,
      activeAgents,
      featuredAgents,
      totalExecutions,
      avgRating
    };
  }, [agents, executions]);

  const handleToggleStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      await updateAgent(agentId, { isActive: !currentStatus });
      toast({
        title: "Status atualizado",
        description: `Agente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agente.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (agentId: string, currentFeatured: boolean) => {
    try {
      await updateAgent(agentId, { isFeatured: !currentFeatured });
      toast({
        title: "Destaque atualizado",
        description: `Agente ${!currentFeatured ? 'destacado' : 'removido dos destaques'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o destaque do agente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    try {
      await deleteAgent(agentId);
      toast({
        title: "Agente excluído",
        description: `O agente "${agentName}" foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agente.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'N/A';
    }
  };

  if (section === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Agentes IA</h1>
            <p className="text-gray-500">Gerencie e monitore os agentes de inteligência artificial</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation('/admin/agentes/categorias')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Categorias
            </Button>
            <Button onClick={() => setLocation('/admin/agentes/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agente
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAgents} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeAgents / stats.totalAgents) * 100).toFixed(0)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Destaque</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.featuredAgents}</div>
              <p className="text-xs text-muted-foreground">
                Agentes destacados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções</CardTitle>
              <BarChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                Total de execuções
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">
                De 5.0 estrelas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar agentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Apenas Ativos</SelectItem>
                  <SelectItem value="inactive">Apenas Inativos</SelectItem>
                  <SelectItem value="featured">Em Destaque</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredAgents.length} agente{filteredAgents.length !== 1 ? 's' : ''} encontrado{filteredAgents.length !== 1 ? 's' : ''}
                {searchQuery && ` para "${searchQuery}"`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Agents List/Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando agentes...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando seu primeiro agente.'}
                </p>
                {(!searchQuery && selectedCategory === 'all' && statusFilter === 'all') && (
                  <Button onClick={() => setLocation('/admin/agentes/novo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Agente
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
              }>
                {filteredAgents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            {agent.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <Badge 
                            className={`${agent.category.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                              agent.category.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                              agent.category.color === 'green' ? 'bg-green-100 text-green-800' :
                              agent.category.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'}`}
                          >
                            {agent.category.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(agent.id, agent.isFeatured)}
                            title={agent.isFeatured ? 'Remover destaque' : 'Destacar agente'}
                          >
                            <Star className={`h-4 w-4 ${agent.isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(agent.id, agent.isActive)}
                            title={agent.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {agent.isActive ? (
                              <Pause className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Play className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {agent.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {agent.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Versão:</span>
                          <span className="ml-1 font-medium">{agent.version}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uso:</span>
                          <span className="ml-1 font-medium">{agent.usageCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avaliação:</span>
                          <span className="ml-1 font-medium">★ {agent.rating}</span>
                        </div>
                        <div>
                          <Badge className={getDifficultyColor(agent.difficulty)} variant="secondary">
                            {getDifficultyLabel(agent.difficulty)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-muted-foreground">
                            {agent.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/agentes/${agent.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/agentes/${agent.id}/edit`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o agente "{agent.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle other sections (categories, new agent, etc.) - will be implemented next
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Seção em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-4">
            A seção "{section}" está sendo implementada.
          </p>
          <Button onClick={() => setLocation('/admin/agentes')}>
            Voltar à Gestão de Agentes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentsManagement;