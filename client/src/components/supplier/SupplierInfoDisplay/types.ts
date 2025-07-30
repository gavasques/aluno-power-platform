import type { Supplier, Department } from '@shared/schema';

export interface SupplierEditState {
  editingBasic: boolean;
  editingDescription: boolean;
  editingAdditionalInfo: boolean;
  editingCommercialTerms: boolean;
  editingBankingData: boolean;
}

export interface SupplierFormData {
  basic: {
    tradeName: string;
    corporateName: string;
    cnpj: string;
    categoryId: number | null;
    supplierType: string;
    country: string;
    state: string;
    city: string;
    cep: string;
    address: string;
    stateRegistration: string;
    municipalRegistration: string;
  };
  description: {
    description: string;
  };
  additionalInfo: {
    additionalInfo: string;
  };
  commercialTerms: {
    paymentTerm: string;
    deliveryTerm: string;
  };
  bankingData: {
    bankingData: string;
  };
}

export interface SupplierInfoActions {
  setEditingSection: (section: keyof SupplierEditState, value: boolean) => void;
  updateFormData: (section: keyof SupplierFormData, data: any) => void;
  saveSection: (section: keyof SupplierFormData) => Promise<void>;
}

export interface SupplierInfoPresentationProps {
  supplier: Supplier;
  departments: Department[];
  editState: SupplierEditState;
  formData: SupplierFormData;
  actions: SupplierInfoActions;
  isUpdating: boolean;
}

export const COUNTRIES = [
  'Brasil', 'China', 'Taiwan', 'Hong Kong', 'Índia', 
  'Turquia', 'Argentina', 'Paraguai', 'Outro'
];

export const SUPPLIER_TYPES = [
  'distribuidora', 'importadora', 'fabricante', 'indústria', 'representante'
];