import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { CrudModal } from './BaseModal';
import { useAsyncState } from '@/hooks/useAsyncState';

export interface FormModalProps<T extends Record<string, any> = Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  entityName: string;
  title?: string;
  description?: string;
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Modal de formulário genérico que elimina duplicação de lógica de forms
 * Integra com react-hook-form, zod validation, e useAsyncState
 * 
 * @example
 * const productSchema = z.object({
 *   name: z.string().min(1, 'Nome é obrigatório'),
 *   price: z.number().min(0, 'Preço deve ser positivo')
 * });
 * 
 * <FormModal
 *   isOpen={modal.isOpen}
 *   onClose={modal.close}
 *   mode={modal.mode}
 *   entityName="Produto"
 *   schema={productSchema}
 *   defaultValues={modal.editingItem}
 *   onSubmit={handleSubmit}
 * >
 *   {(form) => (
 *     <>
 *       <FormField name="name" control={form.control} render={...} />
 *       <FormField name="price" control={form.control} render={...} />
 *     </>
 *   )}
 * </FormModal>
 */
export function FormModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  mode,
  entityName,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  children,
  size = 'lg'
}: FormModalProps<T>) {
  const { isLoading, execute } = useAsyncState();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange'
  });

  // Reset form when modal opens/closes or defaultValues change
  React.useEffect(() => {
    if (isOpen && defaultValues) {
      form.reset(defaultValues as any);
    } else if (isOpen && mode === 'create') {
      form.reset({} as any);
    }
  }, [isOpen, defaultValues, mode, form]);

  const handleSubmit = form.handleSubmit(async (data: T) => {
    await execute(
      () => onSubmit(data),
      {
        successMessage: mode === 'create' 
          ? `${entityName} criado com sucesso!`
          : `${entityName} atualizado com sucesso!`,
        onSuccess: () => {
          onClose();
          form.reset();
        }
      }
    );
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={handleCancel}
      mode={mode}
      entityName={entityName}
      title={title}
      description={description}
      size={size}
      isSubmitting={isLoading}
      onSubmit={mode !== 'view' ? handleSubmit : undefined}
      onCancel={handleCancel}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {children(form)}
        </form>
      </Form>
    </CrudModal>
  );
}

/**
 * Hook para facilitar o uso do FormModal
 * Combina useModalState com FormModal para máxima conveniência
 */
export function useFormModal<T extends Record<string, any>>(
  entityName: string,
  schema: z.ZodSchema<T>,
  onSubmit: (data: T, mode: 'create' | 'edit') => Promise<void>
) {
  const [state, setState] = React.useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit' | 'view',
    editingItem: null as T | null
  });

  const openCreate = React.useCallback(() => {
    setState({
      isOpen: true,
      mode: 'create',
      editingItem: null
    });
  }, []);

  const openEdit = React.useCallback((item: T) => {
    setState({
      isOpen: true,
      mode: 'edit',
      editingItem: item
    });
  }, []);

  const openView = React.useCallback((item: T) => {
    setState({
      isOpen: true,
      mode: 'view',
      editingItem: item
    });
  }, []);

  const close = React.useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleSubmit = React.useCallback(async (data: T) => {
    await onSubmit(data, state.mode as 'create' | 'edit');
  }, [onSubmit, state.mode]);

  const FormModalComponent = React.useCallback(({
    children,
    ...props
  }: Omit<FormModalProps<T>, 'isOpen' | 'onClose' | 'mode' | 'entityName' | 'schema' | 'defaultValues' | 'onSubmit'> & {
    children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode;
  }) => (
    <FormModal<T>
      isOpen={state.isOpen}
      onClose={close}
      mode={state.mode}
      entityName={entityName}
      schema={schema}
      defaultValues={state.editingItem || undefined}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </FormModal>
  ), [state, close, entityName, schema, handleSubmit]);

  return {
    isOpen: state.isOpen,
    mode: state.mode,
    editingItem: state.editingItem,
    openCreate,
    openEdit,
    openView,
    close,
    FormModal: FormModalComponent
  };
}