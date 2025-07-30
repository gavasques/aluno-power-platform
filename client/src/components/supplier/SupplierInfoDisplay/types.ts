export interface Supplier {
  id: number;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactPerson?: string;
  description?: string;
  rating?: number;
  isActive: boolean;
  tags?: string[];
  commercialTerms?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  minimumOrder?: number;
  leadTime?: number;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInfoState {
  isEditing: boolean;
  editingSection: string | null;
  formData: Partial<Supplier>;
  hasChanges: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface SupplierInfoActions {
  startEditing: (section: string) => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<void>;
  updateFormField: (field: keyof Supplier, value: any) => void;
  updateRating: (rating: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

export const SUPPLIER_SECTIONS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    fields: ['name', 'companyName', 'email', 'phone', 'website', 'contactPerson']
  },
  {
    id: 'address',
    title: 'Endereço',
    fields: ['address', 'city', 'state', 'zipCode', 'country']
  },
  {
    id: 'commercial',
    title: 'Termos Comerciais',
    fields: ['commercialTerms', 'paymentTerms', 'deliveryTerms', 'minimumOrder', 'leadTime']
  },
  {
    id: 'banking',
    title: 'Dados Bancários',
    fields: ['bankName', 'accountNumber', 'routingNumber', 'swiftCode']
  },
  {
    id: 'description',
    title: 'Descrição e Avaliação',
    fields: ['description', 'rating', 'tags']
  }
] as const;

export type SupplierSection = typeof SUPPLIER_SECTIONS[number]['id'];