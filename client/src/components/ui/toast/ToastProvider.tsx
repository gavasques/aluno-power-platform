import React from 'react';
import { Toaster } from 'sonner';

interface ToastProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
  toastOptions?: {
    className?: string;
    style?: React.CSSProperties;
    duration?: number;
  };
}

/**
 * Provider de toasts centralizado
 * Deve ser usado no App.tsx para configurar toasts globalmente
 * 
 * @example
 * <ToastProvider
 *   theme="system"
 *   position="top-right"
 *   richColors
 *   closeButton
 * >
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  theme = 'system',
  position = 'top-right',
  expand = false,
  richColors = true,
  closeButton = true,
  toastOptions
}) => {
  return (
    <>
      {children}
      <Toaster
        theme={theme}
        position={position}
        expand={expand}
        richColors={richColors}
        closeButton={closeButton}
        toastOptions={{
          className: toastOptions?.className,
          style: toastOptions?.style,
          duration: toastOptions?.duration || 4000,
        }}
      />
    </>
  );
};

export default ToastProvider;