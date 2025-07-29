/**
 * CONTAINER: SupplierProductsTabContainer
 * Lógica de negócio para aba de produtos do fornecedor
 * Extraído de SupplierProductsTabSimple.tsx (1085 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { useSupplierProducts } from '../../hooks/useSupplierProducts';
import { useProductModals } from '../../hooks/useProductModals';
import { SupplierProductsTabPresentation } from './SupplierProductsTabPresentation';

interface SupplierProductsTabContainerProps {
  supplierId: number;
}

export const SupplierProductsTabContainer = ({ 
  supplierId 
}: SupplierProductsTabContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const productsHook = useSupplierProducts(supplierId);
  const modalsHook = useProductModals();

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Products data and actions
    productsProps: {
      products: productsHook.paginatedProducts,
      isLoading: productsHook.isLoading,
      error: productsHook.error,
      totalCount: productsHook.filteredProducts.length,
      
      // Actions
      onEdit: modalsHook.openEditProductDialog,
      onDelete: modalsHook.openDeleteConfirm,
      onExport: productsHook.exportToExcel
    },

    // Filters and pagination
    filtersProps: {
      filters: productsHook.filters,
      onFiltersChange: productsHook.setFilters,
      currentPage: productsHook.currentPage,
      totalPages: productsHook.totalPages,
      onPageChange: productsHook.setCurrentPage
    },

    // Header actions
    headerProps: {
      onAddProduct: modalsHook.openAddProductDialog,
      onImportProducts: modalsHook.openUploadDialog,
      onExportProducts: productsHook.exportToExcel,
      totalCount: productsHook.filteredProducts.length
    },

    // Modal states and actions
    modalsProps: {
      // Add Product Modal
      addProductDialog: {
        open: modalsHook.addProductDialogOpen,
        onOpenChange: modalsHook.closeAddProductDialog,
        onSubmit: async (product: any) => {
          await productsHook.createProduct(product);
          modalsHook.closeAddProductDialog();
        },
        isLoading: productsHook.isCreating
      },

      // Edit Product Modal
      editProductDialog: {
        open: modalsHook.editProductDialogOpen,
        onOpenChange: modalsHook.closeEditProductDialog,
        product: modalsHook.editingProduct,
        onSubmit: async (product: any) => {
          await productsHook.updateProduct(product);
          modalsHook.closeEditProductDialog();
        },
        isLoading: productsHook.isUpdating
      },

      // Delete Confirmation
      deleteConfirm: {
        open: modalsHook.deleteConfirmOpen,
        onOpenChange: modalsHook.closeDeleteConfirm,
        product: modalsHook.productToDelete,
        onConfirm: async () => {
          if (modalsHook.productToDelete) {
            await productsHook.deleteProduct(modalsHook.productToDelete.id);
            modalsHook.closeDeleteConfirm();
          }
        },
        isLoading: productsHook.isDeleting
      },

      // File Upload Modal
      uploadDialog: {
        open: modalsHook.uploadDialogOpen,
        onOpenChange: modalsHook.closeUploadDialog,
        onFileUpload: async (file: File) => {
          await productsHook.handleFileUpload(file);
          modalsHook.closeUploadDialog();
        }
      }
    }
  };

  return <SupplierProductsTabPresentation {...containerProps} />;
};