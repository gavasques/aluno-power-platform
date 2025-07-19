/**
 * Script de Migração de Imports - Produtos
 * 
 * Este script documenta todas as mudanças de imports necessárias
 * para migrar para a nova estrutura de produtos.
 */

// ============================================================================
// MAPEAMENTO DE IMPORTS PARA MIGRAÇÃO
// ============================================================================

export const IMPORT_MAPPINGS = {
  // Services
  'from "@/services/productService"': 'from "@/features/products/services/ProductService"',
  'from "@/contexts/ProductContext"': 'from "@/features/products/hooks/useProducts"',
  
  // Components
  'from "@/components/product/BasicProductForm"': 'from "@/features/products/components/ProductFormDialog"',
  'from "@/components/product/ProductList"': 'from "@/features/products/components/ProductManager"',
  'from "@/pages/myarea/MyProductsList"': 'from "@/features/products/pages/ProductListPage"',
  'from "@/pages/myarea/ProductDetail"': 'from "@/features/products/pages/ProductDetailPage"',
  'from "@/components/product/ProductSupplierManager"': 'from "@/features/products/components/ProductSupplierManager"',
  'from "@/pages/myarea/ProductChannelsManager"': 'from "@/features/products/components/ProductChannelsManager"',
  
  // Types
  'from "@/types/product"': 'from "@/features/products/types"',
  'from "@/shared/types/productSupplier"': 'from "@/features/products/types/productSupplier"',
  'from "@/types/core/product"': 'from "@/features/products/types/product"',
  
  // Constants
  'from "@/shared/constants/product"': 'from "@/features/products/constants"',
  'from "@/shared/constants/channels"': 'from "@/features/products/constants/channels"',
  
  // Utils
  'from "@/utils/productCalculations"': 'from "@/lib/utils/unifiedFormatters"',
  'from "@/shared/utils/productCalculations"': 'from "@/lib/utils/unifiedFormatters"',
};

// ============================================================================
// SUBSTITUIÇÕES DE HOOKS E COMPONENTES
// ============================================================================

export const HOOK_REPLACEMENTS = {
  // Context to Hook
  'useProductContext': 'useProducts',
  'ProductProvider': '// Removed - use useProducts hook directly',
  'useProductForm': 'useProducts',
  'useEditProductForm': 'useProducts',
  
  // New specialized hooks
  'useProductChannels': 'from "@/features/products/hooks/useProducts"',
  'useProductCosts': 'from "@/features/products/hooks/useProducts"', 
  'useProductStatus': 'from "@/features/products/hooks/useProducts"',
  'useProductImportExport': 'from "@/features/products/hooks/useProducts"',
};

export const COMPONENT_REPLACEMENTS = {
  // Form components
  'BasicProductForm': 'ProductFormDialog',
  'ProductForm': 'ProductFormDialog',
  
  // List components  
  'ProductList': 'ProductManager',
  'MyProductsList': 'ProductManager',
  'ProductsTable': 'ProductManager',
  
  // Manager components
  'ProductSupplierManager': 'ProductSupplierManager', // Same name, different path
  'ProductChannelsManager': 'ProductChannelsManager', // Same name, different path
  
  // Loading components
  'LoadingSpinner': 'PageLoadingState', // ou outro LoadingState apropriado
  'ButtonLoader': 'LoadingButton',
};

// ============================================================================
// ARQUIVOS QUE PRECISAM SER ATUALIZADOS
// ============================================================================

export const FILES_TO_UPDATE = [
  // Pages
  '/pages/myarea/MyProductsList.tsx',
  '/pages/myarea/ProductDetail.tsx', 
  '/pages/myarea/ProductBasicDataEdit.tsx',
  '/pages/myarea/ProductChannelsEditPage.tsx',
  '/pages/myarea/ProductCostsEdit.tsx',
  '/pages/myarea/ProductEdit.tsx',
  '/pages/myarea/ProductEditWithTabs.tsx',
  '/pages/myarea/ProductPreview.tsx',
  '/pages/myarea/ProductsNew.tsx',
  
  // Components que usam produtos
  '/components/product/ProductCodeDisplay.tsx',
  '/components/product/ProductFilters.tsx',
  '/components/product/ChannelsEditor.tsx',
  '/components/product/ColumnPreferencesManager.tsx',
  '/components/product/ProductDescriptionsModal.tsx',
  '/components/supplier/SupplierProductsTab.tsx',
  '/components/supplier/SupplierProductsTabSimple.tsx',
  '/shared/components/ProductActionButtons.tsx',
  '/shared/components/ProductNavigation.tsx',
  
  // Hooks que referenciam produtos
  '/hooks/useProductForm.ts',
  '/hooks/useEditProductForm.ts',
  '/hooks/useProducts.ts', // Será substituído
  '/shared/hooks/useProductMutation.ts',
  '/shared/hooks/useProductQuery.ts',
  '/shared/hooks/useUrlProductId.ts',
  
  // Outros arquivos
  '/shared/utils/productCalculations.ts',
  '/shared/utils/channelCalculations.ts',
  '/shared/utils/productSupplierUtils.ts',
];

// ============================================================================
// ROTAS QUE PRECISAM SER ATUALIZADAS  
// ============================================================================

export const ROUTE_UPDATES = {
  // Rotas antigas -> novas
  '/minha-area/produtos': 'ProductListPage',
  '/minha-area/produtos/:id': 'ProductDetailPage',
  '/minha-area/produtos/:id/editar-dados': 'ProductBasicDataEdit (updated)',
  '/minha-area/produtos/:id/editar-custos': 'ProductCostsEdit (updated)',
  '/minha-area/produtos/:id/editar-canais': 'ProductChannelsManager (updated)',
  '/minha-area/produtos/:id/fornecedores': 'ProductSupplierManager (updated)',
  '/minha-area/produtos/novo': 'ProductFormDialog (updated)',
};

// ============================================================================
// TRANSFORMAÇÕES DE CÓDIGO ESPECÍFICAS
// ============================================================================

export const CODE_TRANSFORMATIONS = {
  // Context Provider removal
  OLD_PROVIDER_USAGE: `
    <ProductProvider>
      <MyComponent />
    </ProductProvider>
  `,
  NEW_HOOK_USAGE: `
    // Remove provider, use hook directly in component
    function MyComponent() {
      const { useGetAll, useCreate } = useProducts();
      // ... rest of component
    }
  `,

  // Form component transformation
  OLD_FORM_USAGE: `
    <BasicProductForm
      productData={data}
      onInputChange={handleChange}
      onPhotoUpload={handleUpload}
      mockSuppliers={suppliers}
      mockCategories={categories}
      mockBrands={brands}
    />
  `,
  NEW_FORM_USAGE: `
    <ProductFormDialog
      data={data}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isSubmitting}
    />
  `,

  // List component transformation
  OLD_LIST_USAGE: `
    <MyProductsList />
  `,
  NEW_LIST_USAGE: `
    <ProductManager />
  `,

  // Hook usage transformation
  OLD_HOOK_USAGE: `
    const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProductContext();
  `,
  NEW_HOOK_USAGE: `
    const { useGetAll, useCreate, useUpdate, useDelete } = useProducts();
    const { data: products, isLoading: loading, error } = useGetAll();
    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();
  `,

  // Loading state transformation
  OLD_LOADING: `
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>Carregando...</p>
        </div>
      );
    }
  `,
  NEW_LOADING: `
    if (isLoading) {
      return <PageLoadingState message="Carregando..." />;
    }
  `,

  // Button loading transformation
  OLD_BUTTON_LOADING: `
    <Button disabled={isSubmitting}>
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSubmitting ? "Salvando..." : "Salvar"}
    </Button>
  `,
  NEW_BUTTON_LOADING: `
    <LoadingButton 
      loading={isSubmitting} 
      loadingText="Salvando..."
    >
      Salvar
    </LoadingButton>
  `,
};

// ============================================================================
// CHECKLIST DE MIGRAÇÃO
// ============================================================================

export const MIGRATION_CHECKLIST = [
  '✅ Atualizar imports de services',
  '✅ Substituir useProductContext por useProducts',
  '✅ Remover ProductProvider do App.tsx',
  '✅ Atualizar imports de componentes',
  '✅ Substituir BasicProductForm por ProductFormDialog', 
  '✅ Substituir MyProductsList por ProductManager',
  '✅ Atualizar loading states manuais',
  '✅ Verificar tipos e constantes',
  '✅ Testar funcionalidades críticas',
  '✅ Verificar build sem erros',
  '✅ Remover arquivos legacy',
  '✅ Atualizar documentação',
];

// ============================================================================
// EXEMPLO DE MIGRAÇÃO COMPLETA DE ARQUIVO
// ============================================================================

export const COMPLETE_FILE_EXAMPLE = {
  BEFORE: `
    // ANTES - MyProductsList.tsx
    import React, { useState } from 'react';
    import { useProducts } from '@/hooks/useProducts';
    import { BasicProductForm } from '@/components/product/BasicProductForm';
    import { LoadingSpinner } from '@/components/common/LoadingSpinner';
    import { Button } from '@/components/ui/button';
    import { Loader2 } from 'lucide-react';

    export default function MyProductsList() {
      const { products, loading, error, addProduct } = useProductContext();
      const [isSubmitting, setIsSubmitting] = useState(false);

      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p>Carregando produtos...</p>
          </div>
        );
      }

      const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
          await addProduct(data);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div>
          <Button disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          
          <BasicProductForm onSubmit={handleSubmit} />
          
          {/* Lista de produtos */}
        </div>
      );
    }
  `,
  
  AFTER: `
    // DEPOIS - ProductListPage.tsx
    import React from 'react';
    import { ProductManager } from '@/features/products/components/ProductManager';
    import { PageLoadingState } from '@/components/common/LoadingStates';

    export default function ProductListPage() {
      return (
        <div className="space-y-6">
          <ProductManager />
        </div>
      );
    }
  `,
};

export default {
  IMPORT_MAPPINGS,
  HOOK_REPLACEMENTS,
  COMPONENT_REPLACEMENTS,
  FILES_TO_UPDATE,
  ROUTE_UPDATES,
  CODE_TRANSFORMATIONS,
  MIGRATION_CHECKLIST,
  COMPLETE_FILE_EXAMPLE,
};