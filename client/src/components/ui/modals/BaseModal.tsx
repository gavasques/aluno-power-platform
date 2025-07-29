import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Modal base reutilizável que elimina duplicação de configuração de modais
 * Fornece estrutura consistente para todos os modais do sistema
 * 
 * @example
 * <BaseModal
 *   isOpen={modal.isOpen}
 *   onClose={modal.close}
 *   title="Criar Produto"
 *   description="Preencha os campos abaixo"
 *   size="lg"
 * >
 *   <ProductForm />
 * </BaseModal>
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  className,
  children
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          size === 'full' && 'h-[95vh] overflow-hidden',
          className
        )}
      >
        {(title || description || showCloseButton) && (
          <DialogHeader className="relative">
            {title && (
              <DialogTitle className="text-lg font-semibold pr-8">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-muted-foreground">
                {description}
              </DialogDescription>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            )}
          </DialogHeader>
        )}
        
        <div className={cn(
          "flex-1",
          size === 'full' && "overflow-auto"
        )}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Modal especializado para formulários CRUD
 */
export interface CrudModalProps extends Omit<BaseModalProps, 'children'> {
  mode: 'create' | 'edit' | 'view';
  entityName: string;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export const CrudModal: React.FC<CrudModalProps> = ({
  mode,
  entityName,
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitText,
  cancelText = 'Cancelar',
  children,
  ...modalProps
}) => {
  const getModeTitle = () => {
    switch (mode) {
      case 'create':
        return `Criar ${entityName}`;
      case 'edit':
        return `Editar ${entityName}`;
      case 'view':
        return `Visualizar ${entityName}`;
      default:
        return entityName;
    }
  };

  const getModeSubmitText = () => {
    if (submitText) return submitText;
    switch (mode) {
      case 'create':
        return 'Criar';
      case 'edit':
        return 'Salvar';
      default:
        return 'Confirmar';
    }
  };

  const showActions = mode !== 'view' && (onSubmit || onCancel);

  return (
    <BaseModal
      {...modalProps}
      title={modalProps.title || getModeTitle()}
    >
      <div className="space-y-6">
        <div className="flex-1">
          {children}
        </div>
        
        {showActions && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
            )}
            {onSubmit && mode !== 'view' && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : getModeSubmitText()}
              </Button>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

/**
 * Modal de confirmação reutilizável
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <p className="text-muted-foreground">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal de visualização rápida/preview
 */
export interface QuickViewModalProps extends Omit<BaseModalProps, 'children'> {
  data: Record<string, any>;
  fields: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  data,
  fields,
  ...modalProps
}) => {
  return (
    <BaseModal {...modalProps} size="md">
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="grid grid-cols-3 gap-4">
            <dt className="font-medium text-muted-foreground">
              {field.label}:
            </dt>
            <dd className="col-span-2 text-foreground">
              {field.format 
                ? field.format(data[field.key]) 
                : data[field.key] || '-'
              }
            </dd>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};