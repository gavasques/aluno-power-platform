import { FaixaAliquota } from './types';

export const ANEXO_I_FAIXAS: FaixaAliquota[] = [
  { apartir: 0, aliquotaNominal: 0.04, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartir: 180000, aliquotaNominal: 0.073, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartir: 360000, aliquotaNominal: 0.095, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartir: 720000, aliquotaNominal: 0.107, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartir: 1800000, aliquotaNominal: 0.143, valorDeduzir: 87300, percentualICMS: 0.335 }
];

export const ANEXO_II_FAIXAS: FaixaAliquota[] = [
  { apartir: 0, aliquotaNominal: 0.045, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartir: 180000, aliquotaNominal: 0.078, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartir: 360000, aliquotaNominal: 0.10, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartir: 720000, aliquotaNominal: 0.112, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartir: 1800000, aliquotaNominal: 0.147, valorDeduzir: 85500, percentualICMS: 0.335 }
];

export const VALIDATION_PATTERNS = {
  MES_ANO: /^\d{2}\/\d{4}$/
};

export const LIMITS = {
  MEDIA_MENSAL: 300000,
  LIMITE_ANUAL: 3600000
};

export const STORAGE_KEYS = {
  SIMPLES_NACIONAL_COMPLETO: 'simplesnacional-completo-dados'
};