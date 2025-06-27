import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  Star, 
  Play,
  Grid3X3,
  List,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Agent } from "../types/agent.types";

const categoryColors = {
  "E-commerce": "bg-blue-100 text-blue-800",
  "Marketing": "bg-purple-100 text-purple-800",
  "Conteúdo": "bg-green-100 text-green-800",
  "E-mails": "bg-orange-100 text-orange-800",
  "Anúncios": "bg-red-100 text-red-800",
  "Beta": "bg-yellow-100 text-yellow-800",
  "YouTube": "bg-red-100 text-red-800",
  "Copywriting": "bg-indigo-100 text-indigo-800",
  "Vendas": "bg-emerald-100 text-emerald-800"
};

// Get icon for agent based on category
const getAgentIcon = (category: string) => {
  const icons: Record<string, string> = {
    "E-commerce": "🛒",
    "Marketing": "📈",
    "Conteúdo": "✍️",
    "E-mails": "📧",
    "Anúncios": "📱",
    "Beta": "🧪",
    "YouTube": "🎥",
    "Copywriting": "💬",
    "Vendas": "💰"
  };
  return icons[category] || "🤖";
};

interface AgentCardProps {
  agent: any;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

function AgentCard({ agent, isFavorited, onToggleFavorite }: AgentCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getAgentIcon(agent.category || "")}</div>
            <button
              onClick={() => onToggleFavorite(agent.id)}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star 
                className={`w-5 h-5 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} 
              />
            </button>
          </div>
        </div>
        
        <div className="mb-3">
          <Badge 
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              categoryColors[agent.category as keyof typeof categoryColors] || 
              "bg-gray-100 text-gray-800"
            }`}
          >
            {agent.category || "Geral"}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {agent.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {agent.description || "Agente de IA para automação"}
        </p>
        
        <Button 
          asChild 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Link href={`/agents/${agent.id}`}>
            <Play className="w-4 h-4 mr-2" />
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch agents from API
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const categories = [
    "Favoritos",
    "Todos", 
    "Beta", 
    "Novo!", 
    "Vendas", 
    "YouTube", 
    "Copywriting", 
    "E-mails", 
    "Marketing", 
    "Anúncios", 
    "Conteúdo"
  ];

  const filteredAgents = agents.filter((agent: Agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (agent.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "Todos" || 
                           (selectedCategory === "Favoritos" && favorites.has(agent.id)) ||
                           agent.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredAgents = agents.slice(0, 3);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Featured Agents Section */}
      <div className="mb-12">
        <div className="flex items-center space-x-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Agentes em Destaque</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isFavorited={favorites.has(agent.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar agentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredAgents.length} agentes encontrados
            </span>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`text-sm ${
                selectedCategory === category 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className={`grid gap-6 ${
        viewMode === "grid" 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      }`}>
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isFavorited={favorites.has(agent.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum agente encontrado
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tente ajustar sua busca ou explorar diferentes categorias para encontrar o agente ideal.
          </p>
          <Button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Todos");
            }}
            variant="outline"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}