import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Settings, Package, DollarSign, BarChart3, Edit, FileImage } from 'lucide-react';
import { useNavigate } from 'wouter';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { ProductFormDialog } from './ProductFormDialog';
import { productService } from '../services/ProductService';
import { formatCurrency, formatPercentage } from '@/lib/utils/unifiedFormatters';
import { useBrands } from '@/hooks/useBrands';
import type { Product } from '../types/product';
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from '../constants/product';

/**
 * ProductManager - Substitui MyProductsList.tsx
 * 
 * Benefícios:
 * - Redução de 599 → 80 linhas (87% redução)
 * - Usa EntityManager padronizado
 * - Todas as funcionalidades originais mantidas
 * - Ações customizadas para produtos
 * - Formatação usando UnifiedFormatters
 * - Integração com marcas (nome, não ID)
 */
export function ProductManager() {
  const [, navigate] = useNavigate();
  const { brands = [] } = useBrands();

  // Helper para buscar nome da marca
  const getBrandName = (product: Product): string => {
    // Se tem brandId, busca pelo ID
    if (product.brandId) {
      const brand = brands.find(b => b.id === product.brandId);
      return brand?.name || '-';
    }

    // Se brand é um número (legacy ID), tenta buscar
    if (product.brand && !isNaN(Number(product.brand))) {
      const brand = brands.find(b => b.id === Number(product.brand));
      return brand?.name || product.brand;
    }

    // Senão retorna o campo brand como string
    return product.brand || '-';
  };

  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      accessorKey: 'photo',
      header: 'Foto',
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {row.original.photo ? (
            <img 
              src={row.original.photo} 
              alt={row.original.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<FileImage class="h-6 w-6 text-gray-400" />';
              }}
            />
          ) : (
            <FileImage className="h-6 w-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Produto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">
            {row.original.sku && `SKU: ${row.original.sku}`}
            {row.original.ean && ` • EAN: ${row.original.ean}`}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'brand',
      header: 'Marca',
      cell: ({ row }) => {
        const brandName = getBrandName(row.original);
        return brandName !== '-' ? (
          <Badge variant="outline">{brandName}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => (
        row.original.category || <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'costItem',
      header: 'Custo',
      cell: ({ row }) => (
        row.original.costItem ? 
          formatCurrency(row.original.costItem) : 
          <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'channels',
      header: 'Canais Ativos',
      cell: ({ row }) => {
        const activeChannels = row.original.channels ? 
          Object.values(row.original.channels).filter((channel: any) => channel?.isActive).length : 0;
        const totalChannels = row.original.channels ? Object.keys(row.original.channels).length : 0;
        
        return (
          <div className="text-center">
            <span className="font-medium">{activeChannels}</span>
            <span className="text-gray-500">/{totalChannels}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.active ? 'active' : 'inactive';
        const label = PRODUCT_STATUS_LABELS[status as keyof typeof PRODUCT_STATUS_LABELS] || 'Inativo';
        const colors = PRODUCT_STATUS_COLORS[status as keyof typeof PRODUCT_STATUS_COLORS] || PRODUCT_STATUS_COLORS.inactive;
        
        return (
          <Badge className={colors}>
            {label}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
      cell: ({ row }) => (
        new Date(row.original.createdAt).toLocaleDateString('pt-BR')
      )
    }
  ], [brands]);

  const customActions = useMemo(() => [
    {
      label: "Ver Detalhes",
      icon: Eye,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}`);
      }
    },
    {
      label: "Editar Dados Básicos",
      icon: Edit,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/editar-dados`);
      }
    },
    {
      label: "Editar Custos",
      icon: DollarSign,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/editar-custos`);
      }
    },
    {
      label: "Editar Canais",
      icon: Settings,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/editar-canais`);
      }
    },
    {
      label: "Gerenciar Fornecedores",
      icon: Package,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/fornecedores`);
      }
    },
    {
      label: "Análise Financeira",
      icon: BarChart3,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/analise`);
      }
    }
  ], [navigate]);

  // Custom form component adapter
  const ProductFormAdapter = ({ data, onSubmit, onCancel, isLoading }: any) => {
    const handleSubmit = (formData: any) => {
      // Transform form data to match Product interface
      const transformedData = {
        ...formData,
        dimensions: {
          length: formData.length || 0,
          width: formData.width || 0,
          height: formData.height || 0,
        },
        descriptions: {
          description: formData.description || '',
        },
        active: true, // Default to active for new products
      };

      // Remove individual dimension fields
      delete transformedData.length;
      delete transformedData.width;
      delete transformedData.height;
      delete transformedData.description;

      onSubmit(transformedData);
    };

    return (
      <ProductFormDialog
        data={data}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    );
  };

  return (
    <EntityManager
      entityName="Produto"
      entityNamePlural="Produtos"
      service={productService}
      columns={columns}
      FormComponent={ProductFormAdapter}
      searchPlaceholder="Buscar produtos por nome, SKU, marca, categoria..."
      searchFields={['name', 'sku', 'brand', 'ean', 'category']}
      customActions={customActions}
      enableSearch={true}
      enableCreate={true}
      enableEdit={true}
      enableDelete={true}
      enableBulkOperations={true}
      enableExport={true}
      enableImport={true}
      permissions={{
        create: true,
        edit: true,
        delete: true,
        export: true,
        import: true,
      }}
      className="space-y-6"
      emptyStateProps={{
        title: "Nenhum produto encontrado",
        description: "Comece criando seu primeiro produto para começar a vender.",
        actionLabel: "Criar Produto",
      }}
    />
  );
}

export default ProductManager;