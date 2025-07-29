/**
 * PRESENTATION: SupplierProductsTabPresentation
 * Interface de usuário para aba de produtos do fornecedor
 * Extraído de SupplierProductsTabSimple.tsx (1085 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Download, Package } from 'lucide-react';

// Importar componentes modulares
import { ProductTable } from '../ProductTable/ProductTable';
import { ProductFilters } from '../ProductFilters/ProductFilters';
import { AddProductModal } from '../ProductActions/AddProductModal';
import { EditProductModal } from '../ProductActions/EditProductModal';
import { DeleteConfirmModal } from '../ProductActions/DeleteConfirmModal';
import { FileUploadModal } from '../ProductActions/FileUploadModal';

// Importar tipos
import { SupplierProduct, ProductFilters as FilterType } from '../../hooks/useSupplierProducts';

// ===== INTERFACE TYPES =====
interface ProductsProps {
  products: SupplierProduct[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  onEdit: (product: SupplierProduct) => void;
  onDelete: (product: SupplierProduct) => void;
  onExport: () => void;
}

interface FiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface HeaderProps {
  onAddProduct: () => void;
  onImportProducts: () => void;
  onExportProducts: () => void;
  totalCount: number;
}

interface ModalProps {
  addProductDialog: {
    open: boolean;
    onOpenChange: () => void;
    onSubmit: (product: any) => Promise<void>;
    isLoading: boolean;
  };
  editProductDialog: {
    open: boolean;
    onOpenChange: () => void;
    product: SupplierProduct | null;
    onSubmit: (product: any) => Promise<void>;
    isLoading: boolean;
  };
  deleteConfirm: {
    open: boolean;
    onOpenChange: () => void;
    product: SupplierProduct | null;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
  };
  uploadDialog: {
    open: boolean;
    onOpenChange: () => void;
    onFileUpload: (file: File) => Promise<void>;
  };
}

interface SupplierProductsTabPresentationProps {
  productsProps: ProductsProps;
  filtersProps: FiltersProps;
  headerProps: HeaderProps;
  modalsProps: ModalProps;
}

export const SupplierProductsTabPresentation = ({
  productsProps,
  filtersProps,
  headerProps,
  modalsProps
}: SupplierProductsTabPresentationProps) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Catálogo de Produtos</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Gerencie os produtos deste fornecedor
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {headerProps.totalCount} produtos
              </Badge>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={headerProps.onImportProducts}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar Excel
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={headerProps.onExportProducts}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                
                <Button
                  onClick={headerProps.onAddProduct}
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <ProductFilters {...filtersProps} />

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <ProductTable {...productsProps} />
        </CardContent>
      </Card>

      {/* Modals */}
      <AddProductModal
        open={modalsProps.addProductDialog.open}
        onOpenChange={modalsProps.addProductDialog.onOpenChange}
        onSubmit={modalsProps.addProductDialog.onSubmit}
        isLoading={modalsProps.addProductDialog.isLoading}
      />

      <EditProductModal
        open={modalsProps.editProductDialog.open}
        onOpenChange={modalsProps.editProductDialog.onOpenChange}
        product={modalsProps.editProductDialog.product}
        onSubmit={modalsProps.editProductDialog.onSubmit}
        isLoading={modalsProps.editProductDialog.isLoading}
      />

      <DeleteConfirmModal
        open={modalsProps.deleteConfirm.open}
        onOpenChange={modalsProps.deleteConfirm.onOpenChange}
        product={modalsProps.deleteConfirm.product}
        onConfirm={modalsProps.deleteConfirm.onConfirm}
        isLoading={modalsProps.deleteConfirm.isLoading}
      />

      <FileUploadModal
        open={modalsProps.uploadDialog.open}
        onOpenChange={modalsProps.uploadDialog.onOpenChange}
        onFileUpload={modalsProps.uploadDialog.onFileUpload}
      />
    </div>
  );
};