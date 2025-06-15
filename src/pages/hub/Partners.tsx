
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter
} from 'lucide-react';
import { PARTNER_CATEGORIES } from '@/types/partner';

const Partners = () => {
  const navigate = useNavigate();
  const { partners, loading, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredPartners = React.useMemo(() => {
    let result = searchQuery ? searchPartners(searchQuery) : partners;
    
    if (selectedCategory) {
      result = result.filter(partner => partner.category.id === selectedCategory);
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, especialidade ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Todos
          </Button>
          {PARTNER_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PARTNER_CATEGORIES.map((category) => {
          const categoryCount = partners.filter(p => p.category.id === category.id).length;
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? '' : category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {categoryCount} parceiro{categoryCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    {partner.isVerified && (
                      <Badge variant="default" className="bg-green-500">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {partner.category.name}
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
                  <span className="font-medium">{partner.averageRating.toFixed(1)}</span>
                  <span>({partner.totalReviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.address.city}, {partner.address.state}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/hub/parceiros/${partner.id}`)}
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
