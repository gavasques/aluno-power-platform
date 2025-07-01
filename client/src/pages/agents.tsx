import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  Star, 
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  ShoppingCart,
  Youtube,
  Mail,
  PenTool,
  Target,
  MessageSquare,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Agent } from "../types/agent.types";

// Configuração das cores e ícones das categorias - padrão Lovable/DeepSeek
const categoryConfig = {
  "E-commerce": { 
    color: "bg-blue-50 text-blue-700 border-blue-200", 
    icon: ShoppingCart,
    gradient: "from-blue-500 to-cyan-500"
  },
  "Marketing": { 
    color: "bg-purple-50 text-purple-700 border-purple-200", 
    icon: TrendingUp,
    gradient: "from-purple-500 to-pink-500"
  },
  "Conteúdo": { 
    color: "bg-green-50 text-green-700 border-green-200", 
    icon: PenTool,
    gradient: "from-green-500 to-emerald-500"
  },
  "E-mails": { 
    color: "bg-orange-50 text-orange-700 border-orange-200", 
    icon: Mail,
    gradient: "from-orange-500 to-red-500"
  },
  "Anúncios": { 
    color: "bg-red-50 text-red-700 border-red-200", 
    icon: Target,
    gradient: "from-red-500 to-pink-500"
  },
  "YouTube": { 
    color: "bg-red-50 text-red-700 border-red-200", 
    icon: Youtube,
    gradient: "from-red-500 to-red-600"
  },
  "Copywriting": { 
    color: "bg-indigo-50 text-indigo-700 border-indigo-200", 
    icon: MessageSquare,
    gradient: "from-indigo-500 to-purple-500"
  },
  "Vendas": { 
    color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    icon: Zap,
    gradient: "from-emerald-500 to-green-500"
  }
};

// Obter configuração da categoria
const getCategoryConfig = (category: string) => {
  return categoryConfig[category as keyof typeof categoryConfig] || {
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: Bot,
    gradient: "from-gray-500 to-slate-500"
  };
};

interface AgentCardProps {
  agent: Agent;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

function AgentCard({ agent, isFavorited, onToggleFavorite }: AgentCardProps) {
  const categoryInfo = getCategoryConfig(agent.category);
  const IconComponent = categoryInfo.icon;
  
  // Verificar se é um agente novo ou beta
  const isNew = agent.createdAt && new Date(agent.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isBeta = agent.name.toLowerCase().includes('beta') || agent.description?.toLowerCase().includes('beta');
  
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white">
      {/* Card Header com gradiente */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Ícone da categoria com background gradiente */}
            <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo.gradient} shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            {/* Badges de status */}
            <div className="flex flex-col space-y-1">
              {isNew && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Novo!
                </Badge>
              )}
              {isBeta && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 py-0.5">
                  Beta
                </Badge>
              )}
            </div>
          </div>
          
          {/* Botão de favoritar */}
          <button
            onClick={() => onToggleFavorite(agent.id)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <Star 
              className={`w-5 h-5 transition-all duration-200 ${
                isFavorited 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300 group-hover:text-amber-400'
              }`} 
            />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Badge da categoria */}
        <Badge 
          variant="outline"
          className={`mb-3 text-xs font-medium border ${categoryInfo.color}`}
        >
          {agent.category || "Geral"}
        </Badge>
        
        {/* Nome do agente */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {agent.name}
        </h3>
        
        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
          {agent.description || "Agente de IA para automação e otimização"}
        </p>
        
        {/* Informações técnicas removidas para interface mais limpa */}
        
        {/* Botão de ação */}
        <Button 
          asChild 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Link href={agent.id === 'agent-amazon-listings' ? '/agents/amazon-listings-optimizer' : `/agents/${agent.id}`}>
            <Sparkles className="w-4 h-4 mr-2" />
            Usar Agente
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Buscar agentes da API
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Categorias disponíveis para filtros
  const categories = [
    { name: "Todos", icon: Filter },
    { name: "Favoritos", icon: Star },
    { name: "Novo!", icon: Sparkles },
    { name: "Beta", icon: Bot },
    { name: "Vendas", icon: Zap },
    { name: "YouTube", icon: Youtube },
    { name: "Copywriting", icon: MessageSquare },
    { name: "E-mails", icon: Mail },
    { name: "Marketing", icon: TrendingUp },
    { name: "Anúncios", icon: Target },
    { name: "Conteúdo", icon: PenTool },
    { name: "E-commerce", icon: ShoppingCart }
  ];

  // Filtrar agentes baseado na busca e categoria
  const filteredAgents = agents.filter((agent: Agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (agent.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const isNew = agent.createdAt && new Date(agent.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    const isBeta = agent.name.toLowerCase().includes('beta') || agent.description?.toLowerCase().includes('beta');
    
    let matchesCategory = false;
    
    switch (selectedCategory) {
      case "Todos":
        matchesCategory = true;
        break;
      case "Favoritos":
        matchesCategory = favorites.has(agent.id);
        break;
      case "Novo!":
        matchesCategory = isNew;
        break;
      case "Beta":
        matchesCategory = isBeta;
        break;
      default:
        matchesCategory = agent.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Alternar favorito
  const toggleFavorite = (agentId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(agentId)) {
        newFavorites.delete(agentId);
      } else {
        newFavorites.add(agentId);
      }
      return newFavorites;
    });
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-16 bg-gray-200 rounded-lg w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header da página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Agentes de IA
          </h1>
          <p className="text-gray-600 text-lg">
            Descubra e use agentes especializados para otimizar seu negócio
          </p>
        </div>

        {/* Barra de busca e contadores */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar agentes por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm border">
                {filteredAgents.length} {filteredAgents.length === 1 ? 'agente encontrado' : 'agentes encontrados'}
              </span>
            </div>
          </div>

          {/* Filtros de categoria */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              const count = category.name === "Todos" ? agents.length :
                          category.name === "Favoritos" ? favorites.size :
                          agents.filter(agent => {
                            if (category.name === "Novo!") {
                              return agent.createdAt && new Date(agent.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
                            }
                            if (category.name === "Beta") {
                              return agent.name.toLowerCase().includes('beta') || agent.description?.toLowerCase().includes('beta');
                            }
                            return agent.category === category.name;
                          }).length;
              
              return (
                <Button
                  key={`${category.name}-${index}`}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`text-sm transition-all duration-200 ${
                    isSelected 
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                  {count > 0 && (
                    <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Filtros ativos */}
          {(searchQuery || selectedCategory !== "Todos") && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Filtros ativos:</span>
              {searchQuery && (
                <Badge variant="outline" className="text-xs">
                  Busca: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== "Todos" && (
                <Badge variant="outline" className="text-xs">
                  Categoria: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("Todos")}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>

        {/* Grid de agentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAgents.map((agent: Agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isFavorited={favorites.has(agent.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Estado vazio */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Bot className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Nenhum agente encontrado
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== "Todos" 
                ? "Tente ajustar seus filtros para encontrar o agente ideal para suas necessidades."
                : "Ainda não temos agentes disponíveis. Volte em breve para descobrir nossas novidades!"
              }
            </p>
            {(searchQuery || selectedCategory !== "Todos") && (
              <Button 
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}