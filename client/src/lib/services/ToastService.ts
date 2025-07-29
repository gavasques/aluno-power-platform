import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

export interface LoadingToastOptions extends Omit<ToastOptions, 'duration'> {
  promise?: Promise<any>;
  loading?: string;
  success?: string | ((data: any) => string);
  error?: string | ((error: any) => string);
}

/**
 * Serviço centralizado de notificações toast
 * Elimina duplicação de código de toast em 50+ arquivos
 * 
 * @example
 * // Notificações simples
 * ToastService.success('Produto criado com sucesso!');
 * ToastService.error('Erro ao criar produto');
 * ToastService.warning('Atenção: dados não salvos');
 * ToastService.info('Nova versão disponível');
 * 
 * // Com opções avançadas
 * ToastService.success('Salvo!', {
 *   description: 'Todas as alterações foram salvas',
 *   duration: 5000,
 *   action: {
 *     label: 'Desfazer',
 *     onClick: () => undo()
 *   }
 * });
 * 
 * // Toast de loading com Promise
 * ToastService.promise(
 *   api.createProduct(data),
 *   {
 *     loading: 'Criando produto...',
 *     success: 'Produto criado com sucesso!',
 *     error: 'Erro ao criar produto'
 *   }
 * );
 */
export class ToastService {
  /**
   * Exibe toast de sucesso
   */
  static success(message: string, options?: ToastOptions) {
    return sonnerToast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }

  /**
   * Exibe toast de erro
   */
  static error(message: string, options?: ToastOptions) {
    return sonnerToast.error(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 6000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }

  /**
   * Exibe toast de aviso
   */
  static warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }

  /**
   * Exibe toast informativo
   */
  static info(message: string, options?: ToastOptions) {
    return sonnerToast.info(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }

  /**
   * Exibe toast de loading
   */
  static loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(options?.title || message, {
      description: options?.description,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }

  /**
   * Toast com Promise (loading -> success/error)
   */
  static promise<T>(
    promise: Promise<T>,
    options: LoadingToastOptions
  ) {
    return sonnerToast.promise(promise, {
      loading: options.loading || 'Carregando...',
      success: (data) => {
        if (typeof options.success === 'function') {
          return options.success(data);
        }
        return options.success || 'Operação concluída com sucesso!';
      },
      error: (error) => {
        if (typeof options.error === 'function') {
          return options.error(error);
        }
        return options.error || 'Erro na operação';
      },
      description: options.description,
      action: options.action,
      cancel: options.cancel
    });
  }

  /**
   * Dismisses all toasts
   */
  static dismiss(toastId?: string | number) {
    return sonnerToast.dismiss(toastId);
  }

  /**
   * Atualiza um toast existente
   */
  static update(toastId: string | number, options: {
    type?: ToastType;
    message?: string;
    description?: string;
  }) {
    // Note: Sonner doesn't have direct update method, so we dismiss and create new
    sonnerToast.dismiss(toastId);
    
    switch (options.type) {
      case 'success':
        return this.success(options.message || '', { description: options.description });
      case 'error':
        return this.error(options.message || '', { description: options.description });
      case 'warning':
        return this.warning(options.message || '', { description: options.description });
      case 'info':
        return this.info(options.message || '', { description: options.description });
      case 'loading':
        return this.loading(options.message || '', { description: options.description });
      default:
        return this.info(options.message || '', { description: options.description });
    }
  }

  /**
   * Toast customizado com JSX
   */
  static custom(jsx: React.ReactNode, options?: ToastOptions) {
    return sonnerToast.custom(jsx, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
      cancel: options?.cancel
    });
  }
}

// Convenience exports para casos comuns
export const toast = ToastService;

// Patterns comuns para casos específicos
export const ToastPatterns = {
  /**
   * Toast para operações CRUD
   */
  crud: {
    creating: (entity: string) => 
      ToastService.loading(`Criando ${entity.toLowerCase()}...`),
    
    created: (entity: string) => 
      ToastService.success(`${entity} criado com sucesso!`),
    
    updating: (entity: string) => 
      ToastService.loading(`Atualizando ${entity.toLowerCase()}...`),
    
    updated: (entity: string) => 
      ToastService.success(`${entity} atualizado com sucesso!`),
    
    deleting: (entity: string) => 
      ToastService.loading(`Excluindo ${entity.toLowerCase()}...`),
    
    deleted: (entity: string) => 
      ToastService.success(`${entity} excluído com sucesso!`),
    
    error: (operation: string, entity: string, error?: string) => 
      ToastService.error(`Erro ao ${operation} ${entity.toLowerCase()}`, {
        description: error || 'Tente novamente mais tarde'
      })
  },

  /**
   * Toast para autenticação
   */
  auth: {
    loginSuccess: () => 
      ToastService.success('Login realizado com sucesso!'),
    
    loginError: (error?: string) => 
      ToastService.error('Erro no login', {
        description: error || 'Verifique suas credenciais'
      }),
    
    logoutSuccess: () => 
      ToastService.info('Logout realizado com sucesso'),
    
    sessionExpired: () => 
      ToastService.warning('Sessão expirada', {
        description: 'Faça login novamente para continuar'
      }),
    
    registrationSuccess: () => 
      ToastService.success('Conta criada com sucesso!', {
        description: 'Você já pode fazer login'
      })
  },

  /**
   * Toast para upload de arquivos
   */
  upload: {
    uploading: (fileName: string) => 
      ToastService.loading(`Enviando ${fileName}...`),
    
    uploaded: (fileName: string) => 
      ToastService.success(`${fileName} enviado com sucesso!`),
    
    error: (fileName: string, error?: string) => 
      ToastService.error(`Erro ao enviar ${fileName}`, {
        description: error || 'Verifique o arquivo e tente novamente'
      }),
    
    invalidFile: (reason: string) => 
      ToastService.warning('Arquivo inválido', {
        description: reason
      }),
    
    sizeLimitExceeded: (limit: string) => 
      ToastService.warning('Arquivo muito grande', {
        description: `O arquivo deve ter no máximo ${limit}`
      })
  },

  /**
   * Toast para validação de formulários
   */
  form: {
    validationError: (message?: string) => 
      ToastService.error('Erro de validação', {
        description: message || 'Verifique os campos obrigatórios'
      }),
    
    saved: () => 
      ToastService.success('Dados salvos com sucesso!'),
    
    discardChanges: () => 
      ToastService.info('Alterações descartadas'),
    
    unsavedChanges: () => 
      ToastService.warning('Você tem alterações não salvas', {
        description: 'Salve antes de sair da página'
      })
  },

  /**
   * Toast para operações de rede
   */
  network: {
    offline: () => 
      ToastService.warning('Sem conexão com a internet', {
        description: 'Algumas funcionalidades podem não funcionar'
      }),
    
    online: () => 
      ToastService.success('Conexão restaurada'),
    
    slowConnection: () => 
      ToastService.info('Conexão lenta detectada', {
        description: 'As operações podem demorar mais que o normal'
      }),
    
    serverError: () => 
      ToastService.error('Erro no servidor', {
        description: 'Tente novamente em alguns minutos'
      })
  },

  /**
   * Toast para copiar/colar
   */
  clipboard: {
    copied: (what: string = 'Texto') => 
      ToastService.success(`${what} copiado!`, {
        duration: 2000
      }),
    
    copyError: () => 
      ToastService.error('Erro ao copiar', {
        description: 'Tente selecionar e copiar manualmente'
      })
  }
} as const;

export default ToastService;