import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Search, 
  ArrowLeft,
  Filter,
  SortDesc,
  Clock,
  Zap,
  Bug,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Update } from "@shared/schema";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

const Updates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  // Fetch published updates
  const { data: updatesData = [], isLoading } = useQuery<Update[]>({
    queryKey: ['/api/updates/published'],
    queryFn: async () => {
      const response = await fetch('/api/updates/published');
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Get unique types and priorities
  const types = Array.from(new Set(updatesData.map(update => update.type).filter(Boolean)));
  const priorities = Array.from(new Set(updatesData.map(update => update.priority).filter(Boolean)));

  // Filter and sort updates
  const filteredUpdates = updatesData
    .filter(update => {
      const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           update.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           update.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || update.type === selectedType;
      const matchesPriority = !selectedPriority || update.priority === selectedPriority;
      return matchesSearch && matchesType && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, normal: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
        if (aPriority !== bPriority) return bPriority - aPriority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const highPriorityUpdates = updatesData.filter(update => update.priority === 'high');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return Plus;
      case 'improvement': return Zap;
      case 'bugfix': return Bug;
      default: return Users;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return 'Nova Funcionalidade';
      case 'improvement': return 'Melhoria';
      case 'bugfix': return 'Correção';
      default: return 'Atualização';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'normal': return 'Normal';
      default: return 'Normal';
    }
  };

  return (
    <PermissionGuard featureCode="content.updates">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white text-sm font-medium shadow-lg">
              <Users className="h-4 w-4 mr-2" />
              Central de Novidades
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Todas as Novidades
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Acompanhe as últimas atualizações, melhorias e novos recursos da plataforma
            </p>
          </div>
        </div>

        {/* High Priority Updates Section */}
        {highPriorityUpdates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-red-500" />
              Atualizações Importantes
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {highPriorityUpdates.slice(0, 3).map((update) => {
                const TypeIcon = getTypeIcon(update.type);
                return (
                  <Card key={update.id} className="overflow-hidden hover:shadow-lg transition-shadow border-red-200">
                    <div className="bg-gradient-to-r from-red-400 to-red-500 h-2"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex items-start gap-2">
                          <TypeIcon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          {update.title}
                        </CardTitle>
                        {update.version && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 shrink-0">
                            v{update.version}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-red-200 text-red-600">
                          {getTypeLabel(update.type)}
                        </Badge>
                        <Badge className="bg-red-100 text-red-800">
                          Prioridade Alta
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {update.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {update.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(update.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(update.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar novidades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Todos os tipos</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {getTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="pl-4 pr-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Todas as prioridades</option>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {getPriorityLabel(priority)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")}
                  className="flex items-center gap-2"
                >
                  <SortDesc className="h-4 w-4" />
                  {sortBy === "date" ? "Data" : "Prioridade"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* All Updates Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Todas as Novidades ({filteredUpdates.length})
          </h2>
          
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUpdates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpdates.map((update) => {
                const TypeIcon = getTypeIcon(update.type);
                return (
                  <Card key={update.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors flex items-start gap-2">
                          <TypeIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          {update.title}
                        </CardTitle>
                        {update.version && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 shrink-0">
                            v{update.version}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${
                          update.type === 'feature' ? 'border-blue-200 text-blue-600' :
                          update.type === 'improvement' ? 'border-green-200 text-green-600' :
                          update.type === 'bugfix' ? 'border-red-200 text-red-600' :
                          'border-gray-200 text-gray-600'
                        }`}>
                          {getTypeLabel(update.type)}
                        </Badge>
                        <Badge className={`${
                          update.priority === 'high' ? 'bg-red-100 text-red-800' :
                          update.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getPriorityLabel(update.priority)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {update.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {update.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(update.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(update.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Nenhuma novidade encontrada
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedType || selectedPriority
                    ? "Tente ajustar os filtros de busca" 
                    : "Nenhuma novidade foi publicada ainda"
                  }
                </p>
                {(searchTerm || selectedType || selectedPriority) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("");
                      setSelectedPriority("");
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
};

export default Updates;