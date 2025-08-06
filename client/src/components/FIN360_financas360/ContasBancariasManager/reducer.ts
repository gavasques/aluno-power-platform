/**
 * Reducer para ContasBancariasManager
 * Centralizando lógica de estado complexa
 */

import type { ContasBancariasState, ContasBancariasAction } from './types';

export const initialContasBancariasState: ContasBancariasState = {
  ui: {
    isDialogOpen: false,
    isEditMode: false,
    searchTerm: '',
  },
  form: {
    empresaId: 0,
    bancoId: 0,
    agencia: '',
    conta: '',
    chavePix: '',
    tipoChavePix: undefined,
    observacoes: '',
  },
  selected: {
    contaId: null,
  },
};

export const contasBancariasReducer = (
  state: ContasBancariasState, 
  action: ContasBancariasAction
): ContasBancariasState => {
  switch (action.type) {
    case 'SET_DIALOG_OPEN':
      return {
        ...state,
        ui: { ...state.ui, isDialogOpen: action.payload }
      };

    case 'SET_EDIT_MODE':
      return {
        ...state,
        ui: { ...state.ui, isEditMode: action.payload }
      };

    case 'SET_SEARCH_TERM':
      return {
        ...state,
        ui: { ...state.ui, searchTerm: action.payload }
      };

    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value }
      };

    case 'SET_SELECTED_CONTA':
      return {
        ...state,
        selected: { contaId: action.payload }
      };

    case 'LOAD_CONTA_FOR_EDIT':
      return {
        ...state,
        ui: { ...state.ui, isEditMode: true, isDialogOpen: true },
        form: {
          empresaId: action.payload.empresaId,
          bancoId: action.payload.bancoId,
          agencia: action.payload.agencia,
          conta: action.payload.conta,
          chavePix: action.payload.chavePix || '',
          tipoChavePix: action.payload.tipoChavePix,
          observacoes: action.payload.observacoes || '',
        },
        selected: { contaId: action.payload.id }
      };

    case 'RESET_FORM':
      return {
        ...state,
        ui: { ...state.ui, isDialogOpen: false, isEditMode: false },
        form: initialContasBancariasState.form,
        selected: { contaId: null }
      };

    default:
      return state;
  }
};