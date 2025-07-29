import React from 'react';
import { Plus, Search, FileX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'create' | 'inbox';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente de empty state reutilizável
 * Elimina duplicação de UI vazia em todo o projeto
 * 
 * @example
 * <EmptyState
 *   title="Nenhum produto encontrado"
 *   description="Comece criando seu primeiro produto"
 *   actionLabel="Criar Produto"
 *   onAction={() => openCreateModal()}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = 'default',
  className,
  children
}) => {
  const getDefaultContent = () => {
    switch (variant) {
      case 'search':
        return {
          title: title || 'Nenhum resultado encontrado',
          description: description || 'Tente ajustar os filtros ou termos de busca.',
          icon: icon || <Search className="h-8 w-8 text-muted-foreground" />,
          actionLabel: actionLabel || 'Limpar filtros'
        };
      case 'create':
        return {
          title: title || 'Ainda não há itens aqui',
          description: description || 'Comece criando o primeiro item.',
          icon: icon || <Plus className="h-8 w-8 text-muted-foreground" />,
          actionLabel: actionLabel || 'Criar primeiro item'
        };
      case 'inbox':
        return {
          title: title || 'Nada por aqui',
          description: description || 'Quando houver novos itens, eles aparecerão aqui.',
          icon: icon || <Inbox className="h-8 w-8 text-muted-foreground" />,
          actionLabel: actionLabel
        };
      default:
        return {
          title: title || 'Nenhum item encontrado',
          description: description || 'Não há dados para exibir no momento.',
          icon: icon || <FileX className="h-8 w-8 text-muted-foreground" />,
          actionLabel: actionLabel
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          {content.icon}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {content.title}
        </h3>
        
        <p className="text-muted-foreground mb-6">
          {content.description}
        </p>

        {children}

        {content.actionLabel && onAction && (
          <Button onClick={onAction} variant="default">
            {variant === 'create' && <Plus className="h-4 w-4 mr-2" />}
            {content.actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente para estado vazio com resultados de busca
 */
export const NoResultsState: React.FC<{
  searchTerm?: string;
  hasFilters?: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  className?: string;
}> = ({ 
  searchTerm, 
  hasFilters, 
  onClearSearch, 
  onClearFilters, 
  className 
}) => {
  const getTitle = () => {
    if (searchTerm && hasFilters) {
      return `Nenhum resultado para "${searchTerm}"`;
    } else if (searchTerm) {
      return `Nenhum resultado para "${searchTerm}"`;
    } else if (hasFilters) {
      return 'Nenhum resultado encontrado';
    }
    return 'Nenhum item encontrado';
  };

  const getDescription = () => {
    if (searchTerm && hasFilters) {
      return 'Tente remover alguns filtros ou alterar o termo de busca.';
    } else if (searchTerm) {
      return 'Tente usar termos diferentes ou verifique a ortografia.';
    } else if (hasFilters) {
      return 'Tente remover alguns filtros para ver mais resultados.';
    }
    return 'Não há itens disponíveis no momento.';
  };

  return (
    <EmptyState
      title={getTitle()}
      description={getDescription()}
      variant="search"
      className={className}
    >
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {searchTerm && onClearSearch && (
          <Button onClick={onClearSearch} variant="outline" size="sm">
            Limpar busca
          </Button>
        )}
        {hasFilters && onClearFilters && (
          <Button onClick={onClearFilters} variant="outline" size="sm">
            Limpar filtros
          </Button>
        )}
      </div>
    </EmptyState>
  );
};

/**
 * Componente para primeiro uso / onboarding
 */
export const FirstTimeState: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  steps?: string[];
  className?: string;
}> = ({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  steps, 
  className 
}) => (
  <EmptyState
    title={title}
    description={description}
    actionLabel={actionLabel}
    onAction={onAction}
    variant="create"
    className={className}
  >
    {steps && steps.length > 0 && (
      <div className="text-left bg-muted/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-2">Como começar:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    )}
  </EmptyState>
);

/**
 * Componente para dados em carregamento que falharam
 */
export const FailedLoadState: React.FC<{
  onRetry: () => void;
  onCreate?: () => void;
  entityName?: string;
  className?: string;
}> = ({ onRetry, onCreate, entityName = 'item', className }) => (
  <EmptyState
    title="Falha ao carregar dados"
    description={`Não foi possível carregar os ${entityName}s. Tente novamente ou crie um novo.`}
    variant="default"
    className={className}
  >
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <Button onClick={onRetry} variant="default">
        Tentar Novamente
      </Button>
      {onCreate && (
        <Button onClick={onCreate} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Criar {entityName}
        </Button>
      )}
    </div>
  </EmptyState>
);