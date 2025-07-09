import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Link } from 'wouter';
import { SearchIcon, Building2, Globe, Star, Plus, Eye, Trash2, MapPin, Building, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Supplier, Department } from '@shared/schema';

const MySuppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [contactFilter, setContactFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar fornecedores
  const { data: suppliersResponse, isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
  });

  // Extract suppliers array from API response
  const suppliers: Supplier[] = useMemo(() => {
    if (!suppliersResponse) return [];
    
    if (Array.isArray(suppliersResponse)) {
      return suppliersResponse;
    }
    
    if (suppliersResponse?.data && Array.isArray(suppliersResponse.data)) {
      return suppliersResponse.data;
    }
    
    // Handle case where response is wrapped with success flag
    if (suppliersResponse?.success && suppliersResponse?.data) {
      return Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [];
    }
    
    console.warn('Unexpected suppliers response structure:', suppliersResponse);
    return [];
  }, [suppliersResponse]);

  // Buscar departamentos para mostrar categoria
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  // Mutation para deletar fornecedor
  const deleteMutation = useMutation({
    mutationFn: async (supplierId: number) => {
      return apiRequest(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: 'Fornecedor excluído',
        description: 'O fornecedor foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o fornecedor.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para alterar status
  const statusMutation = useMutation({
    mutationFn: async ({ supplierId, status }: { supplierId: number; status: string }) => {
      return apiRequest(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: 'Status atualizado',
        description: 'O status do fornecedor foi alterado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteSupplier = (supplierId: number) => {
    deleteMutation.mutate(supplierId);
  };

  const handleStatusToggle = (supplierId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    statusMutation.mutate({ supplierId, status: newStatus });
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Não informado";
    const department = departments.find(d => d.id === categoryId);
    return department?.name || "Não informado";
  };



  // Filtros avançados
  const filteredSuppliers = useMemo(() => {
    if (!Array.isArray(suppliers)) {
      console.warn('Suppliers is not an array:', suppliers);
      return [];
    }
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || categoryFilter === 'all' || supplier.categoryId === parseInt(categoryFilter);
      const matchesCountry = !countryFilter || countryFilter === 'all' || supplier.country?.toLowerCase().includes(countryFilter.toLowerCase());
      const matchesState = !stateFilter || stateFilter === 'all' || supplier.state?.toLowerCase().includes(stateFilter.toLowerCase());
      const matchesContact = !contactFilter || 
        supplier.commercialEmail?.toLowerCase().includes(contactFilter.toLowerCase()) ||
        supplier.supportEmail?.toLowerCase().includes(contactFilter.toLowerCase()) ||
        supplier.phone0800Sales?.includes(contactFilter) ||
        supplier.phone0800Support?.includes(contactFilter);
      
      return matchesSearch && matchesCategory && matchesCountry && matchesState && matchesContact;
    });
  }, [suppliers, searchTerm, categoryFilter, countryFilter, stateFilter, contactFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSuppliers, currentPage, itemsPerPage]);

  // Opções únicas para filtros
  const uniqueCountries = useMemo(() => {
    if (!Array.isArray(suppliers)) return [];
    const countries = suppliers.map(s => s.country).filter(Boolean);
    return [...new Set(countries)].sort();
  }, [suppliers]);

  const uniqueStates = useMemo(() => {
    if (!Array.isArray(suppliers)) return [];
    const states = suppliers.map(s => s.state).filter(Boolean);
    return [...new Set(states)].sort();
  }, [suppliers]);

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
        <div className="mb-6 space-y-4">
          {/* Busca */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome da empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros Avançados */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os países" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os países</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por contato (email/telefone)"
              value={contactFilter}
              onChange={(e) => setContactFilter(e.target.value)}
              className="w-64"
            />

            {(categoryFilter && categoryFilter !== 'all' || countryFilter && countryFilter !== 'all' || stateFilter && stateFilter !== 'all' || contactFilter) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCategoryFilter('all');
                  setCountryFilter('all');
                  setStateFilter('all');
                  setContactFilter('');
                  setCurrentPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas e Paginação */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{suppliers.length} fornecedores</span>
            <span>•</span>
            <span>{filteredSuppliers.length} resultados</span>
            <span>•</span>
            <span>Página {currentPage} de {totalPages}</span>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Lista de Fornecedores */}
        <Card className="bg-white border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa & Categoria</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {supplier.tradeName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-3 w-3" />
                        {getCategoryName(supplier.categoryId)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {supplier.country || "Não informado"}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {supplier.state && supplier.city 
                          ? `${supplier.city}, ${supplier.state}`
                          : supplier.state || supplier.city || "Não informado"
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={supplier.status === 'ativo'}
                          onCheckedChange={() => handleStatusToggle(supplier.id, supplier.status || 'ativo')}
                          disabled={statusMutation.isPending}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <span className="text-sm">
                          {supplier.status === 'ativo' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                              Inativo
                            </Badge>
                          )}
                        </span>
                      </div>

                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/minha-area/fornecedores/${supplier.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o fornecedor "{supplier.tradeName}"? 
                              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sim, excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Paginação inferior */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || (categoryFilter && categoryFilter !== 'all') || (countryFilter && countryFilter !== 'all') || (stateFilter && stateFilter !== 'all') || contactFilter
                ? 'Tente ajustar seus filtros de busca.' 
                : 'Você ainda não possui fornecedores cadastrados.'}
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