/**
 * Componente layout principal para managers
 * Integra todos os componentes reutilizáveis criados
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { LoadingState, ErrorState, EmptyState, NoResultsState } from '@/components/ui/states';
import { FormDialog } from './FormDialog';
import { FilterBar } from './FilterBar';
import { ItemCard } from './ItemCard';

interface ManagerLayoutProps<T = any> {
  // Header
  title: string;
  icon?: LucideIcon;
  description?: string;
  
  // Data
  items: T[];
  filteredItems: T[];
  isLoading: boolean;
  error: Error | null;
  
  // Dialog
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Form
  formContent: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  
  // Actions
  onCreateClick: () => void;
  onRetry?: () => void;
  
  // Filters (optional)
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }>;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  
  // Items rendering
  renderItem: (item: T) => React.ReactNode;
  
  // Empty states
  emptyStateIcon?: LucideIcon;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  noResultsTitle?: string;
  noResultsDescription?: string;
  
  // Layout options
  gridColumns?: 'auto' | '1' | '2' | '3' | '4';
  className?: string;
  containerClassName?: string;
  
  // Action buttons (além do criar)
  headerActions?: React.ReactNode;
}

export function ManagerLayout<T = any>({
  title,
  icon: Icon,
  description,
  items,
  filteredItems,
  isLoading,
  error,
  isDialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogSize = 'lg',
  formContent,
  onSubmit,
  isSubmitting,
  onCreateClick,
  onRetry,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters,
  onClearFilters,
  hasActiveFilters,
  renderItem,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  noResultsTitle,
  noResultsDescription,
  gridColumns = 'auto',
  className = '',
  containerClassName = 'p-6',
  headerActions
}: ManagerLayoutProps<T>) {
  
  // Loading state
  if (isLoading) {
    return (
      <div className={containerClassName}>
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClassName}>
        <ErrorState 
          error={error} 
          onRetry={onRetry}
          title={`Erro ao carregar ${title.toLowerCase()}`}
        />
      </div>
    );
  }

  const gridClasses = {
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2', 
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const hasSearch = !!onSearchChange;
  const hasFilters = filters && filters.length > 0;
  const showFilterBar = hasSearch || hasFilters;
  const hasResults = filteredItems.length > 0;
  const hasOriginalItems = items.length > 0;
  const showNoResults = !hasResults && hasOriginalItems && (searchTerm || hasActiveFilters);
  const showEmptyState = !hasResults && !hasOriginalItems;

  return (
    <div className={containerClassName}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-blue-600" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {headerActions}
          <Button 
            onClick={onCreateClick} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo {title.slice(0, -1)} {/* Remove 's' do plural */}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilterBar && (
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          onClearFilters={onClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Content */}
      <div className={className}>
        {/* Items Grid */}
        {hasResults && (
          <div className={`grid ${gridClasses[gridColumns]} gap-4`}>
            {filteredItems.map((item, index) => renderItem(item))}
          </div>
        )}

        {/* No Results State */}
        {showNoResults && (
          <NoResultsState
            searchTerm={searchTerm}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onClearSearch={onSearchChange ? () => onSearchChange('') : undefined}
            title={noResultsTitle}
            description={noResultsDescription}
          />
        )}

        {/* Empty State */}
        {showEmptyState && (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle || `Nenhum ${title.toLowerCase().slice(0, -1)} cadastrado`}
            description={emptyStateDescription || `Comece criando seu primeiro ${title.toLowerCase().slice(0, -1)}.`}
            actionLabel={`Novo ${title.slice(0, -1)}`}
            onAction={onCreateClick}
          />
        )}
      </div>

      {/* Form Dialog */}
      <FormDialog
        open={isDialogOpen}
        onOpenChange={onDialogOpenChange}
        title={dialogTitle}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        size={dialogSize}
      >
        {formContent}
      </FormDialog>
    </div>
  );
}