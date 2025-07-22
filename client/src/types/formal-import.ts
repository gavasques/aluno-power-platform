export interface Tax {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

export interface Expense {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

export interface Product {
  id?: string;
  nome: string;
  ncm: string;
  quantidade: number;
  valorUnitarioUsd: number;
  comprimento: number; // cm
  largura: number; // cm
  altura: number; // cm
  cbmUnitario?: number;
  cbmTotal?: number;
  percentualContainer?: number;
  valorTotalUSD?: number;
  valorTotalBRL?: number;
  freteRateio?: number;
  despesasRateio?: number;
  impostos?: {
    ii: number;
    ipi: number;
    pis: number;
    cofins: number;
    icms: number;
  };
  custoTotal?: number;
  custoUnitario?: number;
}

export interface FormalImportSimulation {
  id?: number;
  nome: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  impostos: Tax[];
  despesasAdicionais: Expense[];
  produtos: Product[];
  resultados: {
    valorFobReal?: number;
    valorFreteReal?: number;
    valorCfrDolar?: number;
    valorCfrReal?: number;
    valorSeguro?: number;
    totalImpostos?: number;
    totalDespesas?: number;
    custoTotal?: number;
    cbmTotal?: number;
  };
  codigoSimulacao?: string;
  dataCriacao?: string;
  dataModificacao?: string;
}

// Constantes padrão
export const DEFAULT_TAXES: Tax[] = [
  { nome: "Imposto de Importação (II)", aliquota: 14.4, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "IPI", aliquota: 3.25, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "PIS", aliquota: 2.1, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "COFINS", aliquota: 9.65, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "ICMS", aliquota: 12, baseCalculo: "fob_frete_seguro", valor: 0 }
];

export const DEFAULT_EXPENSES: Expense[] = [
  { nome: "AFRMM (Marinha Mercante)", valorDolar: 300, valorReal: 1650.00 },
  { nome: "CAPATAZIA", valorDolar: 236.36, valorReal: 1300.00 },
  { nome: "TX LIBER./BL/AWB", valorDolar: 106.36, valorReal: 585.00 },
  { nome: "THC Movimentação", valorDolar: 112.73, valorReal: 620.00 },
  { nome: "Desconsolidação", valorDolar: 63.64, valorReal: 350.00 },
  { nome: "ISPS", valorDolar: 36.36, valorReal: 200.00 },
  { nome: "Container/Lacre", valorDolar: 49.09, valorReal: 270.00 },
  { nome: "Damage Fee", valorDolar: 45.00, valorReal: 247.50 },
  { nome: "Taxa SISCOMEX", valorDolar: 29.53, valorReal: 162.42 },
  { nome: "Frete Nacional", valorDolar: 1818.36, valorReal: 10001.00 },
  { nome: "Honorários Despachante", valorDolar: 272.73, valorReal: 1500.00 },
  { nome: "DOC Fee", valorDolar: 35.45, valorReal: 195.00 },
  { nome: "DAS", valorDolar: 47.71, valorReal: 262.40 }
];

export const DEFAULT_TAX_NAMES = ["Imposto de Importação (II)", "IPI", "PIS", "COFINS", "ICMS"]; 