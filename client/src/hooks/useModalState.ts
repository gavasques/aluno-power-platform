import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  editingItem: any | null;
  mode: 'create' | 'edit' | 'view';
}

export interface UseModalStateReturn {
  isOpen: boolean;
  editingItem: any | null;
  mode: 'create' | 'edit' | 'view';
  openCreate: () => void;
  openEdit: (item: any) => void;
  openView: (item: any) => void;
  close: () => void;
  reset: () => void;
}

/**
 * Hook para gerenciar estados de modais de forma centralizada
 * Elimina duplicação de código em componentes que usam modais para CRUD
 * 
 * @example
 * const modal = useModalState();
 * 
 * // Abrir modal para criar
 * <Button onClick={modal.openCreate}>Criar</Button>
 * 
 * // Abrir modal para editar
 * <Button onClick={() => modal.openEdit(item)}>Editar</Button>
 * 
 * // Modal controlado
 * <Dialog open={modal.isOpen} onOpenChange={modal.close}>
 *   <DialogContent>
 *     {modal.mode === 'create' && <CreateForm />}
 *     {modal.mode === 'edit' && <EditForm item={modal.editingItem} />}
 *   </DialogContent>
 * </Dialog>
 */
export const useModalState = (initialState?: Partial<ModalState>): UseModalStateReturn => {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    editingItem: null,
    mode: 'create',
    ...initialState
  });

  const openCreate = useCallback(() => {
    setState({
      isOpen: true,
      editingItem: null,
      mode: 'create'
    });
  }, []);

  const openEdit = useCallback((item: any) => {
    setState({
      isOpen: true,
      editingItem: item,
      mode: 'edit'
    });
  }, []);

  const openView = useCallback((item: any) => {
    setState({
      isOpen: true,
      editingItem: item,
      mode: 'view'
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      editingItem: null,
      mode: 'create'
    });
  }, []);

  return {
    isOpen: state.isOpen,
    editingItem: state.editingItem,
    mode: state.mode,
    openCreate,
    openEdit,
    openView,
    close,
    reset
  };
};

/**
 * Hook para múltiplos modais independentes
 * Útil quando um componente precisa gerenciar vários modais diferentes
 */
export const useMultipleModals = (modalKeys: string[]) => {
  const modals = modalKeys.reduce((acc, key) => {
    acc[key] = useModalState();
    return acc;
  }, {} as Record<string, UseModalStateReturn>);

  const closeAll = useCallback(() => {
    Object.values(modals).forEach(modal => modal.close());
  }, [modals]);

  const resetAll = useCallback(() => {
    Object.values(modals).forEach(modal => modal.reset());
  }, [modals]);

  const isAnyOpen = Object.values(modals).some(modal => modal.isOpen);

  return {
    modals,
    closeAll,
    resetAll,
    isAnyOpen
  };
};

/**
 * Hook especializado para modais de confirmação
 * Usado para ações destrutivas como exclusão
 */
export const useConfirmationModal = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    variant: 'default' as 'default' | 'destructive'
  });

  const open = useCallback((options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      variant: options.variant || 'default'
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirm = useCallback(() => {
    state.onConfirm();
    close();
  }, [state.onConfirm, close]);

  return {
    ...state,
    open,
    close,
    confirm
  };
};