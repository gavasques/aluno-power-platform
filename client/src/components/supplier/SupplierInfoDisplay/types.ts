export interface SupplierInfo {
  id: number;
  tradeName: string;
  corporateName: string;
  description: string;
  country: string;
  category: string;
  commercialEmail: string;
  supportEmail: string;
  whatsappNumber: string;
  phone: string;
  website: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  paymentTerms: string;
  minimumOrder: string;
  deliveryTime: string;
  certifications: string;
  qualityRating: number;
  communicationRating: number;
  deliveryRating: number;
  priceRating: number;
  overallRating: number;
  internalNotes: string;
  isActive: boolean;
  isPremium: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierContact {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes: string;
}

export interface BankingInfo {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  address: string;
}

export interface SupplierInfoDisplayState {
  supplier: SupplierInfo | null;
  contacts: SupplierContact[];
  bankingInfo: BankingInfo | null;
  loading: boolean;
  error: string | null;
  editingSection: string | null;
  formData: any;
}

export interface SupplierInfoDisplayActions {
  startEditing: (section: string) => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<void>;
  updateFormField: (field: string, value: any) => void;
  refreshData: () => void;
}

export interface SupplierInfoDisplayProps {
  supplierId: number;
}

export const EDITABLE_SECTIONS = {
  BASIC: 'basic',
  CONTACT: 'contact',
  COMMERCIAL: 'commercial',
  BANKING: 'banking'
} as const;

export const RATING_LABELS = {
  qualityRating: 'Qualidade',
  communicationRating: 'Comunicação',
  deliveryRating: 'Entrega',
  priceRating: 'Preço'
};