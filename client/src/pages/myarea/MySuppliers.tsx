import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, Building2, Globe, Mail, Star, Phone, MapPin, Filter, Users } from 'lucide-react';
import { Supplier } from '@shared/schema';

const MySuppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Buscar fornecedores
  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Função para renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Filtros simplificados
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-muted-foreground">Carregando fornecedores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Fornecedores</h1>
          <p className="text-gray-600">
            Gerencie sua rede de fornecedores e parcerias comerciais
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-80">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome da empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Fornecedores</p>
                  <p className="text-2xl font-bold text-blue-600">{suppliers.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fornecedores Verificados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {suppliers.filter(s => s.isVerified).length}
                  </p>
                </div>
                <Badge className="h-8 w-8 rounded-full bg-green-100 text-green-600">✓</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resultados</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredSuppliers.length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Com Notas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {suppliers.filter(s => s.notes).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Fornecedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {supplier.tradeName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {supplier.corporateName}
                    </p>
                  </div>
                  {supplier.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                      <Badge className="h-3 w-3 rounded-full bg-green-500 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Descrição */}
                {supplier.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                {/* Notas */}
                {supplier.notes && (
                  <p className="text-sm text-gray-700 mb-4 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400 line-clamp-2">
                    {supplier.notes}
                  </p>
                )}

                {/* Contatos */}
                <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                  {supplier.commercialEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Comercial
                    </div>
                  )}
                  {supplier.supportEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Suporte
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Site
                    </div>
                  )}
                  {supplier.instagram && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Instagram
                    </div>
                  )}
                </div>

                {/* Avaliação simplificada */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(Number(supplier.averageRating) || 0)}</div>
                  <span className="text-sm text-muted-foreground">
                    {(Number(supplier.averageRating) || 0).toFixed(1)} ({supplier.totalReviews || 0} avaliações)
                  </span>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Tente ajustar seus filtros de busca.' : 'Você ainda não possui fornecedores cadastrados.'}
            </p>
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySuppliers;