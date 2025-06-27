import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, StarIcon } from 'lucide-react';
import { Agent, AGENT_CATEGORIES, AGENT_FILTERS } from '@/types/agent';

const AIAgents = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai-agent-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Mock data para os agentes
  const mockAgents: Agent[] = [
    {
      id: '1',
      title: 'Gerador de Listings Amazon',
      description: 'Crie listings otimizados para Amazon com títulos, bullet points e descrições que convertem mais vendas.',
      icon: '🛒',
      category: AGENT_CATEGORIES.find(c => c.id === 'ecommerce')!,
      badges: ['Novo!'],
      isFavorite: false,
      isNew: true,
      isBeta: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Análise de Escrita',
      description: 'Analise e melhore seus e-mails para aumentar taxa de abertura e engajamento dos destinatários.',
      icon: '✍️',
      category: AGENT_CATEGORIES.find(c => c.id === 'emails')!,
      badges: [],
      isFavorite: false,
      isNew: false,
      isBeta: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Ângulos de Anúncios',
      description: 'Gere múltiplos ângulos criativos para seus anúncios e encontre o que melhor ressoa com seu público.',
      icon: '📊',
      category: AGENT_CATEGORIES.find(c => c.id === 'marketing')!,
      badges: ['Beta'],
      isFavorite: false,
      isNew: false,
      isBeta: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      title: 'Criador de Conteúdo',
      description: 'Produza conteúdo envolvente para redes sociais, blogs e campanhas de marketing digital.',
      icon: '📝',
      category: AGENT_CATEGORIES.find(c => c.id === 'content')!,
      badges: [],
      isFavorite: false,
      isNew: false,
      isBeta: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      title: 'Otimizador de Títulos',
      description: 'Otimize títulos para SEO e conversão usando técnicas comprovadas de copywriting e marketing.',
      icon: '🎯',
      category: AGENT_CATEGORIES.find(c => c.id === 'marketing')!,
      badges: [],
      isFavorite: false,
      isNew: false,
      isBeta: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      title: 'Gerador de Scripts',
      description: 'Crie scripts envolventes para vídeos do YouTube que mantêm a audiência engajada do início ao fim.',
      icon: '🎬',
      category: AGENT_CATEGORIES.find(c => c.id === 'youtube')!,
      badges: ['Beta'],
      isFavorite: false,
      isNew: false,
      isBeta: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const filteredAgents = useMemo(() => {
    let result = mockAgents;

    // Filtro por busca
    if (searchQuery) {
      result = result.filter(agent =>
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria/tipo
    switch (selectedFilter) {
      case 'favorites':
        result = result.filter(agent => favorites.includes(agent.id));
        break;
      case 'beta':
        result = result.filter(agent => agent.isBeta);
        break;
      case 'new':
        result = result.filter(agent => agent.isNew);
        break;
      case 'ecommerce':
        result = result.filter(agent => agent.category.id === 'ecommerce');
        break;
      case 'marketing':
        result = result.filter(agent => agent.category.id === 'marketing');
        break;
      case 'ads':
        result = result.filter(agent => agent.category.id === 'ads');
        break;
      case 'content':
        result = result.filter(agent => agent.category.id === 'content');
        break;
      case 'all':
      default:
        break;
    }

    return result;
  }, [mockAgents, searchQuery, selectedFilter, favorites]);

  const toggleFavorite = (agentId: string) => {
    const newFavorites = favorites.includes(agentId)
      ? favorites.filter(id => id !== agentId)
      : [...favorites, agentId];
    
    setFavorites(newFavorites);
    localStorage.setItem('ai-agent-favorites', JSON.stringify(newFavorites));
  };

  const handleAgentClick = (agentId: string) => {
    setLocation(`/hub/agents/${agentId}`);
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'Novo!':
        return 'default';
      case 'Beta':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todos os Agentes</h1>
          <p className="text-lg text-gray-700 mt-2">
            Agentes de IA especializados para automatizar suas tarefas de marketing e vendas
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          {AGENT_FILTERS.map((filter) => (
            <TabsTrigger
              key={filter.id}
              value={filter.id}
              className="text-xs px-2 py-1"
            >
              {filter.name}
              {filter.id === 'favorites' && favorites.length > 0 && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedFilter} className="mt-6">
          {/* Agents Grid */}
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 relative"
                  onClick={() => handleAgentClick(agent.id)}
                >
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-yellow-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(agent.id);
                    }}
                  >
                    {favorites.includes(agent.id) ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                    )}
                  </Button>

                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{agent.icon}</div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {agent.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={agent.category.color} variant="secondary">
                            {agent.category.name}
                          </Badge>
                          {agent.badges.map((badge) => (
                            <Badge
                              key={badge}
                              variant={getBadgeVariant(badge)}
                              className="text-xs"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {agent.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum agente encontrado
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? `Não encontramos agentes que correspondam à sua busca "${searchQuery}".`
                  : selectedFilter === 'favorites'
                  ? 'Você ainda não favoritou nenhum agente. Clique na estrela para adicionar aos favoritos.'
                  : 'Nenhum agente disponível nesta categoria no momento.'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      {filteredAgents.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-8">
          Mostrando {filteredAgents.length} de {mockAgents.length} agentes
        </div>
      )}
    </div>
  );
};

export default AIAgents;