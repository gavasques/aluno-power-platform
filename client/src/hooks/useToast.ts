import { useCallback } from 'react';
import { ToastService, ToastPatterns, ToastOptions, LoadingToastOptions } from '@/lib/services/ToastService';

/**
 * Hook para usar toasts de forma reativa
 * Integra com o ToastService para padrões DRY
 * 
 * @example
 * const toast = useToast();
 * 
 * // Uso simples
 * toast.success('Salvo!');
 * toast.error('Erro!');
 * 
 * // Com Promise
 * toast.promise(
 *   api.save(data),
 *   'Salvando...',
 *   'Salvo com sucesso!',
 *   'Erro ao salvar'
 * );
 * 
 * // Padrões CRUD
 * toast.crud.created('Produto');
 * toast.crud.error('criar', 'produto', error.message);
 */
export const useToast = () => {
  const success = useCallback((message: string, options?: ToastOptions) => {
    return ToastService.success(message, options);
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    return ToastService.error(message, options);
  }, []);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return ToastService.warning(message, options);
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    return ToastService.info(message, options);
  }, []);

  const loading = useCallback((message: string, options?: ToastOptions) => {
    return ToastService.loading(message, options);
  }, []);

  const promise = useCallback(<T>(
    promiseOrFunction: Promise<T> | (() => Promise<T>),
    loadingMessage?: string,
    successMessage?: string | ((data: T) => string),
    errorMessage?: string | ((error: any) => string),
    options?: Omit<LoadingToastOptions, 'loading' | 'success' | 'error'>
  ) => {
    const promiseToUse = typeof promiseOrFunction === 'function' 
      ? promiseOrFunction() 
      : promiseOrFunction;

    return ToastService.promise(promiseToUse, {
      loading: loadingMessage || 'Carregando...',
      success: successMessage || 'Operação concluída!',
      error: errorMessage || 'Erro na operação',
      ...options
    });
  }, []);

  const dismiss = useCallback((toastId?: string | number) => {
    return ToastService.dismiss(toastId);
  }, []);

  const custom = useCallback((jsx: React.ReactNode, options?: ToastOptions) => {
    return ToastService.custom(jsx, options);
  }, []);

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    custom,
    // Padrões pré-definidos
    crud: ToastPatterns.crud,
    auth: ToastPatterns.auth,
    upload: ToastPatterns.upload,
    form: ToastPatterns.form,
    network: ToastPatterns.network,
    clipboard: ToastPatterns.clipboard
  };
};

// Hook especializado para operações assíncronas
export const useAsyncToast = () => {
  const toast = useToast();

  /**
   * Executa operação assíncrona com toast automático
   */
  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    messages: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    } = {}
  ): Promise<T> => {
    const loadingToast = messages.loading 
      ? toast.loading(messages.loading)
      : null;

    try {
      const result = await operation();
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      if (messages.success) {
        const successMessage = typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success;
        toast.success(successMessage);
      }
      
      return result;
    } catch (error: any) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      if (messages.error) {
        const errorMessage = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error;
        toast.error(errorMessage);
      } else {
        toast.error('Erro na operação', {
          description: error?.message || 'Tente novamente mais tarde'
        });
      }
      
      throw error;
    }
  }, [toast]);

  /**
   * Operações CRUD com toast automático
   */
  const crud = useCallback({
    create: async <T>(
      operation: () => Promise<T>,
      entityName: string
    ): Promise<T> => {
      return execute(operation, {
        loading: `Criando ${entityName.toLowerCase()}...`,
        success: `${entityName} criado com sucesso!`,
        error: `Erro ao criar ${entityName.toLowerCase()}`
      });
    },

    update: async <T>(
      operation: () => Promise<T>,
      entityName: string
    ): Promise<T> => {
      return execute(operation, {
        loading: `Atualizando ${entityName.toLowerCase()}...`,
        success: `${entityName} atualizado com sucesso!`,
        error: `Erro ao atualizar ${entityName.toLowerCase()}`
      });
    },

    delete: async <T>(
      operation: () => Promise<T>,
      entityName: string
    ): Promise<T> => {
      return execute(operation, {
        loading: `Excluindo ${entityName.toLowerCase()}...`,
        success: `${entityName} excluído com sucesso!`,
        error: `Erro ao excluir ${entityName.toLowerCase()}`
      });
    }
  }, [execute]);

  return {
    execute,
    crud,
    ...toast
  };
};

// Hook para toasts de formulário
export const useFormToast = () => {
  const toast = useToast();

  const handleSubmit = useCallback(async <T>(
    submitFunction: () => Promise<T>,
    entityName?: string
  ): Promise<T> => {
    try {
      const result = await submitFunction();
      toast.form.saved();
      return result;
    } catch (error: any) {
      toast.form.validationError(error?.message);
      throw error;
    }
  }, [toast]);

  const handleValidationError = useCallback((error: string) => {
    toast.form.validationError(error);
  }, [toast]);

  const handleUnsavedChanges = useCallback(() => {
    toast.form.unsavedChanges();
  }, [toast]);

  return {
    handleSubmit,
    handleValidationError,
    handleUnsavedChanges,
    ...toast
  };
};

// Hook para toasts de upload
export const useUploadToast = () => {
  const toast = useToast();

  const handleUpload = useCallback(async <T>(
    uploadFunction: () => Promise<T>,
    fileName: string
  ): Promise<T> => {
    return toast.promise(
      uploadFunction(),
      {
        loading: `Enviando ${fileName}...`,
        success: `${fileName} enviado com sucesso!`,
        error: `Erro ao enviar ${fileName}`
      }
    );
  }, [toast]);

  const handleInvalidFile = useCallback((reason: string) => {
    toast.upload.invalidFile(reason);
  }, [toast]);

  const handleSizeLimitExceeded = useCallback((limit: string) => {
    toast.upload.sizeLimitExceeded(limit);
  }, [toast]);

  return {
    handleUpload,
    handleInvalidFile,
    handleSizeLimitExceeded,
    ...toast
  };
};

export default useToast;