/**
 * Hook para funcionalidades de export/import
 * Permite exportar dados em vários formatos e importar dados
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  fields?: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
}

export interface ImportOptions {
  format: 'csv' | 'xlsx' | 'json';
  mapping?: Record<string, string>; // Mapear colunas do arquivo para campos do sistema
  skipFirstRow?: boolean;
  validateData?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

interface UseExportImportProps {
  resource: string;
  exportFields?: Array<{
    key: string;
    label: string;
    type?: 'string' | 'number' | 'date' | 'boolean';
  }>;
  importFields?: Array<{
    key: string;
    label: string;
    required?: boolean;
    type?: 'string' | 'number' | 'date' | 'boolean';
    validator?: (value: any) => string | null;
  }>;
}

export function useExportImport({
  resource,
  exportFields = [],
  importFields = []
}: UseExportImportProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Mutation para export
  const exportMutation = useMutation({
    mutationFn: async (options: ExportOptions) => {
      const response = await fetch(`/api/financas360/${resource}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao exportar dados');
      }

      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Criar download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = variables.filename || `${resource}-export.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Sucesso',
        description: 'Dados exportados com sucesso!'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na Exportação',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsExporting(false);
    }
  });

  // Mutation para import
  const importMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: ImportOptions }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await fetch(`/api/financas360/${resource}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao importar dados');
      }

      return response.json();
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'Importação Concluída',
          description: `${result.imported} registros importados com sucesso!`
        });
      } else {
        toast({
          title: 'Importação com Erros',
          description: `${result.imported} registros importados. ${result.errors.length} erros encontrados.`,
          variant: 'destructive'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na Importação',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsImporting(false);
    }
  });

  // Exportar dados
  const exportData = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    
    // Adicionar campos padrão se não especificados
    if (!options.fields && exportFields.length > 0) {
      options.fields = exportFields.map(field => field.key);
    }

    exportMutation.mutate(options);
  }, [exportMutation, exportFields]);

  // Exportar selecionados
  const exportSelected = useCallback(async (
    selectedIds: number[], 
    format: ExportFormat = 'xlsx'
  ) => {
    await exportData({
      format,
      filename: `${resource}-selecionados.${format}`,
      filters: { ids: selectedIds }
    });
  }, [exportData, resource]);

  // Exportar todos com filtros
  const exportFiltered = useCallback(async (
    filters: Record<string, any>, 
    format: ExportFormat = 'xlsx'
  ) => {
    await exportData({
      format,
      filename: `${resource}-filtrados.${format}`,
      filters
    });
  }, [exportData, resource]);

  // Importar arquivo
  const importFile = useCallback(async (file: File, options: ImportOptions) => {
    setIsImporting(true);
    setImportResult(null);
    
    importMutation.mutate({ file, options });
  }, [importMutation]);

  // Baixar template de importação
  const downloadTemplate = useCallback(async (format: 'csv' | 'xlsx' = 'xlsx') => {
    const templateData = importFields.map(field => ({
      [field.key]: field.type === 'string' ? 'Exemplo' :
                  field.type === 'number' ? '123' :
                  field.type === 'date' ? '2024-01-01' :
                  field.type === 'boolean' ? 'true' : 'valor'
    }));

    // Criar dados de exemplo para template
    const headers = importFields.map(field => field.label);
    const exampleRow = importFields.map(field => {
      switch (field.type) {
        case 'string': return 'Exemplo';
        case 'number': return '123';
        case 'date': return '01/01/2024';
        case 'boolean': return 'Sim';
        default: return 'valor';
      }
    });

    await exportData({
      format: format as ExportFormat,
      filename: `template-importacao-${resource}.${format}`,
      fields: importFields.map(f => f.key),
      filters: { template: true, data: [headers, exampleRow] }
    });
  }, [exportData, importFields, resource]);

  // Gerar preview dos dados de importação
  const previewImport = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV simples
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1, 6).map(line => { // Primeiras 5 linhas
              const values = line.split(',').map(v => v.trim());
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
            resolve(rows);
          } else if (file.name.endsWith('.json')) {
            // Parse JSON
            const data = JSON.parse(text);
            resolve(Array.isArray(data) ? data.slice(0, 5) : [data]);
          } else {
            reject(new Error('Formato não suportado para preview'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  return {
    // Estados
    isExporting,
    isImporting,
    importResult,

    // Ações de export
    exportData,
    exportSelected,
    exportFiltered,
    downloadTemplate,

    // Ações de import
    importFile,
    previewImport,

    // Configurações
    exportFields,
    importFields,

    // Reset
    clearImportResult: () => setImportResult(null)
  };
}