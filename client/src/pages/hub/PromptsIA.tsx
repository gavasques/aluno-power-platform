
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { usePrompts } from '@/contexts/PromptsContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Search, 
  BrainCircuit,
  Image,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const PromptsIA = () => {
  const [, setLocation] = useLocation();
  const { prompts, categories, loading, searchPrompts } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPrompts = React.useMemo(() => {
    let result = searchQuery ? searchPrompts(searchQuery) : prompts;
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(prompt => prompt.category.id === selectedCategory);
    }
    return result;
  }, [prompts, searchQuery, selectedCategory, searchPrompts]);

  const handleCardClick = (promptId: string) => {
    setLocation(`/hub/prompts-ia/${promptId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner 
          message="Carregando prompts..." 
          size="xl" 
          className="min-h-[400px]" 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-medium shadow-lg">
          <BrainCircuit className="h-4 w-4 mr-2" />
          Biblioteca de Prompts IA
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Prompts de Inteligência Artificial
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Prompts otimizados para maximizar os resultados com ferramentas de IA
        </p>
      </div>

      {/* Search and Category Dropdown */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:w-auto mb-2 md:mb-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar prompts por título ou conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-72">
          <Select
            value={selectedCategory}
            onValueChange={v => setSelectedCategory(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card 
            key={prompt.id} 
            className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleCardClick(prompt.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{prompt.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {prompt.category.name}
                    </Badge>
                    {prompt.images && prompt.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Image className="h-3 w-3 mr-1" />
                        {prompt.images.length} {prompt.images.length === 1 ? 'imagem' : 'imagens'}
                      </Badge>
                    )}
                  </div>
                  {prompt.description && (
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum prompt encontrado</h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptsIA;
