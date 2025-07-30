export interface ContaBancaria {
  id: number;
  userId: number;
  empresaId: number;
  bankName: string;
  accountType: string;
  agency: string;
  account: string;
  accountDigit?: string;
  pixKey?: string;
  pixKeyType?: string;
  initialBalance: number;
  currentBalance?: number;
  isActive: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContaBancariaForm {
  empresaId: number;
  bankName: string;
  accountType: string;
  agency: string;
  account: string;
  accountDigit: string;
  pixKey: string;
  pixKeyType: string;
  initialBalance: number;
  isActive: boolean;
  observations: string;
}

export interface ContasBancariasState {
  contas: ContaBancaria[];
  loading: boolean;
  error: string | null;
  editingId: number | null;
  deletingId: number | null;
  showForm: boolean;
  formData: ContaBancariaForm;
  searchTerm: string;
  filterActive: 'all' | 'active' | 'inactive';
  filterBank: string;
}

export interface ContasBancariasActions {
  handleAdd: () => void;
  handleEdit: (conta: ContaBancaria) => void;
  handleDelete: (id: number) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  updateFormField: (field: keyof ContaBancariaForm, value: any) => void;
  updateSearch: (term: string) => void;
  updateFilter: (filter: 'all' | 'active' | 'inactive') => void;
  updateBankFilter: (bank: string) => void;
  refreshData: () => void;
}

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Conta Poupança' },
  { value: 'business', label: 'Conta Empresarial' },
  { value: 'investment', label: 'Conta Investimento' }
];

export const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' }
];