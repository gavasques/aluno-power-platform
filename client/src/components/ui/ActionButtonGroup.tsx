/**
 * ActionButtonGroup Component - Unified button group component eliminating duplicates
 * Consolidates button patterns from 20+ components across the codebase
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export interface ActionButton {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface ActionButtonGroupProps {
  buttons: ActionButton[];
  className?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  spacing?: 'tight' | 'normal' | 'wide';
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  destructive: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

const alignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end'
};

const spacingClasses = {
  tight: 'gap-2',
  normal: 'gap-3',
  wide: 'gap-4'
};

export function ActionButtonGroup({
  buttons,
  className = '',
  alignment = 'right',
  size = 'md',
  fullWidth = false,
  spacing = 'normal'
}: ActionButtonGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        alignmentClasses[alignment],
        spacingClasses[spacing],
        fullWidth && 'w-full',
        className
      )}
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          type={button.type || 'button'}
          onClick={button.onClick}
          disabled={button.disabled || button.isLoading}
          className={cn(
            'inline-flex items-center justify-center font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            buttonVariants[button.variant || 'primary'],
            sizeClasses[size],
            fullWidth && 'flex-1'
          )}
        >
          {button.isLoading ? (
            <LoadingSpinner size="xs" showMessage={false} className="mr-2" />
          ) : (
            button.icon && <span className="mr-2">{button.icon}</span>
          )}
          {button.isLoading ? 'Processando...' : button.text}
        </button>
      ))}
    </div>
  );
}

// Convenience component for Save/Cancel button pairs
export interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saveText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SaveCancelButtons({
  onSave,
  onCancel,
  saveText = 'Salvar',
  cancelText = 'Cancelar',
  isLoading = false,
  disabled = false,
  className = ''
}: SaveCancelButtonsProps) {
  const buttons: ActionButton[] = [
    {
      text: cancelText,
      onClick: onCancel,
      variant: 'outline',
      disabled: isLoading
    },
    {
      text: saveText,
      onClick: onSave,
      variant: 'primary',
      isLoading,
      disabled,
      type: 'submit'
    }
  ];

  return (
    <ActionButtonGroup
      buttons={buttons}
      className={className}
      alignment="right"
    />
  );
}

// Convenience component for Delete/Cancel button pairs
export interface DeleteCancelButtonsProps {
  onDelete: () => void;
  onCancel: () => void;
  deleteText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DeleteCancelButtons({
  onDelete,
  onCancel,
  deleteText = 'Excluir',
  cancelText = 'Cancelar',
  isLoading = false,
  disabled = false,
  className = ''
}: DeleteCancelButtonsProps) {
  const buttons: ActionButton[] = [
    {
      text: cancelText,
      onClick: onCancel,
      variant: 'outline',
      disabled: isLoading
    },
    {
      text: deleteText,
      onClick: onDelete,
      variant: 'destructive',
      isLoading,
      disabled
    }
  ];

  return (
    <ActionButtonGroup
      buttons={buttons}
      className={className}
      alignment="right"
    />
  );
}

// Convenience component for single action button
export interface ActionButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function ActionButton({
  text,
  onClick,
  variant = 'primary',
  icon,
  isLoading = false,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button'
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        buttonVariants[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {isLoading ? (
        <LoadingSpinner size="xs" showMessage={false} className="mr-2" />
      ) : (
        icon && <span className="mr-2">{icon}</span>
      )}
      {isLoading ? 'Processando...' : text}
    </button>
  );
}