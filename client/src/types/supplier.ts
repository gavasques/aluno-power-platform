export interface Supplier {
  id: number;
  name: string;
  country: string;
  city: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  website?: string;
  email?: string;
  phone?: string;
  rating: number;
  totalOrders: number;
  lastContact: string;
  establishedYear?: number;
  description?: string;
}

export interface Contract {
  id: number;
  supplierId: number;
  contractNumber: string;
  title: string;
  description?: string;
  contractType: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate?: string;
  endDate?: string;
  value?: number;
  currency: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  incoterms?: string;
  documents: ContractDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  description?: string;
}

export interface Contact {
  id: number;
  name: string;
  position: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  isMainContact: boolean;
}

export interface Communication {
  id: number;
  type: 'email' | 'whatsapp' | 'phone' | 'meeting';
  subject: string;
  date: string;
  status: 'sent' | 'received' | 'pending';
  summary: string;
}

export interface SupplierDocument {
  id: string;
  supplierId: number;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  category: 'certificate' | 'license' | 'contract' | 'quality' | 'other';
  uploadedAt: string;
  description?: string;
}

export interface SupplierFormData {
  corporateName: string;
  tradeName: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  supplierType: string;
  status: string;
  averageRating: number;
  description: string;
}

export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';
export type CommunicationType = 'email' | 'whatsapp' | 'phone' | 'meeting';
export type DocumentCategory = 'certificate' | 'license' | 'contract' | 'quality' | 'other';