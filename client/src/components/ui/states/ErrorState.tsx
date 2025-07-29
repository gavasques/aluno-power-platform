import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  variant?: 'inline' | 'card' | 'fullscreen';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente de error state reutilizável
 * Elimina duplicação de UI de erro em todo o projeto
 * 
 * @example
 * <ErrorState error="Falha ao carregar dados" onRetry={refetch} />
 * <ErrorState error={error} variant="fullscreen" onGoHome={() => navigate('/')} />
 * <ErrorState error="Erro de validação" variant="inline" />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title,
  onRetry,
  onGoBack,
  onGoHome,
  retryLabel = "Tentar Novamente",
  variant = 'card',
  showIcon = true,
  className,
  children
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorTitle = title || (variant === 'fullscreen' ? 'Ops! Algo deu errado' : 'Erro');

  const renderInline = () => (
    <Alert variant="destructive" className={className}>
      {showIcon && <AlertTriangle className="h-4 w-4" />}
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription className="mt-2">
        {errorMessage}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 ml-0"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );

  const renderCard = () => (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        {showIcon && (
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {errorTitle}
        </h3>
        <p className="text-muted-foreground mb-4">
          {errorMessage}
        </p>
        {children}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderFullscreen = () => (
    <div className={cn(
      "fixed inset-0 bg-background flex items-center justify-center z-50",
      className
    )}>
      <div className="text-center max-w-lg px-4">
        {showIcon && (
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {errorTitle}
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          {errorMessage}
        </p>
        {children}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="outline" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Página Inicial
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'inline':
      return renderInline();
    case 'fullscreen':
      return renderFullscreen();
    default:
      return renderCard();
  }
};

/**
 * Componente para erros de validação
 */
export const ValidationErrorState: React.FC<{
  errors: Record<string, string[]>;
  title?: string;
  className?: string;
}> = ({ errors, title = "Erros de validação", className }) => {
  const errorEntries = Object.entries(errors).filter(([, errs]) => errs.length > 0);
  
  if (errorEntries.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1">
          {errorEntries.map(([field, fieldErrors]) =>
            fieldErrors.map((error, index) => (
              <li key={`${field}-${index}`}>
                <span className="font-medium">{field}:</span> {error}
              </li>
            ))
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Componente para erros de rede
 */
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorState
    error="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
    title="Erro de conexão"
    onRetry={onRetry}
    retryLabel="Reconectar"
    className={className}
  >
    <div className="text-sm text-muted-foreground mb-4">
      • Verifique sua conexão com a internet<br />
      • Tente recarregar a página<br />
      • Se o problema persistir, entre em contato com o suporte
    </div>
  </ErrorState>
);

/**
 * Componente para erros 404
 */
export const NotFoundErrorState: React.FC<{
  resource?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
}> = ({ resource = "página", onGoBack, onGoHome, className }) => (
  <ErrorState
    error={`A ${resource} que você está procurando não foi encontrada.`}
    title="Não encontrado"
    variant="card"
    onGoBack={onGoBack}
    onGoHome={onGoHome}
    className={className}
  >
    <div className="text-sm text-muted-foreground mb-4">
      Verifique se o endereço está correto ou tente navegar para outra seção.
    </div>
  </ErrorState>
);