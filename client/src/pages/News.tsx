import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rss, 
  Calendar, 
  Star, 
  ArrowLeft,
  Filter,
  SortDesc,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { News } from "@shared/schema";
import { AdvancedSearch, SearchFilter } from "@/components/ui/advanced-search";

const News = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "featured">("date");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

  // Fetch published news
  const { data: newsData = [], isLoading } = useQuery<News[]>({
    queryKey: ['/api/news/published'],
    queryFn: async () => {
      const response = await fetch('/api/news/published');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
  });

  // Get unique categories
  const categories = newsData
    .map(news => news.category)
    .filter((category): category is string => Boolean(category))
    .filter((category, index, array) => array.indexOf(category) === index);

  // Available filters for advanced search
  const availableFilters = [
    {
      key: 'category',
      label: 'Categoria',
      type: 'select' as const,
      options: categories.map(cat => ({ value: cat, label: cat }))
    },
    {
      key: 'featured',
      label: 'Destaque',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    },
    {
      key: 'date',
      label: 'Data',
      type: 'date' as const
    }
  ];

  // Advanced search handler
  const handleAdvancedSearch = (query: string, filters: SearchFilter[]) => {
    setSearchTerm(query);
    setActiveFilters(filters);
  };

  // Filter and sort news with advanced filters
  const filteredNews = newsData
    .filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           news.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           news.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = activeFilters.every(filter => {
        switch (filter.key) {
          case 'category':
            return !filter.value || news.category === filter.value;
          case 'featured':
            return !filter.value || news.isFeatured.toString() === filter.value;
          case 'date':
            if (!filter.value) return true;
            const filterDate = new Date(filter.value);
            const newsDate = new Date(news.createdAt);
            return newsDate.toDateString() === filterDate.toDateString();
          default:
            return true;
        }
      });
      
      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortBy === "featured") {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const featuredNews = newsData.filter(news => news.isFeatured);

  return (
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
            <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white text-sm font-medium shadow-lg">
              <Rss className="h-4 w-4 mr-2" />
              Central de Notícias
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Todas as Notícias
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fique por dentro das últimas novidades e atualizações importantes
            </p>
          </div>
        </div>

        {/* Featured News Section */}
        {featuredNews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Notícias em Destaque
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredNews.slice(0, 3).map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow border-yellow-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shrink-0">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    </div>
                    {news.category && (
                      <Badge variant="outline" className="w-fit">
                        {news.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {news.summary && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {news.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(news.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(news.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Search and Analytics */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="space-y-4">
              <AdvancedSearch
                placeholder="Buscar notícias por título, conteúdo ou resumo..."
                onSearch={handleAdvancedSearch}
                availableFilters={availableFilters}
              />
              
              {/* Analytics Summary */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {filteredNews.length} de {newsData.length} notícias
                  </Badge>
                </div>
                {activeFilters.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    {activeFilters.length} filtro{activeFilters.length > 1 ? 's' : ''} ativo{activeFilters.length > 1 ? 's' : ''}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {newsData.filter(n => n.isFeatured).length} em destaque
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* All News Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Todas as Notícias ({filteredNews.length})
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
          ) : filteredNews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </CardTitle>
                      {news.isFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shrink-0">
                          <Star className="h-3 w-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                    {news.category && (
                      <Badge variant="outline" className="w-fit">
                        {news.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {news.summary && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {news.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(news.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(news.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto">
                  <Rss className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory 
                    ? "Tente ajustar os filtros de busca" 
                    : "Nenhuma notícia foi publicada ainda"
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
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
  );
};

export default News;