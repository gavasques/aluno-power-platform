// Tipos centralizados para Finanças 360
// Seguindo o princípio DRY e consistência de tipos

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface Empresa extends BaseEntity {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    cidade: string;
    estado: string;
    logradouro: string;
  };
  telefone?: string;
  email?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Canal extends BaseEntity {
  nome: string;
  tipo: 'vendas' | 'compras' | 'servicos';
  descricao?: string;
  cor: string;
  icone: string;
  isActive: boolean;
}

export interface Banco extends BaseEntity {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  website?: string;
  isActive: boolean;
}

export interface ContaBancaria extends BaseEntity {
  banco: {
    id: number;
    nome: string;
    codigo: string;
  };
  empresa: {
    id: number;
    nomeFantasia: string;
  };
  numero: string;
  agencia: string;
  digito?: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  saldoInicial: string;
  saldoAtual: string;
  isActive: boolean;
  observacoes?: string;
}

export interface FormaPagamento extends BaseEntity {
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto' | 'cheque';
  contaBancaria?: {
    id: number;
    banco: string;
    numero: string;
  };
  taxas?: string;
  prazoCompensacao?: number;
  isActive: boolean;
  observacoes?: string;
}

export interface Parceiro extends BaseEntity {
  nome: string;
  tipo: 'cliente' | 'fornecedor' | 'ambos';
  documento: string;
  tipoDocumento: 'cpf' | 'cnpj';
  email?: string;
  telefone?: string;
  endereco?: {
    cep?: string;
    cidade?: string;
    estado?: string;
    logradouro?: string;
  };
  observacoes?: string;
  isActive: boolean;
}

export interface CanalPagamento extends BaseEntity {
  nome: string;
  tipo: 'gateway' | 'maquininha' | 'banco' | 'outros';
  taxas?: string;
  prazoRepasse?: number;
  configuracoes?: Record<string, any>;
  isActive: boolean;
  observacoes?: string;
}

export interface EstruturaDRE extends BaseEntity {
  codigo: string;
  nome: string;
  tipo: 'receita' | 'custo' | 'despesa' | 'resultado';
  nivel: number;
  contaPai?: {
    id: number;
    nome: string;
  };
  formula?: string;
  ordem: number;
  ativa: boolean;
  observacoes?: string;
  subContas: EstruturaDRE[];
}

export interface Lancamento extends BaseEntity {
  empresa: {
    id: number;
    nomeFantasia: string;
  };
  parceiro?: {
    id: number;
    nome: string;
  };
  contaBancaria?: {
    id: number;
    banco: string;
    numero: string;
  };
  formaPagamento?: {
    id: number;
    nome: string;
  };
  canal?: {
    id: number;
    nome: string;
  };
  estruturaDre?: {
    id: number;
    nome: string;
    codigo: string;
  };
  tipo: 'receita' | 'despesa';
  valor: string;
  descricao: string;
  dataVencimento: string;
  dataPagamento?: string;
  numeroDocumento?: string;
  observacoes?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  recorrente: boolean;
  frequenciaRecorrencia?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  tags?: string[];
  anexos?: Record<string, any>[];
}

export interface NotaFiscal extends BaseEntity {
  empresa: {
    id: number;
    nomeFantasia: string;
  };
  parceiro: {
    id: number;
    nome: string;
  };
  numero: string;
  serie: string;
  tipoOperacao: 'entrada' | 'saida';
  naturezaOperacao: string;
  dataEmissao: string;
  dataVencimento?: string;
  valorTotal: string;
  valorImposto?: string;
  status: 'emitida' | 'enviada' | 'cancelada' | 'autorizada';
  chaveAcesso?: string;
  protocolo?: string;
  observacoes?: string;
  itens: Record<string, any>[];
  impostos?: Record<string, any>[];
}

export interface Devolucao extends BaseEntity {
  empresa: {
    id: number;
    nomeFantasia: string;
  };
  parceiro: {
    id: number;
    nome: string;
  };
  notaFiscal?: {
    id: number;
    numero: string;
  };
  lancamento?: {
    id: number;
    descricao: string;
  };
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: string;
  status: 'pendente' | 'processada' | 'cancelada';
  observacoes?: string;
  anexos?: Record<string, any>[];
}

// Tipos para formulários de inserção
export type EmpresaInsert = Omit<Empresa, keyof BaseEntity>;
export type CanalInsert = Omit<Canal, keyof BaseEntity>;
export type BancoInsert = Omit<Banco, keyof BaseEntity>;
export type ContaBancariaInsert = Omit<ContaBancaria, keyof BaseEntity | 'banco' | 'empresa'> & {
  bancoId: number;
  empresaId: number;
};
export type FormaPagamentoInsert = Omit<FormaPagamento, keyof BaseEntity | 'contaBancaria'> & {
  contaBancariaId?: number;
};
export type ParceiroInsert = Omit<Parceiro, keyof BaseEntity>;
export type CanalPagamentoInsert = Omit<CanalPagamento, keyof BaseEntity>;
export type EstruturaDREInsert = Omit<EstruturaDRE, keyof BaseEntity | 'contaPai' | 'subContas'> & {
  contaPaiId?: number;
};
export type LancamentoInsert = Omit<Lancamento, keyof BaseEntity | 'empresa' | 'parceiro' | 'contaBancaria' | 'formaPagamento' | 'canal' | 'estruturaDre'> & {
  empresaId: number;
  parceiroId?: number;
  contaBancariaId?: number;
  formaPagamentoId?: number;
  canalId?: number;
  estruturaDreId?: number;
};
export type NotaFiscalInsert = Omit<NotaFiscal, keyof BaseEntity | 'empresa' | 'parceiro'> & {
  empresaId: number;
  parceiroId: number;
};
export type DevolucaoInsert = Omit<Devolucao, keyof BaseEntity | 'empresa' | 'parceiro' | 'notaFiscal' | 'lancamento'> & {
  empresaId: number;
  parceiroId: number;
  notaFiscalId?: number;
  lancamentoId?: number;
};

// Interfaces para filtros
export interface FiltroGeral {
  search?: string;
  status?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// Estados de loading e erro
export interface QueryState {
  isLoading: boolean;
  error: Error | null;
}

// Constantes úteis
export const TIPOS_DOCUMENTO = ['cpf', 'cnpj'] as const;
export const TIPOS_PARCEIRO = ['cliente', 'fornecedor', 'ambos'] as const;
export const TIPOS_CANAL = ['vendas', 'compras', 'servicos'] as const;
export const TIPOS_CONTA = ['corrente', 'poupanca', 'investimento'] as const;
export const TIPOS_PAGAMENTO = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'cheque'] as const;
export const STATUS_LANCAMENTO = ['pendente', 'pago', 'cancelado', 'vencido'] as const;
export const STATUS_NOTA_FISCAL = ['emitida', 'enviada', 'cancelada', 'autorizada'] as const;
export const STATUS_DEVOLUCAO = ['pendente', 'processada', 'cancelada'] as const;

export const CORES_PREDEFINIDAS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export const ICONES_DISPONIVEIS = [
  { value: 'ShoppingCart', label: '🛒 Carrinho' },
  { value: 'Store', label: '🏪 Loja' },
  { value: 'Package', label: '📦 Pacote' },
  { value: 'Settings', label: '⚙️ Configurações' },
  { value: 'Users', label: '👥 Usuários' },
  { value: 'CreditCard', label: '💳 Cartão' },
  { value: 'Coins', label: '💰 Moedas' },
  { value: 'Receipt', label: '🧾 Recibo' }
];