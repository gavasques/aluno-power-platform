import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Edit, 
  Trash2,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { UserCompany } from '@shared/schema';
import { CompanyForm } from './components/CompanyForm';

export function MinhasEmpresas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<UserCompany | null>(null);
  
  const queryClient = useQueryClient();

  // Buscar empresas do usuário
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/user-companies', searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/user-companies?search=${encodeURIComponent(searchTerm)}`
        : '/api/user-companies';
      return apiRequest(url);
    },
  });

  // Mutation para deletar empresa
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-companies/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-companies'] });
      toast({
        title: 'Sucesso',
        description: 'Empresa removida com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover empresa',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (company: UserCompany) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
    queryClient.invalidateQueries({ queryKey: ['/api/user-companies'] });
    toast({
      title: 'Sucesso',
      description: selectedCompany 
        ? 'Empresa atualizada com sucesso' 
        : 'Empresa criada com sucesso',
    });
  };

  const filteredCompanies = companies.filter((company: UserCompany) =>
    company.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.corporateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Minhas Empresas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as informações das suas empresas
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setSelectedCompany(null)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            <CompanyForm
              company={selectedCompany}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedCompany(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar sua busca ou cadastre uma nova empresa'
                : 'Comece cadastrando sua primeira empresa'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Primeira Empresa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company: UserCompany) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 dark:text-white mb-1">
                      {company.tradeName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {company.corporateName}
                    </p>
                  </div>
                  <Badge variant={company.isActive ? "default" : "secondary"}>
                    {company.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Location */}
                {(company.city || company.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[company.city, company.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Email */}
                {company.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}

                {/* Phone */}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{company.phone}</span>
                  </div>
                )}

                {/* Website */}
                {company.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{company.website}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(company)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a empresa "{company.tradeName}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(company.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MinhasEmpresas;