/**
 * Sistema de Toast Centralizado
 * 
 * Este módulo centraliza todas as notificações toast
 * eliminando duplicação de código de toast em todo o projeto.
 * 
 * Uso:
 * import { toast, useToast, ToastPatterns } from '@/components/ui/toast';
 */

// Serviço principal
export { 
  ToastService, 
  toast, 
  ToastPatterns,
  type ToastType,
  type ToastOptions,
  type LoadingToastOptions
} from '../../../lib/services/ToastService';

// Hooks especializados
export {
  useToast,
  useAsyncToast,
  useFormToast,
  useUploadToast
} from '../../../hooks/useToast';

// Provider
export { ToastProvider } from './ToastProvider';

// Utilities para casos comuns
export const ToastUtils = {
  /**
   * Cria toast baseado no status HTTP
   */
  fromHttpStatus: (status: number, message?: string) => {
    const { toast } = require('@/lib/services/ToastService');
    
    if (status >= 200 && status < 300) {
      return toast.success(message || 'Operação realizada com sucesso!');
    } else if (status >= 400 && status < 500) {
      return toast.error(message || 'Erro na requisição');
    } else if (status >= 500) {
      return toast.error(message || 'Erro interno do servidor');
    } else {
      return toast.info(message || 'Resposta recebida');
    }
  },

  /**
   * Cria toast baseado em tipo de erro
   */
  fromError: (error: any) => {
    const { toast } = require('@/lib/services/ToastService');
    
    if (error?.response?.status) {
      return ToastUtils.fromHttpStatus(error.response.status, error?.response?.data?.message);
    }
    
    if (error?.code === 'NETWORK_ERROR') {
      return toast.error('Erro de conexão', {
        description: 'Verifique sua conexão com a internet'
      });
    }
    
    if (error?.code === 'TIMEOUT') {
      return toast.error('Tempo limite excedido', {
        description: 'A operação demorou mais que o esperado'
      });
    }
    
    return toast.error('Erro inesperado', {
      description: error?.message || 'Tente novamente mais tarde'
    });
  },

  /**
   * Toast para confirmação de ações perigosas
   */
  confirmDangerous: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const { toast } = require('@/lib/services/ToastService');
    
    return toast.warning(message, {
      duration: 10000,
      action: {
        label: 'Confirmar',
        onClick: onConfirm
      },
      cancel: {
        label: 'Cancelar',
        onClick: onCancel
      }
    });
  },

  /**
   * Toast com countdown
   */
  countdown: (
    message: string,
    seconds: number,
    onComplete?: () => void
  ) => {
    const { toast } = require('@/lib/services/ToastService');
    let remaining = seconds;
    
    const toastId = toast.info(`${message} (${remaining}s)`, {
      duration: Infinity
    });
    
    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        toast.dismiss(toastId);
        toast.info(`${message} (${remaining}s)`, {
          duration: Infinity
        });
      } else {
        clearInterval(interval);
        toast.dismiss(toastId);
        onComplete?.();
      }
    }, 1000);
    
    return toastId;
  }
} as const;

// Quick access patterns para casos mais comuns
export const QuickToast = {
  // Operações básicas
  saved: () => ToastPatterns.form.saved(),
  deleted: (entity: string) => ToastPatterns.crud.deleted(entity),
  created: (entity: string) => ToastPatterns.crud.created(entity),
  updated: (entity: string) => ToastPatterns.crud.updated(entity),
  
  // Autenticação
  loginSuccess: () => ToastPatterns.auth.loginSuccess(),
  loginError: (error?: string) => ToastPatterns.auth.loginError(error),
  sessionExpired: () => ToastPatterns.auth.sessionExpired(),
  
  // Upload
  fileUploaded: (fileName: string) => ToastPatterns.upload.uploaded(fileName),
  uploadError: (fileName: string, error?: string) => ToastPatterns.upload.error(fileName, error),
  
  // Clipboard
  copied: (what?: string) => ToastPatterns.clipboard.copied(what),
  
  // Network
  offline: () => ToastPatterns.network.offline(),
  online: () => ToastPatterns.network.online(),
  serverError: () => ToastPatterns.network.serverError()
} as const;