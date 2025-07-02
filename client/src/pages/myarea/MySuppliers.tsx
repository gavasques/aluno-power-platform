import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { SearchIcon, Building2, Globe, Star, Plus, Eye } from 'lucide-react';
import { Supplier } from '@shared/schema';

const MySuppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Buscar fornecedores
  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });



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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Fornecedores</h1>
            <p className="text-gray-600">
              Gerencie sua rede de fornecedores e parcerias comerciais
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fornecedor
          </Button>
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

        {/* Estatísticas Simples */}
        <div className="mb-6 flex gap-4 text-sm text-gray-600">
          <span>{suppliers.length} fornecedores</span>
          <span>•</span>
          <span>{filteredSuppliers.length} resultados</span>
          <span>•</span>
          <span>{suppliers.filter(s => s.isVerified).length} verificados</span>
        </div>

        {/* Lista de Fornecedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{supplier.tradeName}</h3>
                    <p className="text-sm text-gray-600">{supplier.corporateName}</p>
                  </div>
                  {supplier.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Verificado
                    </Badge>
                  )}
                </div>

                {supplier.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link href={`/minha-area/fornecedores/${supplier.id}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </Link>
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