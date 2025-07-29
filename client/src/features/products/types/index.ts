/**
 * TYPES: Imported Product Detail
 * Tipos centralizados para detalhes de produtos importados
 * Extraído de ImportedProductDetail.tsx (1020 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== CORE PRODUCT TYPES =====
export interface ImportedProduct {
  id: string;
  name: string;
  internalCode: string;
  status: 'research' | 'analysis' | 'negotiation' | 'ordered' | 'shipped' | 'arrived' | 'cancelled';
  description?: string;
  detailedDescription?: string;
  category?: string;
  brand?: string;
  model?: string;
  reference?: string;
  color?: string;
  size?: string;
  variation1?: string;
  variation2?: string;
  material?: string;
  technicalSpecifications?: string;
  hasMultiplePackages: boolean;
  totalPackages: number;
  hsCode?: string;
  ncmCode?: string;
  ipiPercentage?: number;
  productEan?: string;
  productUpc?: string;
  internalBarcode?: string;
  customsDescription?: string;
  supplierId?: number;
  supplierName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  supplierDescription?: string;
  moq?: number;
  leadTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  filename: string;
  originalName: string;
  url: string;
  position: number;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface ProductSupplier {
  id: string;
  supplierId: number;
  supplierName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  moq?: number;
  leadTimeDays?: number;
}

export interface ProductPackage {
  id: string;
  productId: string;
  packageNumber: number;
  description?: string;
  quantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
  currency?: string;
  notes?: string;
}

// ===== EXTENDED PRODUCT DATA =====
export interface ProductDetailView extends ImportedProduct {
  images: ProductImage[];
  suppliers: ProductSupplier[];
  packages: ProductPackage[];
}

// ===== STATUS MANAGEMENT =====
export const PRODUCT_STATUSES = [
  'research',
  'analysis', 
  'negotiation',
  'ordered',
  'shipped',
  'arrived',
  'cancelled'
] as const;

export type ProductStatus = typeof PRODUCT_STATUSES[number];

export const STATUS_CONFIG: Record<ProductStatus, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  research: {
    label: 'Pesquisa',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  analysis: {
    label: 'Análise',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  negotiation: {
    label: 'Negociação',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  ordered: {
    label: 'Pedido',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  arrived: {
    label: 'Chegou',
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  }
};

// ===== HOOK RETURN TYPES =====
export interface UseProductDetailReturn {
  product: ProductDetailView | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseProductActionsReturn {
  generatePDF: (product: ImportedProduct) => Promise<void>;
  downloadImages: (images: ProductImage[]) => Promise<void>;
  updateStatus: (productId: string, status: ProductStatus) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

export interface UseProductImagesReturn {
  images: ProductImage[];
  selectedImage: ProductImage | null;
  setSelectedImage: (image: ProductImage | null) => void;
  isImageModalOpen: boolean;
  openImageModal: (image: ProductImage) => void;
  closeImageModal: () => void;
}

// ===== COMPONENT PROPS TYPES =====
export interface ProductHeaderProps {
  product: ImportedProduct;
  onGeneratePDF: () => void;
  onDownloadImages: () => void;
  isGeneratingPDF: boolean;
}

export interface ProductInfoCardProps {
  product: ImportedProduct;
  title: string;
  children: React.ReactNode;
}

export interface ProductImagesGridProps {
  images: ProductImage[];
  onImageClick: (image: ProductImage) => void;
}

export interface ProductSuppliersTableProps {
  suppliers: ProductSupplier[];
  product: ImportedProduct;
}

export interface ProductPackagesTableProps {
  packages: ProductPackage[];
}

export interface ProductImageModalProps {
  image: ProductImage | null;
  isOpen: boolean;
  onClose: () => void;
}

// ===== UTILITY TYPES =====
export interface ProductDetailSections {
  basicInfo: boolean;
  technicalSpecs: boolean;
  supplierInfo: boolean;
  customsInfo: boolean;
  images: boolean;
  packages: boolean;
}

export interface ExportOptions {
  includeSections: ProductDetailSections;
  format: 'pdf' | 'excel';
  includeImages: boolean;
}

// ===== API TYPES =====
export interface ProductDetailApiResponse {
  product: ImportedProduct;
  images: ProductImage[];
  suppliers: ProductSupplier[];
  packages: ProductPackage[];
}

export interface UpdateProductStatusRequest {
  productId: string;
  status: ProductStatus;
  notes?: string;
}

export interface DeleteProductRequest {
  productId: string;
  reason?: string;
}

// ===== CONSTANTS =====
export const PRODUCT_FIELDS = {
  BASIC: ['name', 'internalCode', 'status', 'description', 'category', 'brand'],
  TECHNICAL: ['model', 'reference', 'color', 'size', 'material', 'technicalSpecifications'],
  CUSTOMS: ['hsCode', 'ncmCode', 'ipiPercentage', 'customsDescription'],
  IDENTIFICATION: ['productEan', 'productUpc', 'internalBarcode'],
  SUPPLIER: ['supplierName', 'supplierProductCode', 'supplierProductName', 'moq', 'leadTimeDays']
} as const;

export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  THUMBNAIL_SIZE: 150,
  PREVIEW_SIZE: 800
} as const;