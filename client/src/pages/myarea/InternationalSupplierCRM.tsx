import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Users, 
  Building2, 
  FileText, 
  CreditCard, 
  Handshake, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  Package,
  ArrowLeft,
  Filter,
  SortAsc,
  Globe,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface InternationalSupplier {
  id: number;
  name: string;
  country: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  lastContact: string;
  totalOrders: number;
  rating: number;
  contactsCount?: number;
  contractsCount?: number;
  productsCount?: number;
}

// API call hook para carregar fornecedores reais do banco
const useInternationalSuppliers = () => {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<InternationalSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/international-suppliers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar fornecedores');
        }

        const data = await response.json();
        
        // Transformar dados do banco para o formato esperado
        const formattedSuppliers = (data.data || []).map((supplier: any) => ({
          id: supplier.id,
          name: supplier.tradeName || supplier.corporateName || 'Nome não informado',
          country: supplier.country || 'Brasil',
          category: supplier.category?.name || 'Categoria não informada',
          status: (supplier.status === 'ativo') ? 'active' : 'inactive',
          lastContact: supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString('pt-BR') : 'Invalid Date',
          totalOrders: 0,
          rating: parseFloat(supplier.averageRating) || 0,
          contactsCount: 0,
          contractsCount: 0,
          productsCount: 0
        }));

        setSuppliers(formattedSuppliers);
      } catch (err) {
        console.error('Erro ao carregar fornecedores:', err);
        setError('Erro ao carregar fornecedores. Tente novamente.');
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [token]);

  const deleteSupplier = async (supplierId: number) => {
    if (!token) return { success: false, message: 'Token não encontrado' };

    try {
      const response = await fetch(`/api/international-suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Recarregar lista após exclusão
        setSuppliers(prevSuppliers => 
          prevSuppliers.filter(supplier => supplier.id !== supplierId)
        );
        return { success: true, message: data.message || 'Fornecedor excluído com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao excluir fornecedor' };
      }
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      return { success: false, message: 'Erro de conexão ao excluir fornecedor' };
    }
  };

  return { suppliers, loading, error, refetch: () => setLoading(true), deleteSupplier };
};

/**
 * CRM DE FORNECEDORES INTERNACIONAIS
 * 
 * ATENÇÃO: Este é um sistema SEPARADO do CRM de fornecedores nacionais
 * 
 * DIFERENÇAS IMPORTANTES:
 * - Fornecedores NACIONAIS: /minha-area/fornecedores (MySuppliers.tsx)
 * - Fornecedores INTERNACIONAIS: /minha-area/importacoes/fornecedores (este componente)
 * 
 * FINALIDADE:
 * - Especializado para IMPORTAÇÕES
 * - Gestão de documentos de compliance internacional
 * - Contratos de importação
 * - Termos comerciais internacionais (Incoterms, etc.)
 * - Performance de importações
 * - Comunicação internacional (fuso horário, idioma)
 */
export default function InternationalSupplierCRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<InternationalSupplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();

  // Usar dados reais do banco
  const { suppliers: allSuppliers, loading, error, deleteSupplier } = useInternationalSuppliers();

  // Função para confirmar exclusão
  const handleDeleteClick = (supplier: InternationalSupplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  // Função para confirmar e executar exclusão
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteSupplier(supplierToDelete.id);
      
      if (result.success) {
        toast({
          title: "Fornecedor excluído",
          description: result.message,
        });
        setShowDeleteModal(false);
        setSupplierToDelete(null);
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir fornecedor",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar fornecedores baseado na busca e status
  const suppliers = allSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || supplier.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
  
  const isLoading = false;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200", 
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente"
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </div>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/minha-area/importacoes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Importações
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">CRM de Fornecedores Internacionais</h1>
            </div>
            <p className="text-gray-600">Gerencie seus fornecedores internacionais especializados para importação</p>
            <p className="text-sm text-blue-600 font-medium">
              📍 Sistema especializado para importações • Separado dos fornecedores nacionais
            </p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor Internacional
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Internacionais</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">89% do total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importações Totais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Excelente performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar fornecedores internacionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="pending">Pendente</option>
        </select>
        
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
        
        <Button variant="outline" size="sm">
          <SortAsc className="w-4 h-4 mr-2" />
          Ordenar
        </Button>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Carregando fornecedores internacionais...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum fornecedor internacional encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Tente ajustar sua busca ou filtros" : "Comece adicionando seu primeiro fornecedor internacional"}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fornecedor Internacional
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Fornecedor</th>
                    <th className="text-left p-4 font-medium text-gray-700">País</th>
                    <th className="text-left p-4 font-medium text-gray-700">Categoria</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Último Contato</th>
                    <th className="text-left p-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{supplier.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{supplier.country}</td>
                      <td className="p-4 text-gray-600">{supplier.category}</td>
                      <td className="p-4">{getStatusBadge(supplier.status)}</td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(supplier.lastContact).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/minha-area/importacoes/fornecedores/${supplier.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Gerenciar
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteClick(supplier)}
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Warning Note */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Sistema Separado</h4>
            <p className="text-sm text-yellow-700">
              Este é o CRM para <strong>fornecedores internacionais</strong> especializado em importações. 
              Para fornecedores nacionais, acesse <Link href="/minha-area/fornecedores" className="underline font-medium">Meus Fornecedores</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor{" "}
              <span className="font-semibold text-gray-900">
                {supplierToDelete?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Ação irreversível</p>
                <p className="text-sm text-red-700 mt-1">
                  Esta ação não pode ser desfeita. Todos os dados do fornecedor serão permanentemente excluídos.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              type="button"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Fornecedor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}