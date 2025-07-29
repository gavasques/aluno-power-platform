import { pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

// Enums para o módulo Finanças360
export const tipoEmpresaEnum = pgEnum('fin360_tipo_empresa', ['vendas', 'compras', 'servicos']);
export const tipoContaEnum = pgEnum('fin360_tipo_conta', ['corrente', 'poupanca', 'investimento']);
export const tipoPagamentoEnum = pgEnum('fin360_tipo_pagamento', ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia']);
export const statusLancamentoEnum = pgEnum('fin360_status_lancamento', ['pendente', 'pago', 'cancelado', 'vencido']);
export const statusNotaFiscalEnum = pgEnum('fin360_status_nota_fiscal', ['autorizada', 'cancelada', 'inutilizada']);
export const tipoParceiroEnum = pgEnum('fin360_tipo_parceiro', ['cliente', 'fornecedor', 'ambos']);
export const tipoCanalPagamentoEnum = pgEnum('fin360_tipo_canal_pagamento', ['gateway', 'maquininha', 'banco', 'fintech']);
export const tipoDreEnum = pgEnum('fin360_tipo_dre', ['receita', 'custo', 'despesa']);
export const tipoLancamentoEnum = pgEnum('fin360_tipo_lancamento', ['receita', 'despesa']);
export const tipoNotaFiscalEnum = pgEnum('fin360_tipo_nota_fiscal', ['entrada', 'saida']);
export const tipoDevolucaoEnum = pgEnum('fin360_tipo_devolucao', ['cliente', 'fornecedor']);
export const statusDevolucaoEnum = pgEnum('fin360_status_devolucao', ['pendente', 'processada', 'cancelada']);

// Tabela de Empresas
export const fin360Empresas = pgTable('fin360_empresas', {
  id: serial('id').primaryKey(),
  razaoSocial: varchar('razao_social', { length: 255 }).notNull(),
  nomeFantasia: varchar('nome_fantasia', { length: 255 }),
  cnpj: varchar('cnpj', { length: 18 }).notNull().unique(),
  inscricaoEstadual: varchar('inscricao_estadual', { length: 50 }),
  inscricaoMunicipal: varchar('inscricao_municipal', { length: 50 }),
  endereco: jsonb('endereco'), // { cep, logradouro, numero, complemento, bairro, cidade, uf }
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Canais
export const fin360Canais = pgTable('fin360_canais', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  tipo: tipoEmpresaEnum('tipo').notNull(),
  cor: varchar('cor', { length: 7 }), // Hex color
  icone: varchar('icone', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Bancos
export const fin360Bancos = pgTable('fin360_bancos', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 3 }).notNull().unique(),
  nome: varchar('nome', { length: 100 }).notNull(),
  nomeCompleto: varchar('nome_completo', { length: 255 }),
  website: varchar('website', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Contas Bancárias
export const fin360ContasBancarias = pgTable('fin360_contas_bancarias', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => fin360Empresas.id).notNull(),
  bancoId: integer('banco_id').references(() => fin360Bancos.id).notNull(),
  tipoConta: tipoContaEnum('tipo_conta').notNull(),
  agencia: varchar('agencia', { length: 10 }).notNull(),
  conta: varchar('conta', { length: 20 }).notNull(),
  digito: varchar('digito', { length: 2 }),
  descricao: varchar('descricao', { length: 255 }),
  saldoInicial: decimal('saldo_inicial', { precision: 15, scale: 2 }).default('0.00').notNull(),
  saldoAtual: decimal('saldo_atual', { precision: 15, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Formas de Pagamento
export const fin360FormasPagamento = pgTable('fin360_formas_pagamento', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: tipoPagamentoEnum('tipo').notNull(),
  taxaPercentual: decimal('taxa_percentual', { precision: 5, scale: 2 }).default('0.00').notNull(),
  taxaFixa: decimal('taxa_fixa', { precision: 10, scale: 2 }).default('0.00').notNull(),
  prazoRecebimento: integer('prazo_recebimento').default(0).notNull(), // dias
  contaBancariaId: integer('conta_bancaria_id').references(() => fin360ContasBancarias.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Parceiros
export const fin360Parceiros = pgTable('fin360_parceiros', {
  id: serial('id').primaryKey(),
  tipo: tipoParceiroEnum('tipo').notNull(),
  razaoSocial: varchar('razao_social', { length: 255 }),
  nomeFantasia: varchar('nome_fantasia', { length: 255 }),
  cpfCnpj: varchar('cpf_cnpj', { length: 18 }),
  inscricaoEstadual: varchar('inscricao_estadual', { length: 50 }),
  endereco: jsonb('endereco'), // { cep, logradouro, numero, complemento, bairro, cidade, uf }
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  observacoes: text('observacoes'),
  limiteCredito: decimal('limite_credito', { precision: 15, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Canais de Pagamento
export const fin360CanaisPagamento = pgTable('fin360_canais_pagamento', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: tipoCanalPagamentoEnum('tipo').notNull(),
  taxaPercentual: decimal('taxa_percentual', { precision: 5, scale: 2 }).default('0.00').notNull(),
  taxaFixa: decimal('taxa_fixa', { precision: 10, scale: 2 }).default('0.00').notNull(),
  prazoRecebimento: integer('prazo_recebimento').default(0).notNull(), // dias
  configuracoes: jsonb('configuracoes'), // Configurações específicas do canal
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Estrutura DRE
export const fin360EstruturaDRE = pgTable('fin360_estrutura_dre', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  descricao: varchar('descricao', { length: 255 }).notNull(),
  tipo: tipoDreEnum('tipo').notNull(),
  nivel: integer('nivel').notNull(),
  paiId: integer('pai_id').references(() => fin360EstruturaDRE.id),
  ordem: integer('ordem').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Lançamentos
export const fin360Lancamentos = pgTable('fin360_lancamentos', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => fin360Empresas.id).notNull(),
  tipo: tipoLancamentoEnum('tipo').notNull(),
  dataLancamento: timestamp('data_lancamento').notNull(),
  dataVencimento: timestamp('data_vencimento').notNull(),
  dataPagamento: timestamp('data_pagamento'),
  parceiroId: integer('parceiro_id').references(() => fin360Parceiros.id),
  contaBancariaId: integer('conta_bancaria_id').references(() => fin360ContasBancarias.id),
  formaPagamentoId: integer('forma_pagamento_id').references(() => fin360FormasPagamento.id),
  canalId: integer('canal_id').references(() => fin360Canais.id),
  estruturaDreId: integer('estrutura_dre_id').references(() => fin360EstruturaDRE.id),
  descricao: text('descricao').notNull(),
  valor: decimal('valor', { precision: 15, scale: 2 }).notNull(),
  valorPago: decimal('valor_pago', { precision: 15, scale: 2 }),
  juros: decimal('juros', { precision: 15, scale: 2 }).default('0.00').notNull(),
  multa: decimal('multa', { precision: 15, scale: 2 }).default('0.00').notNull(),
  desconto: decimal('desconto', { precision: 15, scale: 2 }).default('0.00').notNull(),
  status: statusLancamentoEnum('status').default('pendente').notNull(),
  observacoes: text('observacoes'),
  anexos: jsonb('anexos'), // Array de URLs dos anexos
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Notas Fiscais
export const fin360NotasFiscais = pgTable('fin360_notas_fiscais', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => fin360Empresas.id).notNull(),
  numero: varchar('numero', { length: 20 }).notNull(),
  serie: varchar('serie', { length: 10 }),
  chaveAcesso: varchar('chave_acesso', { length: 44 }),
  tipo: tipoNotaFiscalEnum('tipo').notNull(),
  dataEmissao: timestamp('data_emissao').notNull(),
  dataEntrada: timestamp('data_entrada'),
  parceiroId: integer('parceiro_id').references(() => fin360Parceiros.id),
  valorProdutos: decimal('valor_produtos', { precision: 15, scale: 2 }).notNull(),
  valorDesconto: decimal('valor_desconto', { precision: 15, scale: 2 }).default('0.00').notNull(),
  valorFrete: decimal('valor_frete', { precision: 15, scale: 2 }).default('0.00').notNull(),
  valorSeguro: decimal('valor_seguro', { precision: 15, scale: 2 }).default('0.00').notNull(),
  outrasDespesas: decimal('outras_despesas', { precision: 15, scale: 2 }).default('0.00').notNull(),
  valorTotal: decimal('valor_total', { precision: 15, scale: 2 }).notNull(),
  observacoes: text('observacoes'),
  xmlUrl: text('xml_url'),
  pdfUrl: text('pdf_url'),
  status: statusNotaFiscalEnum('status').default('autorizada').notNull(),
  lancamentos: jsonb('lancamentos'), // Array de IDs dos lançamentos vinculados
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Tabela de Devoluções
export const fin360Devolucoes = pgTable('fin360_devolucoes', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => fin360Empresas.id).notNull(),
  tipo: tipoDevolucaoEnum('tipo').notNull(),
  data: timestamp('data').notNull(),
  parceiroId: integer('parceiro_id').references(() => fin360Parceiros.id),
  notaFiscalId: integer('nota_fiscal_id').references(() => fin360NotasFiscais.id),
  motivo: text('motivo').notNull(),
  valor: decimal('valor', { precision: 15, scale: 2 }).notNull(),
  status: statusDevolucaoEnum('status').default('pendente').notNull(),
  lancamentoId: integer('lancamento_id').references(() => fin360Lancamentos.id),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
});

// Schemas de inserção com Zod
export const insertEmpresaSchema = createInsertSchema(fin360Empresas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCanalSchema = createInsertSchema(fin360Canais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBancoSchema = createInsertSchema(fin360Bancos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContaBancariaSchema = createInsertSchema(fin360ContasBancarias).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormaPagamentoSchema = createInsertSchema(fin360FormasPagamento).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParceiroSchema = createInsertSchema(fin360Parceiros).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCanalPagamentoSchema = createInsertSchema(fin360CanaisPagamento).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEstruturaDRESchema = createInsertSchema(fin360EstruturaDRE).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLancamentoSchema = createInsertSchema(fin360Lancamentos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotaFiscalSchema = createInsertSchema(fin360NotasFiscais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDevolucaoSchema = createInsertSchema(fin360Devolucoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos inferidos para TypeScript
export type Empresa = typeof fin360Empresas.$inferSelect;
export type EmpresaInsert = z.infer<typeof insertEmpresaSchema>;

export type Canal = typeof fin360Canais.$inferSelect;
export type CanalInsert = z.infer<typeof insertCanalSchema>;

export type Banco = typeof fin360Bancos.$inferSelect;
export type BancoInsert = z.infer<typeof insertBancoSchema>;

export type ContaBancaria = typeof fin360ContasBancarias.$inferSelect;
export type ContaBancariaInsert = z.infer<typeof insertContaBancariaSchema>;

export type FormaPagamento = typeof fin360FormasPagamento.$inferSelect;
export type FormaPagamentoInsert = z.infer<typeof insertFormaPagamentoSchema>;

export type Parceiro = typeof fin360Parceiros.$inferSelect;
export type ParceiroInsert = z.infer<typeof insertParceiroSchema>;

export type CanalPagamento = typeof fin360CanaisPagamento.$inferSelect;
export type CanalPagamentoInsert = z.infer<typeof insertCanalPagamentoSchema>;

export type EstruturaDRE = typeof fin360EstruturaDRE.$inferSelect;
export type EstruturaDREInsert = z.infer<typeof insertEstruturaDRESchema>;

export type Lancamento = typeof fin360Lancamentos.$inferSelect;
export type LancamentoInsert = z.infer<typeof insertLancamentoSchema>;

export type NotaFiscal = typeof fin360NotasFiscais.$inferSelect;
export type NotaFiscalInsert = z.infer<typeof insertNotaFiscalSchema>;

export type Devolucao = typeof fin360Devolucoes.$inferSelect;
export type DevolucaoInsert = z.infer<typeof insertDevolucaoSchema>;

// Schemas de validação personalizados
export const cnpjSchema = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve ter formato XX.XXX.XXX/XXXX-XX');
export const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve ter formato XXX.XXX.XXX-XX');
export const cepSchema = z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve ter formato XXXXX-XXX');
export const phoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve ter formato (XX) XXXXX-XXXX');

// Schema de endereço
export const enderecoSchema = z.object({
  cep: cepSchema.optional(),
  logradouro: z.string().max(255).optional(),
  numero: z.string().max(10).optional(),
  complemento: z.string().max(100).optional(),
  bairro: z.string().max(100).optional(),
  cidade: z.string().max(100).optional(),
  uf: z.string().length(2).optional(),
});

// Validações de negócio
export const validateEmpresaData = (data: EmpresaInsert) => {
  return insertEmpresaSchema.extend({
    cnpj: cnpjSchema,
    endereco: enderecoSchema.optional(),
    telefone: phoneSchema.optional(),
    email: z.string().email().optional(),
  }).parse(data);
};

export const validateParceiroData = (data: ParceiroInsert) => {
  return insertParceiroSchema.extend({
    cpfCnpj: z.union([cpfSchema, cnpjSchema]).optional(),
    endereco: enderecoSchema.optional(),
    telefone: phoneSchema.optional(),
    email: z.string().email().optional(),
  }).parse(data);
};

export const validateContaBancariaData = (data: ContaBancariaInsert) => {
  return insertContaBancariaSchema.extend({
    saldoInicial: z.number().min(0, 'Saldo inicial não pode ser negativo'),
    saldoAtual: z.number().min(0, 'Saldo atual não pode ser negativo'),
  }).parse(data);
};

export const validateLancamentoData = (data: LancamentoInsert) => {
  return insertLancamentoSchema.extend({
    valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
    valorPago: z.number().min(0).optional(),
    juros: z.number().min(0).optional(),
    multa: z.number().min(0).optional(),
    desconto: z.number().min(0).optional(),
  }).parse(data);
};