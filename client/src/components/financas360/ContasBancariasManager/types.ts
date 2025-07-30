/**
 * Types para ContasBancariasManager
 * Estado unificado para gerenciamento de contas bancárias
 */

export interface ContaBancaria {
  id: number;
  empresaId: number;
  bancoId: number;
  agencia: string;
  conta: string;
  chavePix?: string;
  tipoChavePix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  observacoes?: string;
  empresa: {
    id: number;
    razaoSocial: string;
  };
  banco: {
    id: number;
    nome: string;
    codigo: string;
  };
}

export interface ContaBancariaFormData {
  empresaId: number;
  bancoId: number;
  agencia: string;
  conta: string;
  chavePix?: string;
  tipoChavePix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  observacoes?: string;
}

export interface Empresa {
  id: number;
  razaoSocial: string;
}

export interface Banco {
  id: number;
  nome: string;
  codigo: string;
}

// Estado unificado para o componente
export interface ContasBancariasState {
  ui: {
    isDialogOpen: boolean;
    isEditMode: boolean;
    searchTerm: string;
  };
  form: ContaBancariaFormData;
  selected: {
    contaId: number | null;
  };
}

// Actions para o reducer
export type ContasBancariasAction =
  | { type: 'SET_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'UPDATE_FORM_FIELD'; field: keyof ContaBancariaFormData; value: any }
  | { type: 'SET_SELECTED_CONTA'; payload: number | null }
  | { type: 'LOAD_CONTA_FOR_EDIT'; payload: ContaBancaria }
  | { type: 'RESET_FORM' };