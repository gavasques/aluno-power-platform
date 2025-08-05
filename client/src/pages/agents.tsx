import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { CreditCostBadge, CreditCostButton } from "@/components/CreditCostButton";
import { useUserCreditBalance } from "@/hooks/useUserCredits";
import type { Agent } from "../types/agent.types";

// Mapeamento entre IDs dos agentes e nomes das features no banco
const AGENT_FEATURE_MAP: Record<string, string> = {
  "agent-amazon-listings": "agents.amazon_listing",
  "html-description-generator": "agents.html_descriptions", 
  "bullet-points-generator": "agents.bullet_points",
  "agent-amazon-product-photography": "agents.main_image_editor",
  "agent-lifestyle-with-model": "agents.lifestyle_model",
  "agent-infographic-generator": "agents.infographic_editor", 
  "advanced-infographic-generator": "agents.advanced_infographic",
  "amazon-customer-service": "agents.customer_service",
  "amazon-negative-reviews": "agents.negative_reviews"
};

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
  const { balance: userBalance } = useUserCreditBalance();
  
  // Verificar se é um agente novo, beta ou premium
  const isNew = agent.createdAt && new Date(agent.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isBeta = agent.name.toLowerCase().includes('beta') || agent.description?.toLowerCase().includes('beta');
  const isPremium = agent.id === 'agent-amazon-listings';
  
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
              {isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-2 py-0.5 font-semibold shadow-sm">
                  ⭐ Premium
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
        {/* Badge da categoria e créditos */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="outline"
            className={`text-xs font-medium border ${categoryInfo.color}`}
          >
            {agent.category || "Geral"}
          </Badge>
          <CreditCostBadge 
            featureName={AGENT_FEATURE_MAP[agent.id] || `agents.${agent.id}`}
            className="text-xs"
          />
        </div>
        
        {/* Nome do agente */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {agent.name}
        </h3>
        
        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
          {agent.description || "Agente de IA para automação e otimização"}
        </p>
        
        {/* Informações técnicas removidas para interface mais limpa */}
        
        {/* Botão de ação com créditos */}
        <CreditCostButton
          featureName={AGENT_FEATURE_MAP[agent.id] || `agents.${agent.id}`}
          userBalance={userBalance}
          onProcess={() => {
            const href = agent.id === 'agent-amazon-listings' ? '/agents/amazon-listings-optimizer' : `/agentes/${agent.id}`;
            window.location.href = href;
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          showCreditsInButton={false}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Usar Agente
        </CreditCostButton>
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
  const { balance: userBalance } = useUserCreditBalance();

  // Categorias disponíveis para filtros - baseadas nos agentes existentes
  const categories = [
    { name: "Todos", icon: Filter },
    { name: "Favoritos", icon: Star },
    { name: "Novo!", icon: Sparkles },
    { name: "Beta", icon: Bot },
    { name: "Amazon", icon: ShoppingCart },
    { name: "Amazon FBA", icon: ShoppingCart },
    { name: "E-commerce", icon: ShoppingCart },
    { name: "Imagens", icon: PenTool },
    { name: "Edição de Imagem", icon: PenTool },
    { name: "Geração de Imagens", icon: PenTool },
    { name: "Customer Service", icon: Mail }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Agentes de IA</h1>
        <p className="text-muted-foreground">
          Descubra e use agentes especializados para otimizar seu negócio
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar agentes por nome ou descrição..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
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
            <Badge 
              key={category.name}
              variant={isSelected ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => setSelectedCategory(category.name)}
            >
              <IconComponent className="w-3 h-3 mr-1" />
              {category.name}
              {count > 0 && ` (${count})`}
            </Badge>
          );
        })}
      </div>

      {/* Contador de resultados */}
      {(searchQuery || selectedCategory !== "Todos") && (
        <div className="text-sm text-muted-foreground">
          {filteredAgents.length} {filteredAgents.length === 1 ? 'agente encontrado' : 'agentes encontrados'}
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-2 h-6 px-2 text-xs"
            >
              Limpar filtros
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Grid de agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="text-center py-12">
          <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum agente encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== "Todos" 
              ? "Tente ajustar seus filtros para encontrar o agente ideal."
              : "Ainda não temos agentes disponíveis."
            }
          </p>
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button 
              onClick={clearFilters}
              variant="outline"
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