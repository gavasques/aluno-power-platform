/**
 * Modais Reutilizáveis
 * 
 * Este módulo centraliza todos os componentes de modal reutilizáveis
 * eliminando duplicação de código de modais em todo o projeto.
 * 
 * Uso:
 * import { BaseModal, CrudModal, FormModal } from '@/components/ui/modals';
 */

// Base Modal Components
export {
  BaseModal,
  CrudModal,
  ConfirmationModal,
  QuickViewModal
} from './BaseModal';

export type {
  BaseModalProps,
  CrudModalProps,
  ConfirmationModalProps,
  QuickViewModalProps
} from './BaseModal';

// Form Modal Components
export {
  FormModal,
  useFormModal
} from './FormModal';

export type {
  FormModalProps
} from './FormModal';

// Hooks
export {
  useModalState,
  useMultipleModals,
  useConfirmationModal
} from '@/hooks/useModalState';

export type {
  ModalState,
  UseModalStateReturn
} from '@/hooks/useModalState';

// Re-export individual components for convenience
import { BaseModal, CrudModal, ConfirmationModal, QuickViewModal } from './BaseModal';
import { FormModal } from './FormModal';

// Convenience exports for common patterns
export const ModalComponents = {
  BaseModal,
  CrudModal,
  FormModal,
  ConfirmationModal,
  QuickViewModal
} as const;

/**
 * Utility function for common modal patterns
 * Helps to quickly render modal based on state
 */
export const renderModal = (
  state: { isOpen: boolean; mode: string; editingItem: any },
  handlers: { onClose: () => void },
  options: {
    entityName: string;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  }
) => {
  if (!state.isOpen) return null;

  return {
    isOpen: state.isOpen,
    onClose: handlers.onClose,
    mode: state.mode as 'create' | 'edit' | 'view',
    entityName: options.entityName,
    title: options.title,
    size: options.size || 'lg'
  };
};