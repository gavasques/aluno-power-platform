/**
 * INTERNATIONAL SUPPLIER DETAIL - TYPES
 * FASE 4 REFATORAÇÃO - Container/Presentational Pattern
 * 
 * Centralização de todos os tipos para eliminar as 15+ interfaces
 * definidas no arquivo original de 1.853 linhas
 */

export interface Supplier {
  id: number;
  corporateName: string;
  tradeName?: string;
  country: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  fax?: string;
  mobile?: string;
  email?: string;
  website?: string;
  description?: string;
  status: 'ativo' | 'inativo';
  averageRating?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface Contact {
  id: number;
  supplierId: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  supplierId: number;
  title: string;
  type: 'supply' | 'distribution' | 'exclusive' | 'framework' | 'service';
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'pending';
  startDate: string;
  endDate?: string;
  value?: number;
  currency: string;
  terms: string;
  clauses: ContractClause[];
  documents: SupplierDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  type: 'payment' | 'delivery' | 'quality' | 'warranty' | 'termination' | 'general';
  order: number;
}

export interface SupplierDocument {
  id: number;
  supplierId: number;
  contractId?: number;
  name: string;
  type: 'contract' | 'certificate' | 'license' | 'insurance' | 'tax' | 'quality' | 'other';
  fileUrl: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending_renewal';
  notes?: string;
}

export interface Communication {
  id: number;
  supplierId: number;
  type: 'email' | 'whatsapp' | 'phone' | 'meeting' | 'note';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  contactId?: number;
  attachments?: string[];
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
}

export interface Product {
  id: number;
  supplierId: number;
  name: string;
  sku: string;
  category: string;
  description: string;
  specifications: Record<string, any>;
  price: number;
  currency: string;
  minimumOrder: number;
  leadTime: string;
  images: string[];
  certifications: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface SupplierFormData {
  corporateName: string;
  tradeName?: string;
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  fax?: string;
  mobile?: string;
  email?: string;
  website?: string;
  description?: string;
  status: 'ativo' | 'inativo';
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  isPrimary: boolean;
  notes?: string;
}

export interface ContractFormData {
  title: string;
  type: 'supply' | 'distribution' | 'exclusive' | 'framework' | 'service';
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'pending';
  startDate: string;
  endDate?: string;
  value?: number;
  currency: string;
  terms: string;
  clauses: ContractClause[];
}

export interface CommunicationFormData {
  type: 'email' | 'whatsapp' | 'phone' | 'meeting' | 'note';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  contactId?: number;
  attachments?: string[];
}

export interface DocumentUploadData {
  name: string;
  type: 'contract' | 'certificate' | 'license' | 'insurance' | 'tax' | 'quality' | 'other';
  file: File;
  contractId?: number;
  expiryDate?: string;
  notes?: string;
}

// UI State Types
export interface TabState {
  activeTab: 'overview' | 'contacts' | 'contracts' | 'documents' | 'communications' | 'products';
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export interface ModalState {
  isContactModalOpen: boolean;
  isContractModalOpen: boolean;
  isDocumentModalOpen: boolean;
  isCommunicationModalOpen: boolean;
  editingContact: Contact | null;
  editingContract: Contract | null;
  editingCommunication: Communication | null;
}

export interface FilterState {
  contacts: {
    department: string;
    isPrimary?: boolean;
    search: string;
  };
  contracts: {
    type: string;
    status: string;
    search: string;
  };
  documents: {
    type: string;
    status: string;
    search: string;
  };
  communications: {
    type: string;
    direction: string;
    search: string;
    dateRange?: [string, string];
  };
}

// Hook Return Types
export interface UseSupplierDataReturn {
  supplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateSupplier: (data: Partial<SupplierFormData>) => Promise<void>;
}

export interface UseSupplierActionsReturn {
  // Contact actions
  contacts: Contact[];
  addContact: (data: ContactFormData) => Promise<void>;
  updateContact: (id: number, data: ContactFormData) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  
  // Contract actions
  contracts: Contract[];
  addContract: (data: ContractFormData) => Promise<void>;
  updateContract: (id: number, data: ContractFormData) => Promise<void>;
  deleteContract: (id: number) => Promise<void>;
  
  // Document actions
  documents: SupplierDocument[];
  uploadDocument: (data: DocumentUploadData) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  
  // Communication actions
  communications: Communication[];
  addCommunication: (data: CommunicationFormData) => Promise<void>;
  deleteCommunication: (id: number) => Promise<void>;
  
  // Loading states
  isLoadingContacts: boolean;
  isLoadingContracts: boolean;
  isLoadingDocuments: boolean;
  isLoadingCommunications: boolean;
}

export interface UseSupplierTabsReturn {
  tabState: TabState;
  setActiveTab: (tab: TabState['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

export interface UseSupplierModalsReturn {
  modalState: ModalState;
  openContactModal: (contact?: Contact) => void;
  closeContactModal: () => void;
  openContractModal: (contract?: Contract) => void;
  closeContractModal: () => void;
  openDocumentModal: () => void;
  closeDocumentModal: () => void;
  openCommunicationModal: (communication?: Communication) => void;
  closeCommunicationModal: () => void;
}

export interface UseSupplierFiltersReturn {
  filters: FilterState;
  updateContactsFilter: (filter: Partial<FilterState['contacts']>) => void;
  updateContractsFilter: (filter: Partial<FilterState['contracts']>) => void;
  updateDocumentsFilter: (filter: Partial<FilterState['documents']>) => void;
  updateCommunicationsFilter: (filter: Partial<FilterState['communications']>) => void;
  resetFilters: () => void;
}

// Component Props Types
export interface SupplierOverviewProps {
  supplier: Supplier | null;
  isLoading: boolean;
  onUpdate: (data: Partial<SupplierFormData>) => Promise<void>;
}

export interface SupplierContactsProps {
  contacts: Contact[];
  isLoading: boolean;
  filters: FilterState['contacts'];
  onFiltersChange: (filters: Partial<FilterState['contacts']>) => void;
  onAdd: (data: ContactFormData) => Promise<void>;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => Promise<void>;
}

export interface SupplierContractsProps {
  contracts: Contract[];
  isLoading: boolean;
  filters: FilterState['contracts'];
  onFiltersChange: (filters: Partial<FilterState['contracts']>) => void;
  onAdd: (data: ContractFormData) => Promise<void>;
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => Promise<void>;
}

export interface SupplierDocumentsProps {
  documents: SupplierDocument[];
  isLoading: boolean;
  filters: FilterState['documents'];
  onFiltersChange: (filters: Partial<FilterState['documents']>) => void;
  onUpload: (data: DocumentUploadData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export interface SupplierCommunicationsProps {
  communications: Communication[];
  isLoading: boolean;
  filters: FilterState['communications'];
  onFiltersChange: (filters: Partial<FilterState['communications']>) => void;
  onAdd: (data: CommunicationFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

// Constants
export const BUSINESS_TYPES = [
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Trading Company',
  'Agent',
  'Service Provider'
] as const;

export const COUNTRIES = [
  'China', 'United States', 'Germany', 'Japan', 'United Kingdom', 
  'India', 'South Korea', 'Italy', 'France', 'Canada', 'Brazil',
  'Mexico', 'Spain', 'Netherlands', 'Turkey', 'Taiwan', 'Thailand',
  'Vietnam', 'Malaysia', 'Other'
] as const;

export const CURRENCIES = [
  'USD', 'EUR', 'CNY', 'GBP', 'JPY', 'KRW', 'BRL', 'CAD', 'AUD', 'INR'
] as const;

export const DOCUMENT_TYPES = [
  'contract', 'certificate', 'license', 'insurance', 'tax', 'quality', 'other'
] as const;

export const CONTRACT_TYPES = [
  'supply', 'distribution', 'exclusive', 'framework', 'service'
] as const;

export const CONTRACT_STATUSES = [
  'draft', 'active', 'expired', 'terminated', 'pending'
] as const;

export const COMMUNICATION_TYPES = [
  'email', 'whatsapp', 'phone', 'meeting', 'note'
] as const;