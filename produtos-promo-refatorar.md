# 🔧 Plano Completo de Refatoração: Área de Produtos-Pro

## 📊 **Visão Geral do Plano**

Este plano detalha a refatoração completa da área de produtos do sistema Aluno Power Platform, aplicando os princípios DRY e os novos componentes unificados criados. A refatoração resultará em **~77% de redução de código** e uma arquitetura muito mais consistente e maintível.

### **Métricas de Impacto Estimadas:**
- **Linhas de Código**: 3.500 → 800 linhas (77% redução)
- **Componentes**: 18 → 6 componentes (67% redução)  
- **Duplicação CRUD**: 95% eliminada via BaseCrudService + useCrudQuery
- **Duplicação Forms**: 80% eliminada via FormDialog
- **Duplicação Loading**: 90% eliminada via LoadingStates

---

## 🎯 **FASE 1: INFRAESTRUTURA BASE (Semana 1)**

### **Passo 1.1: Criar ProductService Refatorado**
**Objetivo**: Substituir ProductService atual por extensão do BaseCrudService

**Arquivo**: `/client/src/features/products/services/ProductService.ts`

```typescript
import { BaseCrudService } from '@/lib/services/base/BaseCrudService';
import { Product, InsertProduct } from '@/types/product';

export class ProductService extends BaseCrudService<Product, InsertProduct> {
  constructor() {
    super('/api/products');
  }

  // Métodos específicos de produtos
  async updateChannels(id: number, channels: any[]): Promise<Product> {
    return this.put(`${this.endpoint}/${id}/channels`, { channels });
  }

  async updateCosts(id: number, costs: any): Promise<Product> {
    return this.put(`${this.endpoint}/${id}/costs`, costs);
  }

  async toggleStatus(id: number): Promise<Product> {
    return this.patch(`${this.endpoint}/${id}/toggle-status`);
  }

  async getWithChannels(id: number): Promise<Product> {
    return this.get(`${this.endpoint}/${id}/channels`);
  }

  async bulkUpdateChannels(updates: Array<{id: number, channels: any}>): Promise<Product[]> {
    return this.put(`${this.endpoint}/bulk-channels`, updates);
  }
}

export const productService = new ProductService();
```

**Critérios de Aceitação**:
- ✅ Herda de BaseCrudService
- ✅ Mantém métodos específicos de produtos
- ✅ Remove duplicação CRUD (95% redução)
- ✅ Type-safe com TypeScript

---

### **Passo 1.2: Criar Hook Unificado de Produtos**
**Objetivo**: Substituir ProductContext.tsx por hook usando useCrudQuery

**Arquivo**: `/client/src/features/products/hooks/useProducts.ts`

```typescript
import { useCrudQuery } from '@/hooks/useCrudQuery';
import { productService } from '../services/ProductService';
import type { Product, InsertProduct } from '@/types/product';

export function useProducts() {
  return useCrudQuery('products', productService, {
    successMessages: {
      create: 'Produto criado com sucesso',
      update: 'Produto atualizado com sucesso',
      delete: 'Produto excluído com sucesso',
    },
    errorMessages: {
      create: 'Erro ao criar produto',
      update: 'Erro ao atualizar produto',
      delete: 'Erro ao excluir produto',
    },
    defaultQueryOptions: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  });
}

export function useProductChannels(productId: number) {
  return useCrudQuery(`product-channels-${productId}`, productService, {
    successMessages: {
      update: 'Canais atualizados com sucesso',
    }
  });
}

export function useProductCosts(productId: number) {
  return useCrudQuery(`product-costs-${productId}`, productService, {
    successMessages: {
      update: 'Custos atualizados com sucesso',
    }
  });
}
```

**Critérios de Aceitação**:
- ✅ Substitui ProductContext.tsx (elimina 139 linhas)
- ✅ Usa useCrudQuery padronizado
- ✅ Mantém todas as funcionalidades originais
- ✅ Adiciona hooks especializados para canais e custos

---

### **Passo 1.3: Migrar Tipos e Constantes**
**Objetivo**: Centralizar tipos e constantes em estrutura organizada

**Arquivos**:
- `/client/src/features/products/types/product.ts`
- `/client/src/features/products/types/productChannels.ts`
- `/client/src/features/products/constants/product.ts`

```typescript
// types/product.ts
export interface Product {
  id: number;
  name: string;
  sku?: string;
  brand?: string;
  ean?: string;
  description?: string;
  photo?: string;
  // ... outros campos
}

export interface InsertProduct extends Omit<Product, 'id'> {}

// constants/product.ts
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
} as const;

export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda',
  // ...
] as const;
```

**Critérios de Aceitação**:
- ✅ Todos os tipos centralizados
- ✅ Constantes organizadas
- ✅ Imports atualizados em todos os arquivos

---

## 🏗️ **FASE 2: COMPONENTES CORE (Semana 2)**

### **Passo 2.1: Criar ProductFormDialog**
**Objetivo**: Substituir BasicProductForm.tsx por FormDialog padronizado

**Arquivo**: `/client/src/features/products/components/ProductFormDialog.tsx`

```typescript
import { z } from 'zod';
import { FormDialog } from '@/components/common/FormDialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const productFormSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  ean: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  cost_price: z.number().min(0).optional(),
  suggested_price: z.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  data?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductFormDialog({ data, onSubmit, onCancel, isLoading }: ProductFormDialogProps) {
  const defaultValues: ProductFormData = {
    name: data?.name || "",
    sku: data?.sku || "",
    brand: data?.brand || "",
    ean: data?.ean || "",
    description: data?.description || "",
    category: data?.category || "",
    weight: data?.weight || 0,
    length: data?.length || 0,
    width: data?.width || 0,
    height: data?.height || 0,
    cost_price: data?.cost_price || 0,
    suggested_price: data?.suggested_price || 0,
  };

  return (
    <FormDialog
      title={data ? "Editar Produto" : "Novo Produto"}
      schema={productFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isLoading}
      size="lg"
      isOpen={true}
      onOpenChange={(open) => !open && onCancel()}
    >
      {(form) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do produto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SKU do produto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAN/Código de Barras</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EAN do produto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Marca do produto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descrição do produto"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dimensões e Preços */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dimensões e Preços</h3>
            
            <div className="grid grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprimento (cm)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura (cm)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suggested_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Sugerido</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      )}
    </FormDialog>
  );
}
```

**Critérios de Aceitação**:
- ✅ Substitui BasicProductForm.tsx (380 → 100 linhas, 74% redução)
- ✅ Usa FormDialog padronizado
- ✅ Validação com Zod
- ✅ Layout responsivo e organizado
- ✅ Todos os campos necessários

---

### **Passo 2.2: Criar ProductManager Principal**
**Objetivo**: Substituir MyProductsList.tsx por EntityManager

**Arquivo**: `/client/src/features/products/components/ProductManager.tsx`

```typescript
import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Settings, Package, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'wouter';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { ProductFormDialog } from './ProductFormDialog';
import { productService } from '../services/ProductService';
import { formatCurrency } from '@/lib/utils/unifiedFormatters';
import type { Product } from '../types/product';

export function ProductManager() {
  const navigate = useNavigate();

  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      accessorKey: 'photo',
      header: 'Foto',
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={row.original.photo || '/placeholder.svg'} 
            alt={row.original.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
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
      cell: ({ row }) => (
        row.original.brand ? (
          <Badge variant="outline">{row.original.brand}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => (
        row.original.category || <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'cost_price',
      header: 'Preço de Custo',
      cell: ({ row }) => (
        row.original.cost_price ? 
          formatCurrency(row.original.cost_price) : 
          <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'suggested_price',
      header: 'Preço Sugerido',
      cell: ({ row }) => (
        row.original.suggested_price ? 
          formatCurrency(row.original.suggested_price) : 
          <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'draft';
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          draft: 'bg-yellow-100 text-yellow-800'
        };
        const statusLabels = {
          active: 'Ativo',
          inactive: 'Inativo',
          draft: 'Rascunho'
        };
        
        return (
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      cell: ({ row }) => (
        new Date(row.original.created_at).toLocaleDateString('pt-BR')
      )
    }
  ], []);

  const customActions = useMemo(() => [
    {
      label: "Ver Detalhes",
      icon: Eye,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}`);
      }
    },
    {
      label: "Editar Canais",
      icon: Settings,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/canais`);
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
      label: "Configurar Preços",
      icon: DollarSign,
      onClick: (product: Product) => {
        navigate(`/minha-area/produtos/${product.id}/precos`);
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

  return (
    <EntityManager
      entityName="Produto"
      entityNamePlural="Produtos"
      service={productService}
      columns={columns}
      FormComponent={ProductFormDialog}
      searchPlaceholder="Buscar produtos por nome, SKU, marca..."
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
    />
  );
}

export default ProductManager;
```

**Critérios de Aceitação**:
- ✅ Substitui MyProductsList.tsx (599 → 80 linhas, 87% redução)
- ✅ Usa EntityManager padronizado
- ✅ Todas as funcionalidades originais mantidas
- ✅ Ações customizadas para produtos
- ✅ Formatação usando UnifiedFormatters

---

### **Passo 2.3: Refatorar Componentes de Loading**
**Objetivo**: Substituir loading states manuais por LoadingStates padronizados

**Arquivos Afetados**:
- `ProductList.tsx`
- `ProductBasicDataEdit.tsx` 
- `ProductChannelsManager.tsx`
- Todos os outros componentes de produtos

**Exemplo de Refatoração**:

```typescript
// ANTES (em ProductBasicDataEdit.tsx)
const [isSubmitting, setIsSubmitting] = useState(false);

if (isLoading) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    </div>
  );
}

// DEPOIS
import { PageLoadingState, LoadingButton } from '@/components/common/LoadingStates';

if (isLoading) {
  return <PageLoadingState message="Carregando produto..." />;
}

// Para botões
<LoadingButton 
  loading={isSubmitting} 
  loadingText="Salvando..."
  onClick={handleSubmit}
>
  Salvar Produto
</LoadingButton>
```

**Critérios de Aceitação**:
- ✅ Todos os loading states manuais substituídos
- ✅ Consistência visual em todo o sistema
- ✅ Redução de código duplicado (90% redução)

---

## 🔧 **FASE 3: COMPONENTES ESPECIALIZADOS (Semana 3)**

### **Passo 3.1: Refatorar ProductChannelsManager**
**Objetivo**: Aplicar EntityManager para gerenciamento de canais

**Arquivo**: `/client/src/features/products/components/ProductChannelsManager.tsx`

```typescript
import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Settings, TrendingUp, DollarSign } from 'lucide-react';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/utils/unifiedFormatters';
import { ChannelFormDialog } from './ChannelFormDialog';
import { useProductChannels } from '../hooks/useProducts';
import type { ProductChannel } from '../types/productChannels';

interface ProductChannelsManagerProps {
  productId: number;
}

export function ProductChannelsManager({ productId }: ProductChannelsManagerProps) {
  const channelService = useMemo(() => ({
    // Adapter para usar EntityManager com canais específicos do produto
    getAll: () => productService.getChannels(productId),
    create: (data) => productService.createChannel(productId, data),
    update: (id, data) => productService.updateChannel(productId, id, data),
    remove: (id) => productService.removeChannel(productId, id),
  }), [productId]);

  const columns: ColumnDef<ProductChannel>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Canal',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${row.original.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="font-medium">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.enabled ? 'default' : 'secondary'}>
          {row.original.enabled ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      accessorKey: 'sale_price',
      header: 'Preço de Venda',
      cell: ({ row }) => formatCurrency(row.original.sale_price)
    },
    {
      accessorKey: 'margin',
      header: 'Margem',
      cell: ({ row }) => (
        <span className={row.original.margin >= 0.3 ? 'text-green-600' : 'text-red-600'}>
          {formatPercentage(row.original.margin, { multiplier: 1 })}
        </span>
      )
    },
    {
      accessorKey: 'commission',
      header: 'Comissão',
      cell: ({ row }) => formatPercentage(row.original.commission, { multiplier: 1 })
    },
    {
      accessorKey: 'net_profit',
      header: 'Lucro Líquido',
      cell: ({ row }) => (
        <span className={row.original.net_profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {formatCurrency(row.original.net_profit)}
        </span>
      )
    }
  ], []);

  const customActions = useMemo(() => [
    {
      label: "Configurar",
      icon: Settings,
      onClick: (channel: ProductChannel) => {
        // Abrir configurações específicas do canal
      }
    },
    {
      label: "Análise",
      icon: TrendingUp,
      onClick: (channel: ProductChannel) => {
        // Abrir análise de performance
      }
    },
    {
      label: "Preços",
      icon: DollarSign,
      onClick: (channel: ProductChannel) => {
        // Abrir configuração de preços
      }
    }
  ], []);

  return (
    <EntityManager
      entityName="Canal"
      entityNamePlural="Canais de Venda"
      service={channelService}
      columns={columns}
      FormComponent={ChannelFormDialog}
      searchFields={['name', 'type']}
      customActions={customActions}
      enableCreate={true}
      enableEdit={true}
      enableDelete={true}
      className="mt-6"
    />
  );
}
```

**Critérios de Aceitação**:
- ✅ Usa EntityManager adaptado para canais
- ✅ Mantém funcionalidades específicas de canais
- ✅ Formatação usando UnifiedFormatters
- ✅ Interface consistente com outros managers

---

### **Passo 3.2: Refatorar ProductSupplierManager**
**Objetivo**: Aplicar EntityManager para gerenciamento de fornecedores

**Arquivo**: `/client/src/features/products/components/ProductSupplierManager.tsx`

```typescript
import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link, Package, TrendingUp } from 'lucide-react';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/unifiedFormatters';
import { SupplierFormDialog } from './SupplierFormDialog';
import type { ProductSupplier } from '../types/productSupplier';

interface ProductSupplierManagerProps {
  productId: number;
}

export function ProductSupplierManager({ productId }: ProductSupplierManagerProps) {
  const supplierService = useMemo(() => ({
    getAll: () => productService.getSuppliers(productId),
    create: (data) => productService.linkSupplier(productId, data),
    update: (id, data) => productService.updateSupplier(productId, id, data),
    remove: (id) => productService.unlinkSupplier(productId, id),
  }), [productId]);

  const columns: ColumnDef<ProductSupplier>[] = useMemo(() => [
    {
      accessorKey: 'supplier_name',
      header: 'Fornecedor',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.supplier_name}</div>
          <div className="text-sm text-gray-500">{row.original.supplier_code}</div>
        </div>
      )
    },
    {
      accessorKey: 'product_code',
      header: 'Código do Produto',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.product_code}</Badge>
      )
    },
    {
      accessorKey: 'cost_price',
      header: 'Preço de Custo',
      cell: ({ row }) => formatCurrency(row.original.cost_price)
    },
    {
      accessorKey: 'lead_time',
      header: 'Lead Time',
      cell: ({ row }) => (
        <span>{row.original.lead_time} dias</span>
      )
    },
    {
      accessorKey: 'minimum_quantity',
      header: 'Qtd. Mínima',
      cell: ({ row }) => row.original.minimum_quantity || '-'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusColors = {
          linked: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          not_found: 'bg-red-100 text-red-800'
        };
        const statusLabels = {
          linked: 'Vinculado',
          pending: 'Pendente',
          not_found: 'Não Encontrado'
        };
        
        return (
          <Badge className={statusColors[row.original.status]}>
            {statusLabels[row.original.status]}
          </Badge>
        );
      }
    }
  ], []);

  const customActions = useMemo(() => [
    {
      label: "Vincular",
      icon: Link,
      onClick: (supplier: ProductSupplier) => {
        // Lógica de vinculação
      }
    },
    {
      label: "Ver Estoque",
      icon: Package,
      onClick: (supplier: ProductSupplier) => {
        // Ver estoque do fornecedor
      }
    },
    {
      label: "Histórico",
      icon: TrendingUp,
      onClick: (supplier: ProductSupplier) => {
        // Ver histórico de preços
      }
    }
  ], []);

  return (
    <EntityManager
      entityName="Fornecedor"
      entityNamePlural="Fornecedores"
      service={supplierService}
      columns={columns}
      FormComponent={SupplierFormDialog}
      searchFields={['supplier_name', 'product_code', 'supplier_code']}
      customActions={customActions}
      enableCreate={true}
      enableEdit={true}
      enableDelete={true}
      enableImport={true}
      className="mt-6"
    />
  );
}
```

**Critérios de Aceitação**:
- ✅ Usa EntityManager para fornecedores
- ✅ Mantém lógica de vinculação específica
- ✅ Interface consistente
- ✅ Suporte a importação de fornecedores

---

## 📄 **FASE 4: PÁGINAS E ROTAS (Semana 4)**

### **Passo 4.1: Refatorar Páginas Principais**
**Objetivo**: Simplificar páginas usando novos componentes

**Arquivo**: `/client/src/features/products/pages/ProductListPage.tsx`

```typescript
import React from 'react';
import { ProductManager } from '../components/ProductManager';
import { StatsCard } from '@/components/ui/card-variants';
import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export function ProductListPage() {
  const { useGetAll, useCount } = useProducts();
  const { data: products = [] } = useGetAll();
  const { data: totalCount = 0 } = useCount();

  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + (p.suggested_price || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
        <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={totalCount}
          icon={<Package className="h-4 w-4" />}
          description="Produtos cadastrados"
        />
        
        <StatsCard
          title="Produtos Ativos"
          value={activeProducts}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          description="Ativos este mês"
        />
        
        <StatsCard
          title="Valor Total"
          value={formatCurrency(totalValue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="Valor total sugerido"
        />
        
        <StatsCard
          title="Estoque Baixo"
          value={lowStockProducts}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Produtos abaixo de 10 unidades"
        />
      </div>

      {/* Product Manager */}
      <ProductManager />
    </div>
  );
}
```

**Critérios de Aceitação**:
- ✅ Página simplificada usando novos componentes
- ✅ Cards de estatísticas usando StatsCard
- ✅ ProductManager integrado
- ✅ Layout responsivo e organizado

---

### **Passo 4.2: Refatorar Página de Detalhes**
**Objetivo**: Simplificar ProductDetail.tsx

**Arquivo**: `/client/src/features/products/pages/ProductDetailPage.tsx`

```typescript
import React from 'react';
import { useParams } from 'wouter';
import { PageLoadingState } from '@/components/common/LoadingStates';
import { StatsCard, ItemCard } from '@/components/ui/card-variants';
import { ProductChannelsManager } from '../components/ProductChannelsManager';
import { ProductSupplierManager } from '../components/ProductSupplierManager';
import { useProducts } from '../hooks/useProducts';

export function ProductDetailPage() {
  const { id } = useParams();
  const { useGetById } = useProducts();
  const { data: product, isLoading } = useGetById(parseInt(id));

  if (isLoading) {
    return <PageLoadingState message="Carregando detalhes do produto..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Produto não encontrado</h2>
        <p className="text-gray-600 mt-2">O produto solicitado não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={product.photo || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-1">{product.description}</p>
          
          <div className="flex items-center gap-4 mt-4">
            {product.sku && (
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                SKU: {product.sku}
              </span>
            )}
            {product.ean && (
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                EAN: {product.ean}
              </span>
            )}
            {product.brand && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {product.brand}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Preço de Custo"
          value={formatCurrency(product.cost_price || 0)}
          description="Último custo registrado"
        />
        
        <StatsCard
          title="Preço Sugerido"
          value={formatCurrency(product.suggested_price || 0)}
          description="Preço sugerido de venda"
        />
        
        <StatsCard
          title="Margem Estimada"
          value={formatPercentage(((product.suggested_price || 0) - (product.cost_price || 0)) / (product.suggested_price || 1))}
          description="Margem bruta estimada"
        />
      </div>

      {/* Channels Manager */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Canais de Venda</h2>
        <ProductChannelsManager productId={product.id} />
      </div>

      {/* Suppliers Manager */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fornecedores</h2>
        <ProductSupplierManager productId={product.id} />
      </div>
    </div>
  );
}
```

**Critérios de Aceitação**:
- ✅ Página simplificada e organizada
- ✅ Usa componentes padronizados de loading e cards
- ✅ Integra managers especializados
- ✅ Layout responsivo e intuitivo

---

## 🔄 **FASE 5: MIGRAÇÃO E LIMPEZA (Semana 5)**

### **Passo 5.1: Atualizar Importações**
**Objetivo**: Atualizar todos os imports para nova estrutura

**Script de Migração**: `/scripts/update-product-imports.js`

```javascript
// Script para atualizar automaticamente todos os imports
const fs = require('fs');
const path = require('path');

const importMappings = {
  // Services
  'from "@/services/productService"': 'from "@/features/products/services/ProductService"',
  'from "@/contexts/ProductContext"': 'from "@/features/products/hooks/useProducts"',
  
  // Components
  'from "@/components/product/BasicProductForm"': 'from "@/features/products/components/ProductFormDialog"',
  'from "@/components/product/ProductList"': 'from "@/features/products/components/ProductManager"',
  'from "@/pages/myarea/MyProductsList"': 'from "@/features/products/pages/ProductListPage"',
  
  // Hooks
  'useProductContext': 'useProducts',
  'ProductProvider': '// Removed - use useProducts hook directly',
  
  // Utils
  'from "@/utils/productCalculations"': 'from "@/lib/utils/unifiedFormatters"',
};

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  Object.entries(importMappings).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport, 'g'), newImport);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Executar para todos os arquivos .tsx e .ts
// ... implementação do script
```

**Critérios de Aceitação**:
- ✅ Todos os imports atualizados automaticamente
- ✅ Nenhum import quebrado
- ✅ Build funciona sem erros

---

### **Passo 5.2: Remover Arquivos Legacy**
**Objetivo**: Remover arquivos antigos após migração

**Arquivos para Remoção**:
```
client/src/
├── services/productService.ts                    ❌ REMOVER
├── contexts/ProductContext.tsx                   ❌ REMOVER
├── components/product/BasicProductForm.tsx      ❌ REMOVER
├── components/product/ProductList.tsx           ❌ REMOVER
├── pages/myarea/MyProductsList.tsx              ❌ REMOVER
├── pages/myarea/ProductBasicDataEdit.tsx        ❌ REMOVER
├── utils/productCalculations.ts                 ❌ REMOVER (mover para UnifiedFormatters)
├── hooks/useProducts.ts                         ❌ REMOVER (substituído)
├── hooks/useProductForm.ts                      ❌ REMOVER
└── hooks/useEditProductForm.ts                  ❌ REMOVER
```

**Critérios de Aceitação**:
- ✅ Arquivos legacy removidos apenas após confirmação de funcionamento
- ✅ Funcionalidade mantida em 100%
- ✅ Testes passando

---

### **Passo 5.3: Atualizar Documentação**
**Objetivo**: Documentar nova arquitetura de produtos

**Arquivo**: `/docs/PRODUCTS_ARCHITECTURE.md`

```markdown
# Arquitetura de Produtos - Refatorada

## Estrutura de Arquivos

```
features/products/
├── components/          # Componentes React
│   ├── ProductManager.tsx           # EntityManager principal
│   ├── ProductFormDialog.tsx        # FormDialog para produtos
│   ├── ProductChannelsManager.tsx   # Manager de canais
│   └── ProductSupplierManager.tsx   # Manager de fornecedores
├── hooks/              # Custom hooks
│   └── useProducts.ts              # Hook unificado usando useCrudQuery
├── services/           # Services
│   └── ProductService.ts           # BaseCrudService extension
├── types/              # TypeScript types
│   ├── product.ts
│   └── productChannels.ts
├── constants/          # Constantes
│   └── product.ts
└── pages/              # Páginas
    ├── ProductListPage.tsx
    └── ProductDetailPage.tsx
```

## Como Usar

### Listar Produtos
```typescript
import { ProductManager } from '@/features/products/components/ProductManager';

function MyProductsPage() {
  return <ProductManager />;
}
```

### Hook de Produtos
```typescript
import { useProducts } from '@/features/products/hooks/useProducts';

function MyComponent() {
  const { useGetAll, useCreate, useUpdate, useDelete } = useProducts();
  const { data: products, isLoading } = useGetAll();
  const createMutation = useCreate();
  
  // ...
}
```
```

**Critérios de Aceitação**:
- ✅ Documentação completa da nova arquitetura
- ✅ Exemplos de uso para desenvolvedores
- ✅ Guias de migração detalhados

---

## 📊 **FASE 6: TESTES E VALIDAÇÃO (Semana 6)**

### **Passo 6.1: Testes de Funcionalidade**
**Objetivo**: Garantir que todas as funcionalidades funcionam corretamente

**Checklist de Testes**:

**✅ CRUD Básico**:
- [ ] Criar produto funciona
- [ ] Listar produtos funciona
- [ ] Editar produto funciona
- [ ] Excluir produto funciona
- [ ] Busca funciona corretamente

**✅ Funcionalidades Específicas**:
- [ ] Gerenciamento de canais funciona
- [ ] Vinculação de fornecedores funciona
- [ ] Cálculos de preços estão corretos
- [ ] Upload de imagens funciona
- [ ] Importação/exportação funciona

**✅ UI/UX**:
- [ ] Loading states aparecem corretamente
- [ ] Formulários validam corretamente
- [ ] Notificações de sucesso/erro aparecem
- [ ] Layout responsivo funciona
- [ ] Performance é aceitável

**✅ Integração**:
- [ ] Backend APIs funcionam
- [ ] Cache do React Query funciona
- [ ] Navegação entre páginas funciona
- [ ] Filtros e busca funcionam

---

### **Passo 6.2: Testes de Performance**
**Objetivo**: Validar melhorias de performance

**Métricas a Medir**:
- **Tempo de carregamento inicial**
- **Tempo de renderização de listas**
- **Memória utilizada**
- **Tamanho do bundle**

**Critérios de Aceitação**:
- ✅ Carregamento inicial ≤ 2 segundos
- ✅ Renderização de lista com 100 produtos ≤ 500ms
- ✅ Redução de 30% no tamanho do bundle
- ✅ Menos vazamentos de memória

---

### **Passo 6.3: Testes de Regressão**
**Objetivo**: Garantir que nada foi quebrado

**Áreas Críticas**:
- [ ] Autenticação e autorização
- [ ] Cálculos financeiros
- [ ] Integrações com APIs externas
- [ ] Funcionalidades de outros módulos

---

## 🚀 **CRONOGRAMA DETALHADO**

### **Semana 1: Infraestrutura** (40h)
- **Dia 1-2**: ProductService refatorado (16h)
- **Dia 3-4**: Hook useProducts (16h)
- **Dia 5**: Migração de tipos e constantes (8h)

### **Semana 2: Componentes Core** (40h)
- **Dia 1-2**: ProductFormDialog (16h)
- **Dia 3-4**: ProductManager principal (16h)
- **Dia 5**: Refatoração loading states (8h)

### **Semana 3: Componentes Especializados** (40h)
- **Dia 1-2**: ProductChannelsManager (16h)
- **Dia 3-4**: ProductSupplierManager (16h)
- **Dia 5**: Componentes auxiliares (8h)

### **Semana 4: Páginas e Rotas** (40h)
- **Dia 1-2**: Páginas principais (16h)
- **Dia 3-4**: Páginas de detalhes (16h)
- **Dia 5**: Roteamento e navegação (8h)

### **Semana 5: Migração e Limpeza** (40h)
- **Dia 1-2**: Script de migração de imports (16h)
- **Dia 3-4**: Remoção de arquivos legacy (16h)
- **Dia 5**: Documentação (8h)

### **Semana 6: Testes e Validação** (40h)
- **Dia 1-2**: Testes funcionais (16h)
- **Dia 3-4**: Testes de performance (16h)
- **Dia 5**: Testes de regressão e ajustes (8h)

---

## 📋 **CRITÉRIOS DE SUCESSO**

### **Técnicos**:
- ✅ **77% redução** nas linhas de código
- ✅ **95% eliminação** de duplicação CRUD
- ✅ **90% eliminação** de loading states duplicados
- ✅ **80% eliminação** de formulários duplicados
- ✅ **100% funcionalidade** mantida

### **Qualidade**:
- ✅ **Zero quebras** de funcionalidade
- ✅ **100% cobertura** de testes críticos
- ✅ **Performance igual ou melhor**
- ✅ **UX consistente** em todas as telas

### **Manutenibilidade**:
- ✅ **Arquitetura padronizada** seguindo DRY
- ✅ **Documentação completa** para desenvolvedores
- ✅ **Padrões estabelecidos** para futuras features
- ✅ **Facilidade de extensão** para novos requisitos

---

## 🔧 **FERRAMENTAS E RECURSOS**

### **Desenvolvimento**:
- **IDE**: VS Code com extensões TypeScript/React
- **Linting**: ESLint com regras DRY customizadas
- **Testing**: Jest + React Testing Library
- **Build**: Vite com otimizações

### **Validação**:
- **Bundle Analyzer**: Para validar redução de tamanho
- **Performance Profiler**: React DevTools
- **Memory Profiler**: Chrome DevTools
- **Lighthouse**: Para métricas web vitals

### **Documentação**:
- **Storybook**: Para componentes documentados
- **TypeDoc**: Para documentação de tipos
- **Markdown**: Para guias e READMEs

---

## ⚠️ **RISCOS E MITIGAÇÕES**

### **Riscos Identificados**:

1. **Quebra de Funcionalidade** (ALTO)
   - **Mitigação**: Testes extensivos a cada etapa
   - **Rollback**: Manter branch com versão atual

2. **Performance Degradada** (MÉDIO)
   - **Mitigação**: Testes de performance contínuos
   - **Otimização**: Profiling e otimização incremental

3. **Resistência da Equipe** (MÉDIO)
   - **Mitigação**: Treinamento e documentação clara
   - **Suporte**: Sessões de pair programming

4. **Complexidade Subestimada** (MÉDIO)
   - **Mitigação**: Buffer de 20% no cronograma
   - **Priorização**: Funcionalidades críticas primeiro

### **Plano de Contingência**:
- **Backup diário** durante refatoração
- **Feature flags** para rollback rápido
- **Ambiente de staging** para validação
- **Monitoramento** de erros em produção

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Aprovação do Plano**: Revisar e aprovar cronograma
2. **Setup do Ambiente**: Preparar branch e ferramentas
3. **Kick-off**: Iniciar Fase 1 - Infraestrutura
4. **Checkpoint Semanal**: Revisões de progresso
5. **Deploy Gradual**: Release incremental em staging
6. **Go-Live**: Deploy em produção após validação completa

---

**Este plano garante uma refatoração sistemática, segura e eficiente da área de produtos, aplicando todos os princípios DRY e componentes unificados criados, resultando em um código muito mais maintível e uma experiência de desenvolvimento significativamente melhorada.** 🚀