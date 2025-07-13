import { useState, useCallback, useMemo } from 'react';
import { AmazonAdsRow, ChangeHistory, BulkEditData, FilterState } from '../utils/types';

export const useAmazonData = () => {
  const [data, setData] = useState<AmazonAdsRow[]>([]);
  const [changes, setChanges] = useState<ChangeHistory[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    entidade: '',
    campanha: '',
    estado: '',
    alteracoes: 'todas',
    validacao: 'todas',
    busca: ''
  });

  // Atualizar uma linha específica
  const updateRow = useCallback((rowId: string, updates: Partial<AmazonAdsRow>, reason?: string) => {
    setData(prevData => {
      const newData = prevData.map(row => {
        if (row._id === rowId) {
          const updatedRow = { ...row, ...updates, _hasChanges: true };
          
          // Registrar alterações
          Object.keys(updates).forEach(field => {
            if (field.startsWith('_')) return; // Skip internal fields
            
            const oldValue = row[field as keyof AmazonAdsRow];
            const newValue = updates[field as keyof AmazonAdsRow];
            
            if (oldValue !== newValue) {
              const change: ChangeHistory = {
                id: `change_${Date.now()}_${Math.random()}`,
                timestamp: new Date(),
                field,
                oldValue,
                newValue,
                rowIndex: row._originalIndex || 0,
                reason
              };
              
              setChanges(prevChanges => [...prevChanges, change]);
            }
          });
          
          return updatedRow;
        }
        return row;
      });
      
      return newData;
    });
  }, []);

  // Aplicar edição em lote
  const bulkUpdate = useCallback((rowIds: string[], updates: BulkEditData) => {
    const { reason, ...fieldUpdates } = updates;
    
    rowIds.forEach(rowId => {
      updateRow(rowId, fieldUpdates, reason);
    });
  }, [updateRow]);

  // Desfazer alteração específica
  const undoChange = useCallback((changeId: string) => {
    const change = changes.find(c => c.id === changeId);
    if (!change) return;

    const targetRow = data.find(row => row._originalIndex === change.rowIndex);
    if (!targetRow) return;

    updateRow(targetRow._id!, { [change.field]: change.oldValue }, 'Desfazer alteração');
    
    // Remover mudança do histórico
    setChanges(prevChanges => prevChanges.filter(c => c.id !== changeId));
  }, [changes, data, updateRow]);

  // Filtrar dados baseado nos filtros aplicados
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Filtro por entidade
      if (filters.entidade && row.Entidade !== filters.entidade) {
        return false;
      }
      
      // Filtro por campanha
      if (filters.campanha && !row['Nome da campanha'].toLowerCase().includes(filters.campanha.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (filters.estado && row.Estado !== filters.estado) {
        return false;
      }
      
      // Filtro por alterações
      if (filters.alteracoes === 'alteradas' && !row._hasChanges) {
        return false;
      }
      if (filters.alteracoes === 'sem_alteracoes' && row._hasChanges) {
        return false;
      }
      
      // Filtro por validação
      if (filters.validacao === 'com_erros' && (!row._validationErrors || row._validationErrors.length === 0)) {
        return false;
      }
      if (filters.validacao === 'sem_erros' && row._validationErrors && row._validationErrors.length > 0) {
        return false;
      }
      
      // Busca textual
      if (filters.busca) {
        const searchTerm = filters.busca.toLowerCase();
        const searchableFields = [
          row['Nome da campanha'],
          row['Nome do grupo de anúncios'],
          row['Texto de palavras-chave'],
          row.Produto
        ];
        
        if (!searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters]);

  // Estatísticas dos dados
  const statistics = useMemo(() => {
    const changedRows = data.filter(row => row._hasChanges).length;
    const totalErrors = data.reduce((sum, row) => sum + (row._validationErrors?.length || 0), 0);
    const campaigns = new Set(data.map(row => row['Nome da campanha'])).size;
    const adGroups = new Set(data.map(row => 
      row['Nome do grupo de anúncios'] ? 
      `${row['Nome da campanha']}-${row['Nome do grupo de anúncios']}` : 
      null
    ).filter(Boolean)).size;

    return {
      totalRows: data.length,
      changedRows,
      totalErrors,
      totalCampaigns: campaigns,
      totalAdGroups: adGroups,
      totalChanges: changes.length
    };
  }, [data, changes]);

  // Opções únicas para filtros
  const filterOptions = useMemo(() => {
    const entidades = Array.from(new Set(data.map(row => row.Entidade))).sort();
    const campanhas = Array.from(new Set(data.map(row => row['Nome da campanha']))).sort();
    const estados = Array.from(new Set(data.map(row => row.Estado))).sort();

    return {
      entidades,
      campanhas,
      estados
    };
  }, [data]);

  // Reset dos dados
  const resetData = useCallback(() => {
    setData([]);
    setChanges([]);
    setFilters({
      entidade: '',
      campanha: '',
      estado: '',
      alteracoes: 'todas',
      validacao: 'todas',
      busca: ''
    });
  }, []);

  // Carregar novos dados
  const loadData = useCallback((newData: AmazonAdsRow[]) => {
    setData(newData);
    setChanges([]);
  }, []);

  return {
    data,
    filteredData,
    changes,
    filters,
    statistics,
    filterOptions,
    updateRow,
    bulkUpdate,
    undoChange,
    setFilters,
    resetData,
    loadData
  };
};