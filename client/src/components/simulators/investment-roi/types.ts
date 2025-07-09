// Type definitions for Investment and ROI Simulator

export interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  duracaoGiro: number;
  unidadeTempo: 'Dias' | 'Semanas' | 'Meses';
  numeroGiros: number;
}

export interface GiroCalculado {
  numero: number;
  investimento: number;
  retorno: number;
  aporte: number;
  retirada: number;
  saldo: number;
  roiGiro: number;
  tempoDecorrido: number;
}

export interface GiroEditavel {
  aporte: number;
  retirada: number;
  roiGiro: number;
}

export interface InvestmentSimulation {
  id?: number;
  name: string;
  initialInvestment: number;
  cycleDuration: number;
  cycleUnit: 'Dias' | 'Semanas' | 'Meses';
  numberOfCycles: number;
  cycles: { [key: number]: GiroEditavel };
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationTotals {
  totalAportes: number;
  totalRetiradas: number;
  totalRetornos: number;
  saldoFinal: number;
  totalInvestido: number;
  ganhoLiquido: number;
  roiTotal: number;
}

export interface CalculatedResults {
  giros: GiroCalculado[];
  totals: SimulationTotals;
}

// Default configurations
export const DEFAULT_CONFIG: ConfiguracaoSimulacao = {
  investimentoInicial: 10000,
  duracaoGiro: 45,
  unidadeTempo: 'Dias',
  numeroGiros: 12,
};

export const DEFAULT_BULK_VALUES = {
  roi: 20,
  aporte: 0,
  retirada: 0,
};