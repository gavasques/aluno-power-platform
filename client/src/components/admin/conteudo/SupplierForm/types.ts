export interface SupplierFormData {
  tradeName: string;
  corporateName: string;
  description: string;
  country: string;
  category: string;
  
  // Contact Information
  commercialEmail: string;
  whatsappNumber: string;
  phone: string;
  website: string;
  
  // Business Details
  paymentTerms: string;
  minimumOrder: string;
  deliveryTime: string;
  certifications: string;
  
  // Ratings and Notes
  qualityRating: number;
  communicationRating: number;
  deliveryRating: number;
  priceRating: number;
  overallRating: number;
  internalNotes: string;
  
  // Status
  isActive: boolean;
  isPremium: boolean;
  isVerified: boolean;
}

export interface SupplierFormState {
  formData: SupplierFormData;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  supplierId: number | null;
}

export interface SupplierFormActions {
  updateField: (field: keyof SupplierFormData, value: any) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  setEditMode: (supplier: any) => void;
}

export interface SupplierFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editingSupplier?: any;
}

export const COUNTRIES = [
  'China',
  'Estados Unidos',
  'Alemanha',
  'Japão',
  'Reino Unido',
  'França',
  'Itália',
  'Coreia do Sul',
  'Canadá',
  'Índia',
  'Brasil',
  'México',
  'Outros'
];

export const CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda e Acessórios',
  'Esportes e Lazer',
  'Saúde e Beleza',
  'Automotivo',
  'Brinquedos',
  'Livros e Mídia',
  'Instrumentos Musicais',
  'Escritório e Negócios',
  'Outros'
];

export const PAYMENT_TERMS = [
  'T/T (Transferência Bancária)',
  'L/C (Carta de Crédito)',
  'Western Union',
  'PayPal',
  'Trade Assurance',
  '30% antecipado, 70% antes do envio',
  '50% antecipado, 50% antes do envio',
  'Pagamento total antecipado',
  'Outros'
];