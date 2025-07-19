import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link, Package, TrendingUp, Star, AlertCircle, Building2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/unifiedFormatters';
import { toast } from '@/hooks/use-toast';
import { SupplierFormDialog } from './SupplierFormDialog';
import { productService } from '../services/ProductService';
import type { ProductSupplier } from '../types/productSupplier';

/**
 * ProductSupplierManager - Refatorado usando EntityManager
 * 
 * Benefícios:
 * - Usa EntityManager para fornecedores
 * - Mantém lógica de vinculação específica
 * - Interface consistente
 * - Suporte a importação de fornecedores
 * - Ações customizadas para fornecedores
 */

interface ProductSupplierManagerProps {
  productId: number;
}

export function ProductSupplierManager({ productId }: ProductSupplierManagerProps) {
  const queryClient = useQueryClient();

  // Adapter service para usar EntityManager com fornecedores específicos do produto
  const supplierService = useMemo(() => ({
    getAll: async () => {
      // Buscar fornecedores vinculados ao produto
      const suppliers = await productService.getBySupplier(productId);
      return suppliers || [];
    },
    
    create: async (data: any) => {
      // Vincular novo fornecedor ao produto
      return await productService.linkSupplier(productId, data);
    },
    
    update: async (id: string, data: any) => {
      // Atualizar dados do fornecedor vinculado
      return await productService.updateSupplier(productId, parseInt(id), data);
    },
    
    remove: async (id: string) => {
      // Desvincular fornecedor do produto
      await productService.unlinkSupplier(productId, parseInt(id));
    },
    
    // Método customizado para definir fornecedor primário
    setPrimary: async (supplierId: number) => {
      return await productService.setPrimarySupplier(productId, supplierId);
    },
    
    // Método para importar fornecedores
    importSuppliers: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId.toString());
      
      const response = await fetch('/api/suppliers/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao importar fornecedores');
      }
      
      return response.json();
    }
  }), [productId]);

  // Mutation para definir fornecedor primário
  const setPrimaryMutation = useMutation({
    mutationFn: (supplierId: number) => supplierService.setPrimary(supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', productId] });
      toast({
        title: "Sucesso",
        description: "Fornecedor primário definido com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir fornecedor primário",
        variant: "destructive",
      });
    },
  });

  // Mutation para importação
  const importMutation = useMutation({
    mutationFn: (file: File) => supplierService.importSuppliers(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', productId] });
      
      if (result.errors.length > 0) {
        toast({
          title: "Importação Concluída com Avisos",
          description: `${result.success} fornecedores importados. ${result.errors.length} erros encontrados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${result.success} fornecedores importados com sucesso`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar fornecedores",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<ProductSupplier>[] = useMemo(() => [
    {
      accessorKey: 'supplierName',
      header: 'Fornecedor',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.isPrimary && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
          <div>
            <div className="font-medium">{row.original.supplierName}</div>
            <div className="text-sm text-gray-500">{row.original.supplierCode}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'productCode',
      header: 'Código do Produto',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.productCode}
        </Badge>
      )
    },
    {
      accessorKey: 'costPrice',
      header: 'Preço de Custo',
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.costPrice)}
          {row.original.currency && row.original.currency !== 'BRL' && (
            <div className="text-xs text-gray-500">{row.original.currency}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'leadTime',
      header: 'Lead Time',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.original.leadTime}</span>
          <span className="text-gray-500 text-sm ml-1">dias</span>
        </div>
      )
    },
    {
      accessorKey: 'minimumQuantity',
      header: 'Qtd. Mínima',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.minimumQuantity || <span className="text-gray-400">-</span>}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusConfig = {
          linked: { label: 'Vinculado', color: 'bg-green-100 text-green-800' },
          pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
          not_found: { label: 'Não Encontrado', color: 'bg-red-100 text-red-800' },
          discontinued: { label: 'Descontinuado', color: 'bg-gray-100 text-gray-800' },
        };
        
        const config = statusConfig[row.original.status as keyof typeof statusConfig];
        
        return (
          <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
            {config?.label || row.original.status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Última Atualização',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {formatRelativeTime(row.original.lastUpdated)}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Ativo',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className={`w-2 h-2 rounded-full ${row.original.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      )
    }
  ], []);

  const customActions = useMemo(() => [
    {
      label: "Definir como Primário",
      icon: Star,
      onClick: (supplier: ProductSupplier) => {
        if (!supplier.isPrimary) {
          setPrimaryMutation.mutate(supplier.id);
        }
      },
      disabled: (supplier: ProductSupplier) => supplier.isPrimary || setPrimaryMutation.isPending,
    },
    {
      label: "Vincular/Sync",
      icon: Link,
      onClick: (supplier: ProductSupplier) => {
        // Lógica de vinculação/sincronização
        console.log('Vincular fornecedor:', supplier);
      }
    },
    {
      label: "Ver Estoque",
      icon: Package,
      onClick: (supplier: ProductSupplier) => {
        // Ver estoque do fornecedor
        console.log('Ver estoque:', supplier);
      }
    },
    {
      label: "Histórico de Preços",
      icon: TrendingUp,
      onClick: (supplier: ProductSupplier) => {
        // Ver histórico de preços
        console.log('Histórico:', supplier);
      }
    },
    {
      label: "Ver Empresa",
      icon: Building2,
      onClick: (supplier: ProductSupplier) => {
        // Navegar para detalhes da empresa fornecedora
        window.open(`/hub/suppliers/${supplier.supplierId}`, '_blank');
      }
    }
  ], [setPrimaryMutation]);

  // Ações customizadas da toolbar
  const customToolbarActions = [
    {
      label: "Importar Fornecedores",
      icon: Package,
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            importMutation.mutate(file);
          }
        };
        input.click();
      },
      loading: importMutation.isPending,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Fornecedores</h2>
        <p className="text-gray-600 mt-1">Gerencie os fornecedores deste produto</p>
      </div>

      <EntityManager
        entityName="Fornecedor"
        entityNamePlural="Fornecedores"
        service={supplierService}
        columns={columns}
        FormComponent={SupplierFormDialog}
        searchFields={['supplierName', 'productCode', 'supplierCode', 'notes']}
        customActions={customActions}
        customToolbarActions={customToolbarActions}
        enableCreate={true}
        enableEdit={true}
        enableDelete={true}
        enableSearch={true}
        enableBulkOperations={false}
        enableExport={true}
        enableImport={false} // Usamos ação customizada
        permissions={{
          create: true,
          edit: true,
          delete: true,
          export: true,
        }}
        className="mt-6"
        emptyStateProps={{
          title: "Nenhum fornecedor vinculado",
          description: "Vincule fornecedores para gerenciar preços e estoque deste produto.",
          actionLabel: "Vincular Fornecedor",
        }}
        queryKey={['suppliers', productId]}
      />
    </div>
  );
}

export default ProductSupplierManager;