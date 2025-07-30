/**
 * Types para ImportedProductSuppliersTab
 * Estado unificado para gerenciamento de fornecedores de produtos importados
 */

export interface InternationalSupplier {
  id: number;
  name: string;
  country: string;
  city: string;
  contact: string;
  email: string;
  whatsapp: string;
  productCategories: string[];
}

export interface ProductSupplier {
  id: number;
  productId: string;
  supplierId: number;
  cost: number;
  moq: number;
  leadTimeDays: number;
  isMainSupplier: boolean;
  supplier: InternationalSupplier;
}

export interface ProductSupplierFormData {
  supplierId: number;
  cost: number;
  moq: number;
  leadTimeDays: number;
  isMainSupplier: boolean;
}

// Estado unificado para o componente
export interface ImportedProductSuppliersState {
  ui: {
    loading: boolean;
    showAddDialog: boolean;
    showEditDialog: boolean;
    sortBy: 'cost' | 'moq' | 'leadTime' | 'name';
    sortOrder: 'asc' | 'desc';
  };
  form: ProductSupplierFormData;
  selected: {
    editingSupplier: ProductSupplier | null;
  };
  data: {
    suppliers: InternationalSupplier[];
    productSuppliers: ProductSupplier[];
  };
}

// Actions para o reducer
export type ImportedProductSuppliersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SHOW_ADD_DIALOG'; payload: boolean }
  | { type: 'SET_SHOW_EDIT_DIALOG'; payload: boolean }
  | { type: 'SET_SORT'; payload: { sortBy: ImportedProductSuppliersState['ui']['sortBy']; sortOrder: ImportedProductSuppliersState['ui']['sortOrder'] } }
  | { type: 'UPDATE_FORM_FIELD'; field: keyof ProductSupplierFormData; value: any }
  | { type: 'SET_EDITING_SUPPLIER'; payload: ProductSupplier | null }
  | { type: 'SET_SUPPLIERS_DATA'; payload: InternationalSupplier[] }
  | { type: 'SET_PRODUCT_SUPPLIERS_DATA'; payload: ProductSupplier[] }
  | { type: 'LOAD_SUPPLIER_FOR_EDIT'; payload: ProductSupplier }
  | { type: 'RESET_FORM' };