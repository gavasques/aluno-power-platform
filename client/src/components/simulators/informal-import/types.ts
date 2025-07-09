// Types and interfaces for Informal Import Simulation
export interface ConfiguracoesGerais {
  taxa_cambio_usd_brl: number;
  aliquota_ii_percentual: number;
  aliquota_icms_percentual: number;
  custo_frete_internacional_total_moeda_original: number;
  moeda_frete_internacional: "USD" | "BRL";
  outras_despesas_aduaneiras_total_brl: number;
  metodo_rateio_frete: "peso" | "valor_fob" | "quantidade";
  metodo_rateio_outras_despesas: "peso" | "valor_fob" | "quantidade";
}

export interface ProdutoSimulacao {
  id_produto_interno: string;
  descricao_produto: string;
  quantidade: number;
  valor_unitario_usd: number;
  peso_bruto_unitario_kg: number;
  // Calculated fields
  peso_bruto_total_produto_kg?: number;
  valor_total_produto_usd?: number;
  custo_produto_brl?: number;
  custo_frete_por_produto_brl?: number;
  produto_mais_frete_brl?: number;
  base_calculo_ii_brl?: number;
  valor_ii_brl?: number;
  outras_despesas_rateadas_brl?: number;
  base_calculo_icms_planilha_brl?: number;
  valor_icms_brl?: number;
  valor_total_produto_impostos_brl?: number;
  custo_unitario_sem_imposto_brl?: number;
  custo_unitario_com_imposto_brl?: number;
}

export interface SimulacaoCompleta {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
  configuracoesGerais: ConfiguracoesGerais;
  produtos: ProdutoSimulacao[];
}

export interface SimulationTotals {
  total_sim_quantidade_itens: number;
  total_sim_custo_produto_brl: number;
  total_sim_produto_mais_frete_brl: number;
  total_sim_valor_ii_brl: number;
  total_sim_valor_icms_brl: number;
  total_sim_outras_despesas_aduaneiras_brl: number;
  custo_total_importacao_brl: number;
  peso_total_kg: number;
  preco_por_kg_usd: number;
  multiplicador_importacao: number;
  valor_fob_total_usd: number;
}

export interface CalculatedResults {
  produtos: ProdutoSimulacao[];
  totals: SimulationTotals;
}

// Default values
export const DEFAULT_CONFIG: ConfiguracoesGerais = {
  taxa_cambio_usd_brl: 5.20,
  aliquota_ii_percentual: 0.60,
  aliquota_icms_percentual: 0.17,
  custo_frete_internacional_total_moeda_original: 0,
  moeda_frete_internacional: "USD",
  outras_despesas_aduaneiras_total_brl: 0,
  metodo_rateio_frete: "peso",
  metodo_rateio_outras_despesas: "quantidade",
};

export const DEFAULT_PRODUCT: Omit<ProdutoSimulacao, 'id_produto_interno'> = {
  descricao_produto: "",
  quantidade: 1,
  valor_unitario_usd: 0,
  peso_bruto_unitario_kg: 0,
};