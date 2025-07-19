import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  Sync
} from 'lucide-react';
import { SupplierProductsImport } from './SupplierProductsImport';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { formatCurrency } from '@/lib/utils';

interface SupplierProduct {
  id: number;
  supplierSku: string;
  productName: string;
  description?: string;
  cost?: number;
  leadTime?: number;
  minimumOrderQuantity?: number;
  category?: string;
  brand?: string;
  linkStatus: 'linked' | 'pending' | 'not_found';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  linkedProduct?: {
    id: number;
    name: string;
    sku: string;
  };
}

interface SupplierProductsTabProps {
  supplierId: number;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'linked':
      return { 
        icon: CheckCircle, 
        label: 'Vinculado', 
        variant: 'default' as const,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    case 'pending':
      return { 
        icon: AlertCircle, 
        label: 'Pendente', 
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      };
    case 'not_found':
      return { 
        icon: XCircle, 
        label: 'Não encontrado', 
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    default:
      return { 
        icon: AlertCircle, 
        label: 'Desconhecido', 
        variant: 'outline' as const,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200'
      };
  }
};

export const SupplierProductsTab: React.FC<SupplierProductsTabProps> = ({ supplierId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    supplierSku: '',
    productName: '',
    description: '',
    cost: '',
    leadTime: '',
    minimumOrderQuantity: '',
    category: '',
    brand: '',
    notes: '',
  });

  // Fetch supplier products
  const { data: supplierProducts, isLoading } = useQuery({
    queryKey: ['supplier-products', supplierId, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(
        `/api/suppliers/${supplierId}/products?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos do fornecedor');
      }
      
      return response.json();
    },
    enabled: !!supplierId,
  });

  // Create supplier product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      setNewProduct({
        supplierSku: '',
        productName: '',
        description: '',
        cost: '',
        leadTime: '',
        minimumOrderQuantity: '',
        category: '',
        brand: '',
        notes: '',
      });
      toast({
        title: 'Sucesso',
        description: 'Produto adicionado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update supplier product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: any }) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      setEditingProduct(null);
      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete supplier product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Sucesso',
        description: 'Produto removido com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Sync products mutation
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao sincronizar produtos');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Sincronização Concluída',
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateProduct = () => {
    const productData = {
      supplierSku: newProduct.supplierSku,
      productName: newProduct.productName,
      description: newProduct.description || undefined,
      cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
      leadTime: newProduct.leadTime ? parseInt(newProduct.leadTime) : undefined,
      minimumOrderQuantity: newProduct.minimumOrderQuantity ? parseInt(newProduct.minimumOrderQuantity) : undefined,
      category: newProduct.category || undefined,
      brand: newProduct.brand || undefined,
      notes: newProduct.notes || undefined,
    };

    createProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productId: number, data: any) => {
    updateProductMutation.mutate({ productId, data });
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleSyncProducts = () => {
    syncProductsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  const products = supplierProducts?.data || [];
  const stats = supplierProducts?.stats || { total: 0, linked: 0, pending: 0, notFound: 0 };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Produtos do Fornecedor</h3>
          <p className="text-sm text-gray-600">
            Gerencie todos os produtos fornecidos por este fornecedor
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Total: {stats.total}
          </Badge>
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
            Vinculados: {stats.linked}
          </Badge>
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendentes: {stats.pending}
          </Badge>
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
            Não encontrados: {stats.notFound}
          </Badge>
        </div>
      </div>

      {/* Filtros e ações */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por SKU, nome, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">Todos os status</option>
            <option value="linked">Vinculados</option>
            <option value="pending">Pendentes</option>
            <option value="not_found">Não encontrados</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <SupplierProductsImport supplierId={supplierId} />
          
          <Button
            variant="outline"
            onClick={handleSyncProducts}
            disabled={syncProductsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Sync className="h-4 w-4" />
            {syncProductsMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Produto do Fornecedor</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierSku">SKU do Fornecedor *</Label>
                  <Input
                    id="supplierSku"
                    value={newProduct.supplierSku}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, supplierSku: e.target.value }))}
                    placeholder="SKU123"
                  />
                </div>
                <div>
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    value={newProduct.productName}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="leadTime">Lead Time (dias)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={newProduct.leadTime}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, leadTime: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrderQuantity">Qtd Mínima</Label>
                  <Input
                    id="minimumOrderQuantity"
                    type="number"
                    value={newProduct.minimumOrderQuantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Marca do produto"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada do produto..."
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newProduct.notes}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setNewProduct({
                    supplierSku: '',
                    productName: '',
                    description: '',
                    cost: '',
                    leadTime: '',
                    minimumOrderQuantity: '',
                    category: '',
                    brand: '',
                    notes: '',
                  })}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  disabled={createProductMutation.isPending || !newProduct.supplierSku || !newProduct.productName}
                >
                  {createProductMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Upload className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione produtos do fornecedor ou importe uma lista em CSV
              </p>
              <div className="flex justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Adicionar Primeiro Produto</Button>
                  </DialogTrigger>
                  <DialogContent>
                    {/* Mesmo formulário do dialog acima */}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          products.map((product: SupplierProduct) => {
            const statusConfig = getStatusConfig(product.linkStatus);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={product.id} className={`${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-sm font-mono text-gray-600">
                          {product.supplierSku}
                        </span>
                        {product.linkedProduct && (
                          <Badge variant="outline" className="text-xs">
                            → {product.linkedProduct.sku || product.linkedProduct.name}
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {product.productName}
                      </h4>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {product.cost && (
                          <span>Custo: R$ {product.cost.toFixed(2)}</span>
                        )}
                        {product.leadTime && (
                          <span>Lead Time: {product.leadTime} dias</span>
                        )}
                        {product.minimumOrderQuantity && (
                          <span>Qtd Min: {product.minimumOrderQuantity}</span>
                        )}
                        {product.brand && (
                          <span>Marca: {product.brand}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};