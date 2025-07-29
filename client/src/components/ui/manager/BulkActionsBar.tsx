/**
 * Componente para barra de ações em lote
 * Aparece quando itens são selecionados
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  CheckSquare, 
  Square, 
  Minus, 
  X,
  Download,
  Edit
} from 'lucide-react';
import { BulkAction } from '@/hooks/useBulkActions';

interface BulkActionsBarProps {
  isVisible: boolean;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isPartialSelected: boolean;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onExecuteAction: (action: BulkAction) => void;
  actions?: BulkAction[];
  isExecuting?: boolean;
  className?: string;
}

export function BulkActionsBar({
  isVisible,
  selectedCount,
  totalCount,
  isAllSelected,
  isPartialSelected,
  onToggleAll,
  onClearSelection,
  onExecuteAction,
  actions = [],
  isExecuting = false,
  className = ''
}: BulkActionsBarProps) {
  if (!isVisible || selectedCount === 0) {
    return null;
  }

  const defaultActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Excluir',
      icon: Trash2,
      variant: 'destructive',
      requiresConfirmation: true
    },
    {
      id: 'activate',
      label: 'Ativar',
      icon: CheckSquare,
      variant: 'default'
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: Download,
      variant: 'default'
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 
      bg-white border-t shadow-lg 
      transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      ${className}
    `}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Seleção e contadores */}
          <div className="flex items-center gap-4">
            {/* Checkbox master */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleAll}
                className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                {...(isPartialSelected && !isAllSelected ? { 
                  'data-state': 'indeterminate',
                  ref: (el: HTMLButtonElement | null) => {
                    if (el) {
                      el.indeterminate = true;
                    }
                  }
                } : {})}
              />
              <span className="text-sm font-medium">
                {isAllSelected ? 'Desmarcar todos' : 'Marcar todos'}
              </span>
            </div>

            {/* Contador de selecionados */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedCount} de {totalCount} selecionados
              </Badge>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Botões de ação */}
            {allActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => onExecuteAction(action)}
                  disabled={isExecuting}
                  className="flex items-center gap-2"
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}

            {/* Botão limpar seleção */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isExecuting}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Indicador de carregamento */}
        {isExecuting && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            Executando ação...
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para checkbox individual nos cards/items
interface SelectableItemWrapperProps {
  children: React.ReactNode;
  isSelected: boolean;
  onToggle: () => void;
  isSelectionMode: boolean;
  className?: string;
}

export function SelectableItemWrapper({
  children,
  isSelected,
  onToggle,
  isSelectionMode,
  className = ''
}: SelectableItemWrapperProps) {
  return (
    <div 
      className={`
        relative transition-all duration-200
        ${isSelectionMode ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={isSelectionMode ? onToggle : undefined}
    >
      {/* Checkbox overlay */}
      {isSelectionMode && (
        <div className="absolute top-2 right-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="bg-white shadow-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      {/* Conteúdo do item */}
      <div className={isSelected ? 'opacity-75' : ''}>
        {children}
      </div>
    </div>
  );
}