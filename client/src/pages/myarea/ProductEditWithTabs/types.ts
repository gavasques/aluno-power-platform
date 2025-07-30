export interface ProductFormData {
  // Basic Information
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  discountPrice: number;
  profitMargin: number;
  
  // Inventory
  stock: number;
  minimumStock: number;
  weight: number;
  
  // Dimensions
  length: number;
  width: number;
  height: number;
  
  // Additional Info
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  // Images
  mainImage: string;
  additionalImages: string[];
}

export interface ProductEditState {
  formData: ProductFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  activeTab: string;
  isDirty: boolean;
  suppliers: any[];
  categories: any[];
}

export interface ProductEditActions {
  updateField: (field: keyof ProductFormData, value: any) => void;
  updateArrayField: (field: 'tags' | 'additionalImages', value: string[]) => void;
  setActiveTab: (tab: string) => void;
  saveProduct: () => Promise<void>;
  resetForm: () => void;
  uploadImage: (file: File, isMain?: boolean) => Promise<string>;
  removeImage: (index: number) => void;
}

export interface ProductEditWithTabsProps {
  productId?: string;
}

export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda e Acessórios',
  'Esportes e Lazer',
  'Saúde e Beleza',
  'Automotivo',
  'Brinquedos e Jogos',
  'Livros e Mídia',
  'Alimentos e Bebidas',
  'Escritório e Negócios',
  'Instrumentos Musicais',
  'Pets',
  'Outros'
];

export const TABS_CONFIG = [
  { id: 'basic', label: 'Informações Básicas', icon: 'Package' },
  { id: 'pricing', label: 'Preços e Margens', icon: 'DollarSign' },
  { id: 'inventory', label: 'Estoque', icon: 'Archive' },
  { id: 'dimensions', label: 'Dimensões', icon: 'Box' },
  { id: 'images', label: 'Imagens', icon: 'Image' },
  { id: 'seo', label: 'SEO', icon: 'Search' },
  { id: 'suppliers', label: 'Fornecedores', icon: 'Users' }
];