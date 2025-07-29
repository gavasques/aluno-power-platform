// Tipos base para o módulo Finanças360

// Empresa
export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  telefone?: string;
  email?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

// Canal
export interface Canal {
  id: number;
  nome: string;
  descricao?: string;
  tipo: 'vendas' | 'compras' | 'servicos';
  cor?: string;
  icone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

// Banco
export interface Banco {
  id: number;
  codigo: string;
  nome: string;
  nomeCompleto?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Conta Bancária
export interface ContaBancaria {
  id: number;
  empresaId: number;
  bancoId: number;
  tipoConta: 'corrente' | 'poupanca' | 'investimento';
  agencia: string;
  conta: string;
  digito?: string;
  descricao?: string;
  saldoInicial: number;
  saldoAtual: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  empresa?: Empresa;
  banco?: Banco;
}

// Forma de Pagamento
export interface FormaPagamento {
  id: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia';
  taxaPercentual: number;
  taxaFixa: number;
  prazoRecebimento: number;
  contaBancariaId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  contaBancaria?: ContaBancaria;
}

// Parceiro
export interface Parceiro {
  id: number;
  tipo: 'cliente' | 'fornecedor' | 'ambos';
  razaoSocial?: string;
  nomeFantasia?: string;
  cpfCnpj?: string;
  inscricaoEstadual?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  telefone?: string;
  email?: string;
  observacoes?: string;
  limiteCredito: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

// Canal de Pagamento
export interface CanalPagamento {
  id: number;
  nome: string;
  tipo: 'gateway' | 'maquininha' | 'banco' | 'fintech';
  taxaPercentual: number;
  taxaFixa: number;
  prazoRecebimento: number;
  configuracoes?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

// Estrutura DRE
export interface EstruturaDRE {
  id: number;
  codigo: string;
  descricao: string;
  tipo: 'receita' | 'custo' | 'despesa';
  nivel: number;
  paiId?: number;
  ordem?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  pai?: EstruturaDRE;
  filhos?: EstruturaDRE[];
}

// Lançamento
export interface Lancamento {
  id: number;
  empresaId: number;
  tipo: 'receita' | 'despesa';
  dataLancamento: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  parceiroId?: number;
  contaBancariaId?: number;
  formaPagamentoId?: number;
  canalId?: number;
  estruturaDreId?: number;
  descricao: string;
  valor: number;
  valorPago?: number;
  juros: number;
  multa: number;
  desconto: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  observacoes?: string;
  anexos?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  empresa?: Empresa;
  parceiro?: Parceiro;
  contaBancaria?: ContaBancaria;
  formaPagamento?: FormaPagamento;
  canal?: Canal;
  estruturaDre?: EstruturaDRE;
}

// Nota Fiscal
export interface NotaFiscal {
  id: number;
  empresaId: number;
  numero: string;
  serie?: string;
  chaveAcesso?: string;
  tipo: 'entrada' | 'saida';
  dataEmissao: Date;
  dataEntrada?: Date;
  parceiroId?: number;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  valorTotal: number;
  observacoes?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  status: 'autorizada' | 'cancelada' | 'inutilizada';
  lancamentos?: number[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  empresa?: Empresa;
  parceiro?: Parceiro;
}

// Devolução
export interface Devolucao {
  id: number;
  empresaId: number;
  tipo: 'cliente' | 'fornecedor';
  data: Date;
  parceiroId?: number;
  notaFiscalId?: number;
  motivo: string;
  valor: number;
  status: 'pendente' | 'processada' | 'cancelada';
  lancamentoId?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  // Relacionamentos
  empresa?: Empresa;
  parceiro?: Parceiro;
  notaFiscal?: NotaFiscal;
  lancamento?: Lancamento;
}

// Tipos para formulários (inserção)
export type EmpresaInsert = Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>;
export type CanalInsert = Omit<Canal, 'id' | 'createdAt' | 'updatedAt'>;
export type BancoInsert = Omit<Banco, 'id' | 'createdAt' | 'updatedAt'>;
export type ContaBancariaInsert = Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt' | 'empresa' | 'banco'>;
export type FormaPagamentoInsert = Omit<FormaPagamento, 'id' | 'createdAt' | 'updatedAt' | 'contaBancaria'>;
export type ParceiroInsert = Omit<Parceiro, 'id' | 'createdAt' | 'updatedAt'>;
export type CanalPagamentoInsert = Omit<CanalPagamento, 'id' | 'createdAt' | 'updatedAt'>;
export type EstruturaDREInsert = Omit<EstruturaDRE, 'id' | 'createdAt' | 'updatedAt' | 'pai' | 'filhos'>;
export type LancamentoInsert = Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt' | 'empresa' | 'parceiro' | 'contaBancaria' | 'formaPagamento' | 'canal' | 'estruturaDre'>;
export type NotaFiscalInsert = Omit<NotaFiscal, 'id' | 'createdAt' | 'updatedAt' | 'empresa' | 'parceiro'>;
export type DevolucaoInsert = Omit<Devolucao, 'id' | 'createdAt' | 'updatedAt' | 'empresa' | 'parceiro' | 'notaFiscal' | 'lancamento'>;

// Tipos para filtros e pesquisa
export interface FiltroFinancas360 {
  dataInicio?: Date;
  dataFim?: Date;
  empresaId?: number;
  status?: string;
  tipo?: string;
  valor?: {
    min?: number;
    max?: number;
  };
}

// Tipos para relatórios
export interface RelatorioFluxoCaixa {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  empresaId?: number;
  entradas: {
    total: number;
    itens: Lancamento[];
  };
  saidas: {
    total: number;
    itens: Lancamento[];
  };
  saldo: number;
}

export interface RelatorioDRE {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  empresaId?: number;
  receitas: {
    total: number;
    itens: { estrutura: EstruturaDRE; valor: number }[];
  };
  custos: {
    total: number;
    itens: { estrutura: EstruturaDRE; valor: number }[];
  };
  despesas: {
    total: number;
    itens: { estrutura: EstruturaDRE; valor: number }[];
  };
  lucroLiquido: number;
}

// Constantes para o módulo
export const TIPOS_EMPRESA = ['vendas', 'compras', 'servicos'] as const;
export const TIPOS_CONTA = ['corrente', 'poupanca', 'investimento'] as const;
export const TIPOS_PAGAMENTO = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia'] as const;
export const STATUS_LANCAMENTO = ['pendente', 'pago', 'cancelado', 'vencido'] as const;
export const STATUS_NOTA_FISCAL = ['autorizada', 'cancelada', 'inutilizada'] as const;
export const TIPOS_PARCEIRO = ['cliente', 'fornecedor', 'ambos'] as const;
export const TIPOS_CANAL_PAGAMENTO = ['gateway', 'maquininha', 'banco', 'fintech'] as const;
export const TIPOS_DRE = ['receita', 'custo', 'despesa'] as const;