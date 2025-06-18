
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTemplates } from '@/contexts/TemplatesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const Templates = () => {
  const [, setLocation] = useLocation();
  const { templates, categories, loading, searchTemplates } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = React.useMemo(() => {
    let result = searchQuery ? searchTemplates(searchQuery) : templates;
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(template => template.category.id === selectedCategory);
    }
    return result;
  }, [templates, searchQuery, selectedCategory, searchTemplates]);

  const handleCardClick = (templateId: string) => {
    navigate(`/hub/templates/${templateId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white text-sm font-medium shadow-lg">
          <FileText className="h-4 w-4 mr-2" />
          Biblioteca de Templates
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Templates de Comunicação
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Modelos prontos para e-mails, negociações e comunicação com fornecedores
        </p>
      </div>

      {/* Search and Category Dropdown */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:w-auto mb-2 md:mb-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar templates por título ou conteúdo..."
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleCardClick(template.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {template.category.name}
                  </Badge>
                  {template.description && (
                    <p className="text-sm text-gray-600">{template.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum template encontrado</h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      )}
    </div>
  );
};

export default Templates;
