import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchIcon, Building2, Globe, Mail, Star, Plus, Eye } from 'lucide-react';
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedSupplier(supplier)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{supplier.tradeName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Nome Comercial:</span>
                              <p className="font-medium">{supplier.tradeName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Razão Social:</span>
                              <p className="font-medium">{supplier.corporateName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <p className="font-medium">
                                {supplier.isVerified ? (
                                  <Badge className="bg-green-100 text-green-700">Verificado</Badge>
                                ) : (
                                  <Badge variant="outline">Não verificado</Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {supplier.description && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                            <p className="text-sm text-gray-600">{supplier.description}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Contatos</h4>
                          <div className="space-y-2 text-sm">
                            {supplier.commercialEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Comercial:</span>
                                <span>{supplier.commercialEmail}</span>
                              </div>
                            )}
                            {supplier.supportEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Suporte:</span>
                                <span>{supplier.supportEmail}</span>
                              </div>
                            )}
                            {supplier.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Website:</span>
                                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {supplier.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {supplier.notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                            <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">
                              <p className="text-sm text-gray-700">{supplier.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {supplier.commercialEmail && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${supplier.commercialEmail}`}>
                        <Mail className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
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