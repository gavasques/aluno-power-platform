
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Wrench, Globe, ArrowRight, Filter, Grid2X2, List, ChevronRight, TrendingUp, Package } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Tools = () => {
  // Fetch tools directly using TanStack Query
  const { data: tools = [] } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: () => apiRequest('/api/tools'),
  });

  // Fetch tool types
  const { data: toolTypes = [] } = useQuery({
    queryKey: ['/api/tool-types'],
    queryFn: () => apiRequest('/api/tool-types'),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedBrazilSupport, setSelectedBrazilSupport] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [, setLocation] = useLocation();

  // Featured tools (you can customize which tools are featured)
  const featuredToolIds = [1, 2, 3, 4]; // Example IDs - you can change these
  const featuredTools = tools.filter(tool => featuredToolIds.includes(tool.id)).slice(0, 4);

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.features?.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || tool.typeId?.toString() === selectedType;
    const matchesBrazilSupport = selectedBrazilSupport.length === 0 || 
                                 (tool.brazilSupport && selectedBrazilSupport.includes(tool.brazilSupport));
    const matchesRating = selectedRating === "all" || 
                         (selectedRating === "4+" && Number(tool.averageRating) >= 4) ||
                         (selectedRating === "3+" && Number(tool.averageRating) >= 3);
    return matchesSearch && matchesType && matchesBrazilSupport && matchesRating;
  });

  // Sort tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    switch(sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "rating":
        return (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0);
      case "reviews":
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
      />
    ));
  };

  const handleToolClick = (toolId: number) => {
    setLocation(`/hub/ferramentas/${toolId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Minimalist Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Wrench className="h-4 w-4" />
            <span>Ferramentas Verificadas</span>
            <Badge variant="secondary" className="text-xs">
              {tools.length} disponíveis
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catálogo de Ferramentas
          </h1>
          <p className="text-gray-600">
            Ferramentas selecionadas para e-commerce com análises detalhadas
          </p>
        </div>

        {/* Featured Tools Banner Section */}
        {featuredTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ferramentas em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTools.map(tool => (
                <Card 
                  key={tool.id}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-12 h-12 rounded-lg bg-white/20 p-2 object-contain"
                      />
                      <Badge className="bg-white/20 text-white border-0">
                        Destaque
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{tool.name}</h3>
                    <p className="text-white/80 text-sm line-clamp-2 mb-3">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(Number(tool.averageRating) || 0)}
                        <span className="text-white/90 ml-1">{tool.averageRating || '0.0'}</span>
                      </div>
                      {tool.verified && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Advanced Filters Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Categoria
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {toolTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Avaliação Mínima
                </Label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Qualquer avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer avaliação</SelectItem>
                    <SelectItem value="4+">4+ estrelas</SelectItem>
                    <SelectItem value="3+">3+ estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brazil Support Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Suporte no Brasil
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="works"
                      checked={selectedBrazilSupport.includes('works')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBrazilSupport([...selectedBrazilSupport, 'works']);
                        } else {
                          setSelectedBrazilSupport(selectedBrazilSupport.filter(s => s !== 'works'));
                        }
                      }}
                    />
                    <label htmlFor="works" className="text-sm text-gray-600 cursor-pointer">
                      Funciona no Brasil
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="local"
                      checked={selectedBrazilSupport.includes('local')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBrazilSupport([...selectedBrazilSupport, 'local']);
                        } else {
                          setSelectedBrazilSupport(selectedBrazilSupport.filter(s => s !== 'local'));
                        }
                      }}
                    />
                    <label htmlFor="local" className="text-sm text-gray-600 cursor-pointer">
                      Suporte local
                    </label>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Ordenar por
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                    <SelectItem value="rating">Melhor avaliação</SelectItem>
                    <SelectItem value="reviews">Mais avaliações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and View Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar ferramentas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {sortedTools.length} resultados
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="px-2"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools List/Grid */}
            {viewMode === "list" ? (
              <div className="space-y-3">
                {sortedTools.map(tool => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <div className="p-6 flex items-center gap-6">
                      {/* Logo */}
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      />

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {tool.name}
                              </h3>
                              {tool.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {toolTypes.find(t => t.id === tool.typeId?.toString())?.name || 'Ferramenta'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {tool.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                {renderStars(Number(tool.averageRating) || 0)}
                                <span className="font-medium text-gray-700">
                                  {tool.averageRating || '0.0'}
                                </span>
                                <span className="text-gray-500">
                                  ({tool.totalReviews || 0} avaliações)
                                </span>
                              </div>
                              {tool.brazilSupport && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Globe className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">
                                    {tool.brazilSupport === 'works' ? 'Funciona no Brasil' : 'Suporte local'}
                                  </span>
                                </div>
                              )}
                              {tool.features && tool.features.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-gray-500">
                                    {tool.features.length} recursos
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTools.map(tool => (
                  <Card 
                    key={tool.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {tool.name}
                            </h3>
                            {tool.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {toolTypes.find(t => t.id === tool.typeId?.toString())?.name || 'Ferramenta'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderStars(Number(tool.averageRating) || 0)}
                          <span className="text-sm font-medium text-gray-700">
                            {tool.averageRating || '0.0'}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver mais
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {sortedTools.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma ferramenta encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou termos de busca
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedBrazilSupport([]);
                    setSelectedRating("all");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
