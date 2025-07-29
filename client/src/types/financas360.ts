/**
 * Tipos base genéricos para o sistema Finanças360
 * Elimina duplicação de interfaces nos managers
 */

export interface BaseFinancasEntity {
  id: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

export interface BaseFormData {
  [key: string]: any;
}

// Tipos específicos que já existem nos managers
export interface Empresa extends BaseFinancasEntity {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    logradouro: string;
    cidade: string;
    estado: string;
  };
  telefone?: string;
  email?: string;
  logoUrl?: string;
}

export interface EmpresaFormData extends BaseFormData {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    logradouro: string;
    cidade: string;
    estado: string;
  };
  telefone?: string;
  email?: string;
}

export interface Canal extends BaseFinancasEntity {
  nome: string;
  tipo: 'vendas' | 'compras' | 'servicos';
  descricao?: string;
  cor: string;
  icone: string;
}

export interface CanalFormData extends BaseFormData {
  nome: string;
  tipo: 'vendas' | 'compras' | 'servicos';
  descricao?: string;
  cor: string;
  icone: string;
}

export interface Banco extends BaseFinancasEntity {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  ativo: boolean;
}

export interface BancoFormData extends BaseFormData {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  ativo: boolean;
}

export interface Lancamento extends BaseFinancasEntity {
  empresa: {
    id: number;
    razaoSocial: string;
  };
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  observacoes?: string;
  anexos?: string[];
}

export interface LancamentoFormData extends BaseFormData {
  empresaId: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  observacoes?: string;
}

// Tipos de utilitários
export interface ResourceConfig {
  endpoint: string;
  queryKey: string;
  createMessage: string;
  updateMessage: string;
  deleteMessage: string;
  deleteConfirmMessage: string;
}

export interface FilterOptions {
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
  [key: string]: any;
}

export interface ToastMessage {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}