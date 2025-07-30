export interface ProductSupplier {
  id: number;
  productId: number;
  supplierId: number;
  isMainSupplier: boolean;
  costPrice: number;
  minimumOrder: number;
  leadTime: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: number;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    country?: string;
    rating?: number;
  };
}

export interface SupplierFormData {
  supplierId: number;
  isMainSupplier: boolean;
  costPrice: number;
  minimumOrder: number;
  leadTime: number;
  notes: string;
}

export interface ImportedProductSuppliersState {
  suppliers: ProductSupplier[];
  availableSuppliers: any[];
  loading: boolean;
  error: string | null;
  editingId: number | null;
  deletingId: number | null;
  showForm: boolean;
  formData: SupplierFormData;
  searchTerm: string;
  sortBy: 'name' | 'cost' | 'leadTime' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface ImportedProductSuppliersActions {
  handleAdd: () => void;
  handleEdit: (supplier: ProductSupplier) => void;
  handleDelete: (id: number) => void;
  handleSetMainSupplier: (id: number) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  updateFormField: (field: keyof SupplierFormData, value: any) => void;
  updateSearch: (term: string) => void;
  updateSort: (field: 'name' | 'cost' | 'leadTime' | 'rating') => void;
  refreshData: () => void;
}

export interface ImportedProductSuppliersTabProps {
  productId: number;
}