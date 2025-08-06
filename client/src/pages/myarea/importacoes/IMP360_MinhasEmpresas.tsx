import React, { useState, useMemo, useCallback, memo } from 'react';
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
import { useDebounce } from '@/hooks/useDebounce';

// Função para decodificar HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// ✅ OTIMIZAÇÃO: Componente de empresa memorizado para evitar re-renders
const CompanyCard = memo(({ 
  company, 
  onEdit, 
  onDelete 
}: { 
  company: UserCompany; 
  onEdit: (company: UserCompany) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1">
            {company.logoUrl && (
              <div className="w-12 h-12 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={decodeHtmlEntities(company.logoUrl)}
                  alt={`Logo ${company.tradeName}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.logo-error')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'logo-error w-full h-full flex items-center justify-center text-gray-400';
                      errorDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-white mb-1">
                {company.tradeName}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company.corporateName}
              </p>
            </div>
          </div>
          <Badge variant={company.isActive ? "default" : "secondary"}>
            {company.isActive ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* CNPJ */}
        {company.cnpj && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">CNPJ:</span>
            <span>{company.cnpj}</span>
          </div>
        )}

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
            <a 
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate"
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(company)}
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
                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a empresa "{company.tradeName}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(company.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <span className="text-xs text-gray-400">
            {new Date(company.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

CompanyCard.displayName = 'CompanyCard';

export function MinhasEmpresas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<UserCompany | null>(null);
  
  const queryClient = useQueryClient();
  
  // ✅ OTIMIZAÇÃO: Debounce na busca para reduzir requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ OTIMIZAÇÃO: Query otimizada com stale time e cache
  const { data: companies = [], isLoading } = useQuery<UserCompany[]>({
    queryKey: ['/api/user-companies', debouncedSearchTerm],
    queryFn: async () => {
      const url = debouncedSearchTerm 
        ? `/api/user-companies?search=${encodeURIComponent(debouncedSearchTerm)}`
        : '/api/user-companies';
      return apiRequest(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos 
    refetchOnWindowFocus: false,
  });

  // ✅ OTIMIZAÇÃO: Mutation memorizada para deletar empresa
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

  // ✅ OTIMIZAÇÃO: Handlers memorizados com useCallback
  const handleEdit = useCallback((company: UserCompany) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setSelectedCompany(null);
    queryClient.invalidateQueries({ queryKey: ['/api/user-companies'] });
    toast({
      title: 'Sucesso',
      description: selectedCompany 
        ? 'Empresa atualizada com sucesso' 
        : 'Empresa criada com sucesso',
    });
  }, [selectedCompany, queryClient]);

  // ✅ OTIMIZAÇÃO: Filtro memorizado para evitar recálculos
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    
    const searchLower = searchTerm.toLowerCase();
    return companies.filter((company: UserCompany) =>
      company.tradeName.toLowerCase().includes(searchLower) ||
      company.corporateName.toLowerCase().includes(searchLower) ||
      (company.cnpj && company.cnpj.includes(searchTerm))
    );
  }, [companies, searchTerm]);

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
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MinhasEmpresas;