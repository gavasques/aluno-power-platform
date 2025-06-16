
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Wrench } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";

const Tools = () => {
  const { tools, toolTypes } = useTools();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const navigate = useNavigate();

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tool.typeId?.toString() === selectedType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleToolClick = (toolId: number) => {
    navigate(`/hub/ferramentas/${toolId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium shadow-lg">
            <Wrench className="h-4 w-4 mr-2" />
            Ferramentas Verificadas
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Catálogo de Ferramentas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Softwares para e-commerce com análises detalhadas e avaliações da comunidade
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, categoria ou funcionalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full lg:w-72">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
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
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <Card key={tool.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      {tool.verified && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {toolTypes.find(t => t.id === tool.typeId)?.name || tool.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Avaliação LV:</span>
                      <div className="flex">{renderStars(tool.officialRating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {tool.officialRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Usuários:</span>
                      <div className="flex">{renderStars(tool.userRating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {tool.userRating} ({tool.reviewCount})
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleToolClick(tool.id)}>
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma ferramenta encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
