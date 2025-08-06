/**
 * Reducer para AdvancedInfographicGenerator
 * Centralizando lógica de estado complexa
 */

import type { InfographicState, InfographicAction } from './types';

export const initialInfographicState: InfographicState = {
  ui: {
    loading: false,
    showProcessingModal: false,
  },
  session: { 
    step: 'input' 
  },
  form: {
    productName: '',
    description: '',
    category: '',
    targetAudience: '',
  },
  upload: {
    file: null,
    preview: null,
  },
};

export const infographicReducer = (
  state: InfographicState, 
  action: InfographicAction
): InfographicState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case 'SET_SHOW_PROCESSING_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showProcessingModal: action.payload }
      };

    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value }
      };

    case 'SET_UPLOAD':
      return {
        ...state,
        upload: action.payload
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        session: { ...state.session, ...action.payload }
      };

    case 'ADVANCE_STEP':
      return {
        ...state,
        session: { ...state.session, step: action.payload }
      };

    case 'RESET_FORM':
      return {
        ...state,
        form: initialInfographicState.form,
        upload: initialInfographicState.upload,
        session: { step: 'input' }
      };

    default:
      return state;
  }
};