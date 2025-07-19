import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/common/LoadingStates';

/**
 * Generic Form Dialog Component
 * Eliminates duplicate form dialog patterns across the codebase
 * 
 * Replaces repetitive patterns in:
 * - Authentication forms (LoginForm, RegisterForm, ForgotPasswordForm)
 * - Admin forms (PartnerForm, MaterialForm, ToolForm)
 * - Product forms and other entity forms
 */

interface FormDialogProps<T extends z.ZodType> {
  // Dialog configuration
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  
  // Form configuration
  title: string;
  description?: string;
  schema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  onCancel?: () => void;
  
  // Form content
  children: (form: ReturnType<typeof useForm<z.infer<T>>>) => React.ReactNode;
  
  // Button configuration
  submitLabel?: string;
  cancelLabel?: string;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  // State
  isLoading?: boolean;
  disabled?: boolean;
  
  // Styling
  className?: string;
  contentClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  
  // Advanced options
  closeOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  resetOnClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl", 
  xl: "max-w-6xl",
  full: "max-w-full w-[95vw]"
};

export function FormDialog<T extends z.ZodType>({
  isOpen,
  onOpenChange,
  trigger,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  children,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  submitVariant = "default",
  isLoading = false,
  disabled = false,
  className = "",
  contentClassName = "",
  size = "md",
  closeOnSubmit = true,
  resetOnSubmit = false,
  resetOnClose = true,
}: FormDialogProps<T>) {
  
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleSubmit = async (data: z.infer<T>) => {
    try {
      await onSubmit(data);
      
      if (resetOnSubmit) {
        form.reset();
      }
      
      if (closeOnSubmit && onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      // Error handling is done in the onSubmit function
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    
    if (resetOnClose) {
      form.reset();
    }
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && resetOnClose) {
      form.reset();
    }
    
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const dialogContent = (
    <DialogContent 
      className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${contentClassName}`}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {children(form)}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <LoadingButton
              type="submit"
              variant={submitVariant}
              loading={isLoading}
              disabled={disabled}
            >
              {submitLabel}
            </LoadingButton>
          </div>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}

/**
 * Hook for managing form dialog state
 * Simplifies form dialog usage and state management
 */
export function useFormDialog<T extends z.ZodType>(
  schema: T,
  onSubmit: (data: z.infer<T>) => void | Promise<void>,
  options?: {
    defaultValues?: z.infer<T>;
    resetOnSubmit?: boolean;
    resetOnClose?: boolean;
  }
) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingData, setEditingData] = React.useState<z.infer<T> | undefined>();

  const open = (data?: z.infer<T>) => {
    setEditingData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingData(undefined);
  };

  const handleSubmit = async (data: z.infer<T>) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      if (options?.resetOnSubmit !== false) {
        close();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultValues = editingData || options?.defaultValues;

  return {
    isOpen,
    isLoading,
    editingData,
    defaultValues,
    open,
    close,
    setIsOpen,
    handleSubmit,
    isEditing: !!editingData,
  };
}

/**
 * Pre-configured form dialogs for common use cases
 */

// Simple text input form
interface SimpleFormData {
  name: string;
  description?: string;
}

const simpleFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export function SimpleFormDialog({
  title,
  nameLabel = "Nome",
  descriptionLabel = "Descrição",
  namePlaceholder = "Digite o nome",
  descriptionPlaceholder = "Digite a descrição",
  ...props
}: Omit<FormDialogProps<typeof simpleFormSchema>, 'schema' | 'children'> & {
  nameLabel?: string;
  descriptionLabel?: string;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
}) {
  return (
    <FormDialog
      {...props}
      title={title}
      schema={simpleFormSchema}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{nameLabel}</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder={namePlaceholder}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{descriptionLabel}</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder={descriptionPlaceholder}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormDialog>
  );
}

export default FormDialog;