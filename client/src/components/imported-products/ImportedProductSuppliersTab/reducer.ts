/**
 * Reducer para ImportedProductSuppliersTab
 * Centralizando lógica de estado complexa
 */

import type { ImportedProductSuppliersState, ImportedProductSuppliersAction } from './types';

export const initialImportedProductSuppliersState: ImportedProductSuppliersState = {
  ui: {
    loading: false,
    showAddDialog: false,
    showEditDialog: false,
    sortBy: 'cost',
    sortOrder: 'asc',
  },
  form: {
    supplierId: 0,
    cost: 0,
    moq: 0,
    leadTimeDays: 0,
    isMainSupplier: false,
  },
  selected: {
    editingSupplier: null,
  },
  data: {
    suppliers: [],
    productSuppliers: [],
  },
};

export const importedProductSuppliersReducer = (
  state: ImportedProductSuppliersState, 
  action: ImportedProductSuppliersAction
): ImportedProductSuppliersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case 'SET_SHOW_ADD_DIALOG':
      return {
        ...state,
        ui: { ...state.ui, showAddDialog: action.payload }
      };

    case 'SET_SHOW_EDIT_DIALOG':
      return {
        ...state,
        ui: { ...state.ui, showEditDialog: action.payload }
      };

    case 'SET_SORT':
      return {
        ...state,
        ui: { ...state.ui, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder }
      };

    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value }
      };

    case 'SET_EDITING_SUPPLIER':
      return {
        ...state,
        selected: { editingSupplier: action.payload }
      };

    case 'SET_SUPPLIERS_DATA':
      return {
        ...state,
        data: { ...state.data, suppliers: action.payload }
      };

    case 'SET_PRODUCT_SUPPLIERS_DATA':
      return {
        ...state,
        data: { ...state.data, productSuppliers: action.payload }
      };

    case 'LOAD_SUPPLIER_FOR_EDIT':
      return {
        ...state,
        ui: { ...state.ui, showEditDialog: true },
        form: {
          supplierId: action.payload.supplierId,
          cost: action.payload.cost,
          moq: action.payload.moq,
          leadTimeDays: action.payload.leadTimeDays,
          isMainSupplier: action.payload.isMainSupplier,
        },
        selected: { editingSupplier: action.payload }
      };

    case 'RESET_FORM':
      return {
        ...state,
        ui: { ...state.ui, showAddDialog: false, showEditDialog: false },
        form: initialImportedProductSuppliersState.form,
        selected: { editingSupplier: null }
      };

    default:
      return state;
  }
};