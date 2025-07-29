/**
 * Componente reutilizável para quando não há resultados de busca/filtro
 * Elimina duplicação dos estados de "nenhum resultado encontrado"
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface NoResultsStateProps {
  searchTerm?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  className?: string;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NoResultsState({
  searchTerm,
  hasFilters = false,
  onClearFilters,
  onClearSearch,
  className = "",
  title,
  description,
  size = 'md'
}: NoResultsStateProps) {
  const sizeClasses = {
    sm: { 
      container: 'py-8', 
      icon: 'h-8 w-8', 
      title: 'text-base', 
      description: 'text-sm' 
    },
    md: { 
      container: 'py-12', 
      icon: 'h-12 w-12', 
      title: 'text-lg', 
      description: 'text-base' 
    },
    lg: { 
      container: 'py-16', 
      icon: 'h-16 w-16', 
      title: 'text-xl', 
      description: 'text-lg' 
    }
  };

  const classes = sizeClasses[size];

  // Determinar ícone e mensagens baseado no contexto
  const getContent = () => {
    if (searchTerm && hasFilters) {
      return {
        icon: Search,
        title: title || 'Nenhum resultado encontrado',
        description: description || `Não encontramos resultados para "${searchTerm}" com os filtros aplicados.`,
        actions: [
          { label: 'Limpar busca', onClick: onClearSearch, icon: X },
          { label: 'Limpar filtros', onClick: onClearFilters, icon: Filter }
        ]
      };
    } else if (searchTerm) {
      return {
        icon: Search,
        title: title || 'Nenhum resultado encontrado',
        description: description || `Não encontramos resultados para "${searchTerm}".`,
        actions: onClearSearch ? [{ label: 'Limpar busca', onClick: onClearSearch, icon: X }] : []
      };
    } else if (hasFilters) {
      return {
        icon: Filter,
        title: title || 'Nenhum resultado encontrado',
        description: description || 'Não encontramos resultados com os filtros aplicados.',
        actions: onClearFilters ? [{ label: 'Limpar filtros', onClick: onClearFilters, icon: Filter }] : []
      };
    } else {
      return {
        icon: Search,
        title: title || 'Nenhum resultado encontrado',
        description: description || 'Não foram encontrados itens.',
        actions: []
      };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className={`text-center ${classes.container} ${className}`}>
      <IconComponent className={`${classes.icon} text-gray-400 mx-auto mb-4`} />
      
      <h3 className={`${classes.title} font-medium text-gray-900 mb-2`}>
        {content.title}
      </h3>
      
      <p className={`${classes.description} text-gray-600 mb-6 max-w-md mx-auto`}>
        {content.description}
      </p>
      
      {content.actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {content.actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ActionIcon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}