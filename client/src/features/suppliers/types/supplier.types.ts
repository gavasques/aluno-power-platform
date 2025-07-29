/**
 * Types centralizados para o módulo de Suppliers
 * Extraído de InternationalSupplierDetail.tsx para organização modular
 */

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

// Hook return types
export interface UseSupplierDataReturn {
  supplier: Supplier | null;
  contacts: Contact[];
  contracts: Contract[];
  communications: Communication[];
  documents: SupplierDocument[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseSupplierActionsReturn {
  updateSupplier: (data: Partial<Supplier>) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateContact: (id: number, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  addContract: (contract: Omit<Contract, 'id' | 'documents'>) => Promise<void>;
  updateContract: (id: number, data: Partial<Contract>) => Promise<void>;
  deleteContract: (id: number) => Promise<void>;
  uploadDocument: (file: File, category: SupplierDocument['category']) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addCommunication: (communication: Omit<Communication, 'id'>) => Promise<void>;
}

export interface UseSupplierModalsReturn {
  isContactModalOpen: boolean;
  isContractModalOpen: boolean;
  isDocumentModalOpen: boolean;
  isCommunicationModalOpen: boolean;
  editingContact: Contact | null;
  editingContract: Contract | null;
  openContactModal: (contact?: Contact) => void;
  closeContactModal: () => void;
  openContractModal: (contract?: Contract) => void;
  closeContractModal: () => void;
  openDocumentModal: () => void;
  closeDocumentModal: () => void;
  openCommunicationModal: () => void;
  closeCommunicationModal: () => void;
}

// Tab state management
export type SupplierTab = 'overview' | 'contacts' | 'contracts' | 'documents' | 'communications';

export interface UseSupplierTabsReturn {
  activeTab: SupplierTab;
  setActiveTab: (tab: SupplierTab) => void;
}

// Filter types
export interface SupplierFilters {
  contractStatus?: Contract['status'];
  documentCategory?: SupplierDocument['category'];
  communicationType?: Communication['type'];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface UseSupplierFiltersReturn {
  filters: SupplierFilters;
  updateFilter: <K extends keyof SupplierFilters>(key: K, value: SupplierFilters[K]) => void;
  clearFilters: () => void;
  filteredContracts: Contract[];
  filteredDocuments: SupplierDocument[];
  filteredCommunications: Communication[];
}