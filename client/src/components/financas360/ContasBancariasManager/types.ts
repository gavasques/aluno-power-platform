export interface ContaBancaria {
  id: number;
  banco: string;
  agencia: string;
  conta: string;
  digito?: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  titular: string;
  documento: string;
  saldoAtual: number;
  saldoInicial: number;
  pixChaves: PixChave[];
  ativo: boolean;
  descricao?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PixChave {
  id: number;
  tipo: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'chave_aleatoria';
  chave: string;
  ativo: boolean;
}

export interface ContasBancariasState {
  contas: ContaBancaria[];
  filteredContas: ContaBancaria[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterTipo: string;
  filterBanco: string;
  showInactive: boolean;
  selectedConta: ContaBancaria | null;
  isEditing: boolean;
  isCreating: boolean;
  formData: Partial<ContaBancaria>;
}

export interface ContasBancariasActions {
  refreshContas: () => void;
  searchContas: (term: string) => void;
  filterByTipo: (tipo: string) => void;
  filterByBanco: (banco: string) => void;
  toggleShowInactive: () => void;
  selectConta: (conta: ContaBancaria | null) => void;
  startEditing: (conta: ContaBancaria) => void;
  startCreating: () => void;
  updateFormField: (field: keyof ContaBancaria, value: any) => void;
  addPixChave: (chave: Omit<PixChave, 'id'>) => void;
  removePixChave: (index: number) => void;
  saveConta: () => Promise<void>;
  deleteConta: (id: number) => Promise<void>;
  cancelEditing: () => void;
}

export const BANCOS_PRINCIPAIS = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica Federal',
  'Itaú',
  'Santander',
  'BTG Pactual',
  'Inter',
  'Nubank',
  'PicPay',
  'C6 Bank',
  'Safra',
  'Sicoob',
  'Sicredi',
  'Banco Original',
  'Outro'
];

export const TIPOS_CONTA = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Poupança' },
  { value: 'investimento', label: 'Investimento' }
];

export const TIPOS_PIX = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'chave_aleatoria', label: 'Chave Aleatória' }
];