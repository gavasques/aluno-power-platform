export interface MesSimulacao {
  id: string;
  mesAno: string;
  faturamentoSemST: number;
  faturamentoComST: number;
  anexo: 'Anexo I' | 'Anexo II';
  faturamentoTotal: number;
  faturamentoAcumulado12Meses: number;
  rbt12: number;
  media12Meses: number;
  disponivelMedia: number;
  disponivelAnual: number;
  aliquotaEfetiva: number;
  percentualICMS: number;
  valorSemST: number;
  valorComST: number;
  valorTotal: number;
}

export interface NovoMesForm {
  mesAno: string;
  faturamentoSemST: number;
  faturamentoComST: number;
  anexo: 'Anexo I' | 'Anexo II';
}

export interface FaixaAliquota {
  apartir: number;
  aliquotaNominal: number;
  valorDeduzir: number;
  percentualICMS: number;
}

export interface ResumoSimulacao {
  totalMeses: number;
  ultimoRBT12: number;
  ultimaMedia: number;
  totalImpostos: number;
  totalFaturamento: number;
  aliquotaMedia: number;
  disponivelAnual: number;
  disponivelMedia: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}