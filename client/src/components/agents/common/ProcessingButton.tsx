import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProcessingButtonProps {
  isProcessing: boolean;
  isValid: boolean;
  onProcess: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  processingText?: string;
  idleText?: string;
  invalidText?: string;
  icon?: React.ReactNode;
}

export const ProcessingButton: React.FC<ProcessingButtonProps> = ({
  isProcessing,
  isValid,
  onProcess,
  className = '',
  size = 'default',
  processingText = 'Processando...',
  idleText = 'Processar',
  invalidText = 'Preencha os campos obrigatórios',
  icon
}) => {
  return (
    <Button
      onClick={onProcess}
      disabled={!isValid || isProcessing}
      className={`w-full ${className}`}
      size={size}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {processingText}
        </>
      ) : isValid ? (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {idleText}
        </>
      ) : (
        invalidText
      )}
    </Button>
  );
};