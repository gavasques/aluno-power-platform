import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  Filter,
  Grid3X3,
  List,
  Play,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import { useAgents } from '@/contexts/AgentsContext';
import { useLocation } from 'wouter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AIAgents = () => {
  const [, setLocation] = useLocation();
  const { 
    agents, 
    categories, 
    getFeaturedAgents,
    searchAgents,
    getAgentsByCategory,
    isLoadingAgents 
  } = useAgents();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter agents based on search and filters
  const filteredAgents = React.useMemo(() => {
    let result = agents.filter(agent => agent.isActive);

    if (searchQuery) {
      result = searchAgents(searchQuery);
    }

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(agent => agent.category.id === selectedCategory);
    }

    if (selectedDifficulty && selectedDifficulty !== 'all') {
      result = result.filter(agent => agent.difficulty === selectedDifficulty);
    }

    return result;
  }, [agents, searchQuery, selectedCategory, selectedDifficulty, searchAgents]);

  const featuredAgents = getFeaturedAgents();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExecuteAgent = (agentId: string) => {
    // Redirecionar para página de execução do agente
    setLocation(`/agentes/${agentId}/executar`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900">Agentes de IA</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Descubra poderosos agentes de inteligência artificial para automatizar tarefas, 
          otimizar processos e potencializar seus resultados.
        </p>
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Agentes em Destaque</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.slice(0, 3).map((agent) => (
              <Card key={agent.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {agent.name}
                        </CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <Badge className={getCategoryColor(agent.category.color)}>
                        {agent.category.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{agent.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>{agent.usageCount} usos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-gray-400" />
                      <span>★ {agent.rating}</span>
                    </div>
                    <Badge className={getDifficultyColor(agent.difficulty)} variant="outline">
                      {getDifficultyLabel(agent.difficulty)}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors"
                    onClick={() => handleExecuteAgent(agent.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Usar Agente
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

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
                {categories.filter(cat => cat.isActive).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Dificuldades</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
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
            <span className="text-sm text-gray-600">
              {filteredAgents.length} agente{filteredAgents.length !== 1 ? 's' : ''} encontrado{filteredAgents.length !== 1 ? 's' : ''}
              {searchQuery && ` para "${searchQuery}"`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Todos os Agentes</h2>
          <span className="text-sm text-gray-500">
            {filteredAgents.length} agente{filteredAgents.length !== 1 ? 's' : ''} disponível{filteredAgents.length !== 1 ? 'is' : ''}
          </span>
        </div>

        {isLoadingAgents ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando agentes...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Nenhum agente está disponível no momento.'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
                        {agent.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(agent.category.color)}>
                        {agent.category.name}
                      </Badge>
                    </div>
                    {agent.isFeatured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
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

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{agent.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>{agent.usageCount} usos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-gray-400" />
                      <span>★ {agent.rating}</span>
                    </div>
                    <Badge className={getDifficultyColor(agent.difficulty)} variant="outline">
                      {getDifficultyLabel(agent.difficulty)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full group-hover:bg-primary/90 transition-colors"
                      onClick={() => handleExecuteAgent(agent.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Usar Agente
                    </Button>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>v{agent.version}</span>
                      <span>Atualizado em {agent.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Categories Overview */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore por Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.filter(cat => cat.isActive).map((category) => {
            const categoryAgents = getAgentsByCategory(category.id);
            return (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={getCategoryColor(category.color)}>
                      {categoryAgents.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AIAgents;