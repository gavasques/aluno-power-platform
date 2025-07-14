
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Wrench, ExternalLink, Globe, Heart, Users, Trophy, ArrowRight, Filter } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useTools } from "@/contexts/ToolsContext";

const Tools = () => {
  const { tools, toolTypes } = useTools();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [, setLocation] = useLocation();

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
    setLocation(`/hub/ferramentas/${toolId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Wrench className="h-5 w-5 mr-3" />
            Ferramentas Verificadas
            <Trophy className="h-4 w-4 ml-3" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Catálogo de Ferramentas
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Descubra softwares para e-commerce com análises detalhadas e avaliações autênticas da nossa comunidade
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>+1000 usuários</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Verificado</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Curadoria especializada</span>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Buscar ferramentas, categorias ou funcionalidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              />
            </div>
            <div className="w-full lg:w-80">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12 text-base border-slate-200 rounded-xl bg-white/50">
                  <Filter className="h-4 w-4 mr-2" />
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
          {filteredTools.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Mostrando {filteredTools.length} ferramenta{filteredTools.length !== 1 ? 's' : ''} 
              {selectedType !== "all" && " na categoria selecionada"}
            </div>
          )}
        </div>

        {/* Modern Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTools.map(tool => (
            <Card 
              key={tool.id} 
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
              onClick={() => handleToolClick(tool.id)}
            >
              {/* Card Header with Enhanced Design */}
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    {tool.verified && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </CardTitle>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 font-medium"
                    >
                      {toolTypes.find(t => t.id === tool.typeId?.toString())?.name || 'Ferramenta'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Enhanced Card Content */}
              <CardContent className="space-y-6">
                <p className="text-slate-600 leading-relaxed line-clamp-3 text-sm">
                  {tool.description}
                </p>

                {/* Enhanced Rating Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(Number(tool.averageRating) || 0)}</div>
                      <span className="text-sm font-semibold text-slate-700">
                        {tool.averageRating || '0.0'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {tool.totalReviews || 0} avaliações
                    </span>
                  </div>

                  {/* Features Preview */}
                  {tool.features && tool.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Principais recursos</h4>
                      <div className="flex flex-wrap gap-1">
                        {tool.features.slice(0, 3).map((feature, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {tool.features.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-400 border-slate-200">
                            +{tool.features.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Brazil Support Indicator */}
                  {tool.brazilSupport && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        {tool.brazilSupport === 'works' ? 'Funciona no Brasil' : 
                         tool.brazilSupport === 'limited' ? 'Suporte limitado' : 'Suporte local'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Enhanced Action Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToolClick(tool.id);
                  }}
                >
                  <span>Ver Detalhes Completos</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
              <Search className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Nenhuma ferramenta encontrada</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Não encontramos ferramentas que correspondam aos seus critérios de busca.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Tente:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="bg-white text-slate-600">Ajustar os filtros</Badge>
                <Badge variant="outline" className="bg-white text-slate-600">Buscar termos diferentes</Badge>
                <Badge variant="outline" className="bg-white text-slate-600">Verificar a categoria</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
