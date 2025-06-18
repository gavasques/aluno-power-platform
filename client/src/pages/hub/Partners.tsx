
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { usePartners } from '@/contexts/PartnersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink,
} from 'lucide-react';
import { PARTNER_CATEGORIES } from '@/types/partner';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const Partners = () => {
  const [, setLocation] = useLocation();
  const { partners, loading, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  // Use "all" instead of "" for Select's no-filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPartners = React.useMemo(() => {
    let result = searchQuery ? searchPartners(searchQuery) : partners;
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(partner => partner.categoryId?.toString() === selectedCategory);
    }
    return result;
  }, [partners, searchQuery, selectedCategory, searchPartners]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando parceiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium shadow-lg">
          <Shield className="h-4 w-4 mr-2" />
          Parceiros Verificados
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Diretório de Parceiros
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Conecte-se com prestadores de serviços verificados e especializados em e-commerce
        </p>
      </div>

      {/* Search and Category Dropdown */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:w-auto mb-2 md:mb-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, especialidade ou categoria..."
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
              <SelectItem value="all">Todos</SelectItem>
              {PARTNER_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {partner.logo && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={partner.logo} 
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      {partner.isVerified && (
                        <Badge variant="default" className="bg-green-500 mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {PARTNER_CATEGORIES.find(cat => cat.id === partner.categoryId?.toString())?.name || 'Categoria não definida'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {partner.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{partner.averageRating ? Number(partner.averageRating).toFixed(1) : '0.0'}</span>
                  <span>({partner.totalReviews || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Localização disponível</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => setLocation(`/hub/parceiros/${partner.id}`)}
                >
                  Ver Perfil
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                {partner.website && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum parceiro encontrado</h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      )}
    </div>
  );
};

export default Partners;
