export interface ProductPackage {
  id: number;
  userId: number;
  name: string;
  description?: string;
  supplier: string;
  totalValue: number;
  totalWeight: number;
  shippingCost: number;
  customsCost: number;
  otherCosts: number;
  finalCost: number;
  status: 'pending' | 'shipped' | 'transit' | 'customs' | 'delivered' | 'cancelled';
  trackingCode?: string;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  products?: PackageProduct[];
}

export interface PackageProduct {
  id: number;
  packageId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
    sku?: string;
    image?: string;
  };
}

export interface PackageFormData {
  name: string;
  description: string;
  supplier: string;
  totalValue: number;
  totalWeight: number;
  shippingCost: number;
  customsCost: number;
  otherCosts: number;
  status: string;
  trackingCode: string;
  orderDate: string;
  expectedDelivery: string;
  notes: string;
}

export interface PackageManagerState {
  packages: ProductPackage[];
  loading: boolean;
  error: string | null;
  editingId: number | null;
  deletingId: number | null;
  showForm: boolean;
  showProducts: boolean;
  selectedPackageId: number | null;
  formData: PackageFormData;
  searchTerm: string;
  statusFilter: string;
  supplierFilter: string;
}

export interface PackageManagerActions {
  handleAdd: () => void;
  handleEdit: (pkg: ProductPackage) => void;
  handleDelete: (id: number) => void;
  handleViewProducts: (id: number) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  updateFormField: (field: keyof PackageFormData, value: any) => void;
  updateSearch: (term: string) => void;
  updateStatusFilter: (status: string) => void;
  updateSupplierFilter: (supplier: string) => void;
  refreshData: () => void;
}

export const PACKAGE_STATUSES = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'shipped', label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  { value: 'transit', label: 'Em Trânsito', color: 'bg-purple-100 text-purple-800' },
  { value: 'customs', label: 'Na Alfândega', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];