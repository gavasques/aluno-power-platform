import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Package, Download, Plus, Search, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';

interface SupplierProductsTabSimpleProps {
  supplierId: number;
}

export const SupplierProductsTabSimple: React.FC<SupplierProductsTabSimpleProps> = ({ supplierId }) => {
  console.log('SupplierProductsTabSimple renderizando com supplierId:', supplierId);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Debounce do termo de busca para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const [newProduct, setNewProduct] = useState({
    supplierSku: '',
    productName: '',
    cost: '',
    leadTime: '',
    minimumOrderQuantity: '',
    masterBox: '',
    stock: ''
  });

  // Query para buscar produtos do fornecedor com paginação
  const { data: productsData, isLoading, isFetching } = useQuery({
    queryKey: ['supplier-products', supplierId, currentPage, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });
      
      const response = await fetch(`/api/suppliers/${supplierId}/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }
      
      return response.json();
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    keepPreviousData: true // Para lazy loading suave
  });

  const products = productsData?.data || [];
  const stats = productsData?.stats || { total: 0, linked: 0, pending: 0, notFound: 0 };
  const pagination = productsData?.pagination || { 
    currentPage: 1, 
    totalPages: 1, 
    totalItems: 0, 
    itemsPerPage: 50,
    hasNextPage: false,
    hasPreviousPage: false
  };

  // Reset para primeira página quando pesquisar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset para primeira página
  };

  // Mutation para importar XLSX
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('xlsxFile', file);

      const response = await fetch(`/api/suppliers/${supplierId}/products/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na importação');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({
        title: 'Importação Concluída',
        description: `${data.data.created} criados, ${data.data.updated} atualizados, ${data.data.linked} vinculados`,
      });
      setSelectedFile(null);
      setImportDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na Importação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para adicionar produto individual
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          cost: productData.cost ? parseFloat(productData.cost) : null,
          leadTime: productData.leadTime ? parseInt(productData.leadTime) : null,
          minimumOrderQuantity: productData.minimumOrderQuantity ? parseInt(productData.minimumOrderQuantity) : null,
          masterBox: productData.masterBox ? parseInt(productData.masterBox) : null,
          stock: productData.stock ? parseInt(productData.stock) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({
        title: 'Produto Adicionado',
        description: 'Produto adicionado ao catálogo do fornecedor com sucesso',
      });
      setNewProduct({
        supplierSku: '',
        productName: '',
        cost: '',
        leadTime: '',
        minimumOrderQuantity: '',
        masterBox: '',
        stock: ''
      });
      setAddProductDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para editar produto
  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${productData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierSku: productData.supplierSku,
          productName: productData.productName,
          cost: productData.cost ? parseFloat(productData.cost) : null,
          leadTime: productData.leadTime ? parseInt(productData.leadTime) : null,
          minimumOrderQuantity: productData.minimumOrderQuantity ? parseInt(productData.minimumOrderQuantity) : null,
          masterBox: productData.masterBox ? parseInt(productData.masterBox) : null,
          stock: productData.stock ? parseInt(productData.stock) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({
        title: 'Produto Atualizado',
        description: 'Produto atualizado com sucesso',
      });
      setEditProductDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para remover produto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao remover produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({
        title: 'Produto Removido',
        description: 'Produto removido do catálogo com sucesso',
      });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: 'Arquivo Inválido',
          description: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.supplierSku || !newProduct.productName) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Código do Fornecedor e Nome do Produto são obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    addProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct?.supplierSku || !editingProduct?.productName) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Código do Fornecedor e Nome do Produto são obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    updateProductMutation.mutate(editingProduct);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const downloadTemplate = () => {
    // Criar planilha modelo
    const templateData = [
      {
        cod_prod_fornecedor: 'COD001',
        nome: 'Produto Exemplo',
        custo: 10.50,
        lead_time: 30,
        quantidade_minima: 1,
        caixa_master: 12,
        estoque: 100
      },
      {
        cod_prod_fornecedor: 'COD002', 
        nome: 'Outro Produto',
        custo: 25.00,
        lead_time: 15,
        quantidade_minima: 5,
        caixa_master: 24,
        estoque: 250
      }
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Definir larguras das colunas
    ws['!cols'] = [
      { wch: 20 }, // cod_prod_fornecedor
      { wch: 30 }, // nome
      { wch: 10 }, // custo
      { wch: 12 }, // lead_time
      { wch: 20 }, // quantidade_minima
      { wch: 15 }, // caixa_master
      { wch: 12 }  // estoque
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    XLSX.writeFile(wb, 'template_produtos_fornecedor.xlsx');
    
    toast({
      title: 'Template Baixado',
      description: 'Template Excel baixado com sucesso. Use-o como modelo para importar seus produtos.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos do Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-500 mb-6">
                Importe o catálogo de produtos do fornecedor ou adicione produtos manualmente.
              </p>
              
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => setImportDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar Excel
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setAddProductDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header com estatísticas e ações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Total: {stats.total} produtos
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{stats.linked} vinculados</Badge>
                    <Badge variant="outline">{stats.pending} pendentes</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setImportDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Importar Excel
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => setAddProductDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Produto
                  </Button>
                </div>
              </div>

              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código ou nome do produto..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              {/* Tabela de produtos */}
              <div className="relative min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
                {isFetching && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Código</TableHead>
                      <TableHead className="font-medium">Nome do Produto</TableHead>
                      <TableHead className="font-medium">Custo</TableHead>
                      <TableHead className="font-medium">Lead Time</TableHead>
                      <TableHead className="font-medium">Qtd Mín.</TableHead>
                      <TableHead className="font-medium">Cx Master</TableHead>
                      <TableHead className="font-medium">Estoque</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          {isFetching ? 'Carregando produtos...' : 'Nenhum produto encontrado'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product: any) => (
                        <TableRow key={product.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">{product.supplierSku}</TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate" title={product.productName}>
                            {product.productName}
                          </TableCell>
                          <TableCell>
                            {product.cost ? `R$ ${parseFloat(product.cost).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            {product.leadTime ? `${product.leadTime} dias` : '-'}
                          </TableCell>
                          <TableCell>
                            {product.minimumOrderQuantity || '-'}
                          </TableCell>
                          <TableCell>
                            {product.masterBox || '-'}
                          </TableCell>
                          <TableCell>
                            {product.stock !== null && product.stock !== undefined ? product.stock : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.linkStatus === 'linked' ? 'default' : 'outline'} className="text-xs">
                              {product.linkStatus === 'linked' ? 'Vinculado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setEditProductDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProductToDelete(product);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-500">
                    Página {pagination.currentPage} de {pagination.totalPages} • 
                    {pagination.totalItems} produtos total
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage || isFetching}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(
                          pagination.totalPages - 4,
                          pagination.currentPage - 2
                        )) + i;
                        
                        if (pageNum > pagination.totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isFetching}
                            className="w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || isFetching}
                      className="flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Instruções */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como funciona?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Importe o catálogo completo via Excel (.xlsx) com todos os produtos do fornecedor</li>
                  <li>• O sistema tentará vincular automaticamente com produtos existentes</li>
                  <li>• Produtos não encontrados ficarão como "pendentes" até serem criados</li>
                  <li>• Use esta área para gerenciar preços, lead times e códigos específicos do fornecedor</li>
                </ul>
                
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Template Excel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Importação */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Produtos via Excel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Label htmlFor="xlsxFile">Selecionar arquivo Excel (.xlsx)</Label>
                  <input
                    id="xlsxFile"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {selectedFile && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Arquivo selecionado:</strong> {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
              >
                {importMutation.isPending ? 'Importando...' : 'Importar Produtos'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Adicionar Produto */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Produto ao Catálogo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierSku">Código do Fornecedor*</Label>
                <Input
                  id="supplierSku"
                  value={newProduct.supplierSku}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, supplierSku: e.target.value }))}
                  placeholder="COD001"
                />
              </div>
              <div>
                <Label htmlFor="productName">Nome do Produto*</Label>
                <Input
                  id="productName"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="10.50"
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="minimumOrderQuantity">Qtd. Mínima</Label>
                <Input
                  id="minimumOrderQuantity"
                  type="number"
                  value={newProduct.minimumOrderQuantity}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="masterBox">Caixa Master</Label>
                <Input
                  id="masterBox"
                  type="number"
                  value={newProduct.masterBox}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, masterBox: e.target.value }))}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={addProductMutation.isPending}
            >
              {addProductMutation.isPending ? 'Adicionando...' : 'Adicionar Produto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Produto */}
      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSupplierSku">Código do Fornecedor*</Label>
                <Input
                  id="editSupplierSku"
                  value={editingProduct?.supplierSku || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, supplierSku: e.target.value }))}
                  placeholder="COD001"
                />
              </div>
              <div>
                <Label htmlFor="editProductName">Nome do Produto*</Label>
                <Input
                  id="editProductName"
                  value={editingProduct?.productName || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCost">Custo (R$)</Label>
                <Input
                  id="editCost"
                  type="number"
                  step="0.01"
                  value={editingProduct?.cost || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="10.50"
                />
              </div>
              <div>
                <Label htmlFor="editLeadTime">Lead Time (dias)</Label>
                <Input
                  id="editLeadTime"
                  type="number"
                  value={editingProduct?.leadTime || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, leadTime: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editMinimumOrderQuantity">Qtd. Mínima</Label>
                <Input
                  id="editMinimumOrderQuantity"
                  type="number"
                  value={editingProduct?.minimumOrderQuantity || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="editMasterBox">Caixa Master</Label>
                <Input
                  id="editMasterBox"
                  type="number"
                  value={editingProduct?.masterBox || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, masterBox: e.target.value }))}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="editStock">Estoque</Label>
                <Input
                  id="editStock"
                  type="number"
                  value={editingProduct?.stock || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Remoção */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o produto "{productToDelete?.productName}" (Código: {productToDelete?.supplierSku}) do catálogo do fornecedor?
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};