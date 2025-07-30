/**
 * Hook para ações em lote (bulk actions)
 * Permite seleção múltipla e operações em massa
 */

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  confirmMessage?: string;
  requiresConfirmation?: boolean;
}

interface UseBulkActionsProps {
  resource: string;
  items: any[];
  onActionComplete?: () => void;
}

export function useBulkActions({ 
  resource, 
  items, 
  onActionComplete 
}: UseBulkActionsProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado da seleção
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Itens selecionados
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // Estatísticas da seleção
  const selectionStats = useMemo(() => {
    const total = items.length;
    const selected = selectedIds.size;
    const isAllSelected = selected === total && total > 0;
    const isPartialSelected = selected > 0 && selected < total;
    
    return {
      total,
      selected,
      isAllSelected,
      isPartialSelected,
      hasSelection: selected > 0
    };
  }, [items.length, selectedIds.size]);

  // Mutation para ações em lote
  const bulkMutation = useMutation({
    mutationFn: async ({ action, ids, data }: { 
      action: string; 
      ids: number[]; 
      data?: any 
    }) => {
      const response = await fetch(`/api/financas360/${resource}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          ids,
          data
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao executar ação em lote`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [`financas360-${resource}`],
        exact: false 
      });

      // Limpar seleção
      clearSelection();

      // Callback de conclusão
      if (onActionComplete) {
        onActionComplete();
      }

      // Toast de sucesso
      toast({
        title: 'Sucesso',
        description: `Ação executada em ${variables.ids.length} item(s)`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Gerenciamento de seleção
  const toggleItem = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) {
        // Se saindo do modo seleção, limpar seleção
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  // Verificar se um item está selecionado
  const isSelected = useCallback((id: number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Executar ação em lote
  const executeBulkAction = useCallback(async (
    action: BulkAction, 
    data?: any
  ) => {
    if (selectedIds.size === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum item selecionado',
        variant: 'destructive'
      });
      return;
    }

    // Confirmar ação se necessário
    if (action.requiresConfirmation) {
      const message = action.confirmMessage || 
        `Tem certeza que deseja ${action.label.toLowerCase()} ${selectedIds.size} item(s)?`;
      
      if (!window.confirm(message)) {
        return;
      }
    }

    // Executar mutation
    bulkMutation.mutate({
      action: action.id,
      ids: Array.from(selectedIds),
      data
    });
  }, [selectedIds, bulkMutation, toast]);

  // Ações predefinidas comuns
  const commonActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Excluir Selecionados',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmMessage: `Tem certeza que deseja excluir ${selectedIds.size} item(s)? Esta ação não pode ser desfeita.`
    },
    {
      id: 'activate',
      label: 'Ativar Selecionados',
      variant: 'default'
    },
    {
      id: 'deactivate', 
      label: 'Desativar Selecionados',
      variant: 'default'
    }
  ];

  // Função para executar ações predefinidas
  const deleteSelected = () => executeBulkAction(commonActions[0]);
  const activateSelected = () => executeBulkAction(commonActions[1]);
  const deactivateSelected = () => executeBulkAction(commonActions[2]);

  return {
    // Estado da seleção
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectionStats,
    isSelectionMode,

    // Controles de seleção
    toggleItem,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    isSelected,

    // Execução de ações
    executeBulkAction,
    deleteSelected,
    activateSelected,
    deactivateSelected,

    // Estado da mutation
    isExecuting: bulkMutation.isPending,

    // Ações predefinidas
    commonActions
  };
}