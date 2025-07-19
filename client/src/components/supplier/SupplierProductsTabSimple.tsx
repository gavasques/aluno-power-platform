import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Package, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    supplierSku: '',
    productName: '',
    description: '',
    cost: '',
    leadTime: '',
    minimumOrderQuantity: '',
    category: '',
    brand: '',
    notes: ''
  });

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
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Produto Adicionado',
        description: 'Produto adicionado ao catálogo do fornecedor com sucesso',
      });
      setNewProduct({
        supplierSku: '',
        productName: '',
        description: '',
        cost: '',
        leadTime: '',
        minimumOrderQuantity: '',
        category: '',
        brand: '',
        notes: ''
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
        description: 'SKU do Fornecedor e Nome do Produto são obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    addProductMutation.mutate(newProduct);
  };

  const downloadTemplate = () => {
    // Criar planilha modelo
    const templateData = [
      {
        supplierSku: 'SKU001',
        productName: 'Produto Exemplo',
        description: 'Descrição detalhada do produto',
        cost: 10.50,
        leadTime: 30,
        minimumOrderQuantity: 1,
        category: 'Categoria Exemplo',
        brand: 'Marca Exemplo',
        notes: 'Observações importantes sobre o produto'
      },
      {
        supplierSku: 'SKU002',
        productName: 'Outro Produto',
        description: 'Outra descrição detalhada',
        cost: 25.00,
        leadTime: 15,
        minimumOrderQuantity: 5,
        category: 'Outra Categoria',
        brand: 'Outra Marca',
        notes: 'Outras observações relevantes'
      }
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Definir larguras das colunas
    ws['!cols'] = [
      { wch: 15 }, // supplierSku
      { wch: 30 }, // productName
      { wch: 40 }, // description
      { wch: 10 }, // cost
      { wch: 12 }, // leadTime
      { wch: 20 }, // minimumOrderQuantity
      { wch: 20 }, // category
      { wch: 15 }, // brand
      { wch: 30 }  // notes
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
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Importe o catálogo completo via Excel (.xlsx) com todos os produtos do fornecedor</li>
              <li>• O sistema tentará vincular automaticamente com produtos existentes</li>
              <li>• Produtos não encontrados ficarão como "pendentes" até serem criados</li>
              <li>• Use esta área para gerenciar preços, lead times e SKUs específicos do fornecedor</li>
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
                <Label htmlFor="supplierSku">SKU do Fornecedor*</Label>
                <Input
                  id="supplierSku"
                  value={newProduct.supplierSku}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, supplierSku: e.target.value }))}
                  placeholder="SKU001"
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

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição detalhada do produto"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Categoria do produto"
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
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newProduct.notes}
                onChange={(e) => setNewProduct(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o produto"
              />
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
    </div>
  );
};