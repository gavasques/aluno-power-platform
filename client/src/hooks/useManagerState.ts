/**
 * Hook para gerenciar estados comuns dos managers
 * Elimina duplicação de estados e handlers básicos
 */

import { useState } from 'react';
import { BaseFinancasEntity, BaseFormData, FilterOptions } from '@/types/financas360';

interface UseManagerStateProps<TEntity, TFormData> {
  initialFormData: TFormData;
  mapEntityToForm?: (entity: TEntity) => TFormData;
}

export function useManagerState<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData>({
  initialFormData,
  mapEntityToForm
}: UseManagerStateProps<TEntity, TFormData>) {
  // Estados do dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TEntity | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState<TFormData>(initialFormData);

  // Estados de filtros
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  });

  // Reset do formulário
  const resetForm = () => {
    setFormData(initialFormData);
  };

  // Abrir dialog para criar novo item
  const openCreateDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Abrir dialog para editar item existente
  const openEditDialog = (item: TEntity) => {
    setEditingItem(item);
    if (mapEntityToForm) {
      setFormData(mapEntityToForm(item));
    } else {
      // Fallback: copia campos compatíveis
      const mappedData = { ...initialFormData };
      Object.keys(mappedData).forEach(key => {
        if (key in item) {
          (mappedData as any)[key] = (item as any)[key];
        }
      });
      setFormData(mappedData);
    }
    setIsDialogOpen(true);
  };

  // Fechar dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    resetForm();
  };

  // Atualizar campo do formulário
  const updateFormData = (field: keyof TFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualizar formulário completo
  const updateFormDataBatch = (updates: Partial<TFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Atualizar filtros
  const updateFilter = (filter: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      typeFilter: 'all'
    });
  };

  // Função de filtro genérica
  const filterItems = <T extends Record<string, any>>(items: T[]): T[] => {
    return items.filter(item => {
      // Filtro de busca textual
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = ['nome', 'descricao', 'razaoSocial', 'codigo', 'nomeCompleto'];
        const matchesSearch = searchableFields.some(field => {
          const fieldValue = item[field];
          return fieldValue && String(fieldValue).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        const statusField = item.status || item.isActive !== undefined ? (item.isActive ? 'ativo' : 'inativo') : null;
        if (statusField !== filters.statusFilter) return false;
      }

      // Filtro de tipo
      if (filters.typeFilter && filters.typeFilter !== 'all') {
        if (item.tipo !== filters.typeFilter) return false;
      }

      return true;
    });
  };

  return {
    // Estados
    isDialogOpen,
    editingItem,
    formData,
    filters,

    // Setters diretos
    setIsDialogOpen,
    setEditingItem,
    setFormData,
    setFilters,

    // Handlers
    resetForm,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateFormData,
    updateFormDataBatch,
    updateFilter,
    clearFilters,
    filterItems,

    // Estados derivados
    isEditing: editingItem !== null,
    hasFilters: Object.values(filters).some(value => value && value !== 'all')
  };
}