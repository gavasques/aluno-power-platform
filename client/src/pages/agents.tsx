import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  Play,
  Zap,
  ShoppingCart,
  FileText,
  MessageSquare,
  Target,
  Heart,
  Lock,
  CheckCircle,
  Users,
  History
} from 'lucide-react';
import { useLocation } from 'wouter';

// Interfaces para área do aluno
interface StudentAgent {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  icon: string;
  isAvailable: boolean;
  userCanAccess: boolean;
  lastUsed?: string;
  usageCount: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isFavorite?: boolean;
}

interface AgentCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  count: number;
}

const Agents = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('student-agent-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Agentes mockados para área do aluno
  const agents: StudentAgent[] = [
    {
      id: 'amazon-listing',
      name: 'Gerador de Listings Amazon',
      description: 'Crie títulos, bullet points e descrições otimizadas para produtos na Amazon',
      category: { id: 'ecommerce', name: 'E-commerce', color: 'blue' },
      icon: 'ShoppingCart',
      isAvailable: true,
      userCanAccess: true,
      lastUsed: '2025-06-26',
      usageCount: 15,
      estimatedTime: '5-10 min',
      difficulty: 'beginner',
      tags: ['Amazon', 'SEO', 'Produtos', 'Otimização'],
      isFavorite: false
    },
    {
      id: 'content-writer',
      name: 'Criador de Conteúdo',
      description: 'Gere posts para redes sociais, artigos de blog e conteúdo marketing',
      category: { id: 'marketing', name: 'Marketing', color: 'purple' },
      icon: 'FileText',
      isAvailable: true,
      userCanAccess: true,
      usageCount: 8,
      estimatedTime: '3-7 min',
      difficulty: 'beginner',
      tags: ['Blog', 'Social Media', 'Marketing', 'Copywriting']
    },
    {
      id: 'email-assistant',
      name: 'Assistente de E-mail',
      description: 'Redija e-mails profissionais, respostas e campanhas de marketing',
      category: { id: 'comunicacao', name: 'Comunicação', color: 'green' },
      icon: 'MessageSquare',
      isAvailable: true,
      userCanAccess: true,
      usageCount: 12,
      estimatedTime: '2-5 min',
      difficulty: 'beginner',
      tags: ['E-mail', 'Comunicação', 'Profissional']
    },
    {
      id: 'keyword-research',
      name: 'Pesquisa de Palavras-chave',
      description: 'Encontre palavras-chave relevantes para SEO e campanhas de marketing',
      category: { id: 'marketing', name: 'Marketing', color: 'purple' },
      icon: 'Target',
      isAvailable: false, // Indisponível
      userCanAccess: true,
      usageCount: 0,
      estimatedTime: '10-15 min',
      difficulty: 'intermediate',
      tags: ['SEO', 'Keywords', 'Marketing Digital']
    },
    {
      id: 'competitor-analysis',
      name: 'Análise de Concorrentes',
      description: 'Analise estratégias de concorrentes e identifique oportunidades',
      category: { id: 'analise', name: 'Análise', color: 'orange' },
      icon: 'Users',
      isAvailable: true,
      userCanAccess: false, // Sem acesso
      usageCount: 0,
      estimatedTime: '15-20 min',
      difficulty: 'advanced',
      tags: ['Concorrência', 'Estratégia', 'Mercado']
    }
  ];

  // Categorias para filtros
  const categories: AgentCategory[] = [
    { id: 'todos', name: 'Todos', icon: Zap, color: 'gray', count: agents.length },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart, color: 'blue', count: agents.filter(a => a.category.id === 'ecommerce').length },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'purple', count: agents.filter(a => a.category.id === 'marketing').length },
    { id: 'comunicacao', name: 'Comunicação', icon: MessageSquare, color: 'green', count: agents.filter(a => a.category.id === 'comunicacao').length },
    { id: 'analise', name: 'Análise', icon: Users, color: 'orange', count: agents.filter(a => a.category.id === 'analise').length }
  ];

  // Filtrar agentes
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todos' || agent.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).map(agent => ({
    ...agent,
    isFavorite: favorites.includes(agent.id)
  }));

  // Toggle favorito
  const toggleFavorite = (agentId: string) => {
    const newFavorites = favorites.includes(agentId)
      ? favorites.filter(id => id !== agentId)
      : [...favorites, agentId];
    
    setFavorites(newFavorites);
    localStorage.setItem('student-agent-favorites', JSON.stringify(newFavorites));
  };

  // Usar agente
  const handleUseAgent = (agentId: string) => {
    if (agentId === 'amazon-listing') {
      setLocation('/agents/amazon-listings-optimizer');
    } else {
      // Para outros agentes, redirecionar para página genérica
      setLocation(`/agents/${agentId}`);
    }
  };

  // Cores das categorias
  const getCategoryColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  // Cores de dificuldade
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todos os Agentes</h1>
        </div>
        
        {/* Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtros por categoria */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Conteúdo das abas */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  {/* Botão de favorito */}
                  <button
                    onClick={() => toggleFavorite(agent.id)}
                    className="absolute top-3 right-3 z-10 p-1"
                  >
                    <Heart 
                      className={`h-4 w-4 ${agent.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg pr-8">
                      {agent.name}
                    </CardTitle>
                    <Badge className={getCategoryColor(agent.category.color)}>
                      {agent.category.name}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {agent.description}
                    </p>

                    {/* Tempo estimado */}
                    <div className="flex items-center space-x-1 mb-4 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{agent.estimatedTime}</span>
                    </div>

                    {/* Botão de ação */}
                    {!agent.isAvailable ? (
                      <Button disabled className="w-full" variant="secondary">
                        <Lock className="h-4 w-4 mr-2" />
                        Indisponível
                      </Button>
                    ) : !agent.userCanAccess ? (
                      <Button disabled className="w-full" variant="outline">
                        <Lock className="h-4 w-4 mr-2" />
                        Acesso Restrito
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleUseAgent(agent.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Usar Agente
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Estado vazio */}
            {filteredAgents.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? `Nenhum agente encontrado para "${searchQuery}"`
                      : 'Nenhum agente disponível nesta categoria'
                    }
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Limpar busca
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>


    </div>
  );
};

export default Agents;