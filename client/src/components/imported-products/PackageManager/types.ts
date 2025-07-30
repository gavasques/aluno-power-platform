export interface ProductPackage {
  id: string;
  packageNumber: number;
  packageType: string;
  contentsDescription: string;
  packageEan: string;
  dimensionsLength: number;
  dimensionsWidth: number;
  dimensionsHeight: number;
  weightGross: number;
  weightNet: number;
  volumeCbm: number;
  unitsInPackage: number;
  packagingMaterial: string;
  specialHandling: string;
}

export interface PackageManagerState {
  packages: ProductPackage[];
  loading: boolean;
  showAddForm: boolean;
  editingId: string | null;
  showDeleteModal: boolean;
  packageToDelete: ProductPackage | null;
  formData: Partial<ProductPackage>;
  error: string | null;
}

export interface PackageManagerActions {
  loadPackages: () => void;
  createPackage: () => Promise<void>;
  updatePackage: () => Promise<void>;
  deletePackage: (pkg: ProductPackage) => void;
  confirmDelete: () => Promise<void>;
  startEditing: (pkg: ProductPackage) => void;
  startCreating: () => void;
  cancelForm: () => void;
  updateFormField: (field: keyof ProductPackage, value: any) => void;
  calculateVolume: () => void;
}

export const PACKAGE_TYPES = [
  'CAIXA',
  'ENVELOPE',
  'PALLET',
  'CONTAINER',
  'SACO',
  'BOBINA',
  'TUBO',
  'OUTRO'
];

export const PACKAGING_MATERIALS = [
  'Papelão',
  'Madeira',
  'Plástico',
  'Metal',
  'Tecido',
  'Isopor',
  'Bolha',
  'Outro'
];

export const SPECIAL_HANDLING = [
  'Frágil',
  'Inflamável',
  'Perecível',
  'Líquido',
  'Pesado',
  'Valor Alto',
  'Temperatura Controlada',
  'Normal'
];