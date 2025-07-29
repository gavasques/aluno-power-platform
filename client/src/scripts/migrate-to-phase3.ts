/**
 * Script de migração automática para Phase 3
 * Converte managers existentes para usar as novas funcionalidades
 */

import fs from 'fs';
import path from 'path';

interface MigrationConfig {
  sourcePath: string;
  targetPath: string;
  resourceName: string;
  entityName: string;
  formDataName: string;
  hasAdvancedFilters?: boolean;
  hasBulkActions?: boolean;
  hasExportImport?: boolean;
  useOptimizedCache?: boolean;
}

class Phase3Migrator {
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  // Migrar manager existente para Phase 3
  async migrate(): Promise<void> {
    console.log(`🚀 Iniciando migração de ${this.config.resourceName}...`);

    try {
      // 1. Criar hook otimizado
      await this.createOptimizedHook();
      
      // 2. Criar componente Phase 3
      await this.createPhase3Component();
      
      // 3. Gerar arquivos de apoio
      await this.createMigrationReport();

      console.log(`✅ Migração de ${this.config.resourceName} concluída!`);
    } catch (error) {
      console.error(`❌ Erro na migração:`, error);
      throw error;
    }
  }

  // Criar hook otimizado
  private async createOptimizedHook(): Promise<void> {
    const hookTemplate = this.generateOptimizedHookTemplate();
    const hookPath = path.join(
      'src/hooks/financas360',
      `use${this.config.resourceName}ManagerOptimized.ts`
    );

    await this.writeFile(hookPath, hookTemplate);
    console.log(`📝 Hook otimizado criado: ${hookPath}`);
  }

  // Criar componente Phase 3
  private async createPhase3Component(): Promise<void> {
    const componentTemplate = this.generateComponentTemplate();
    const componentPath = path.join(
      'src/components/financas360',
      `${this.config.resourceName}ManagerPhase3.tsx`
    );

    await this.writeFile(componentPath, componentTemplate);
    console.log(`🎨 Componente Phase 3 criado: ${componentPath}`);
  }

  // Gerar template do hook otimizado
  private generateOptimizedHookTemplate(): string {
    const resourceLower = this.config.resourceName.toLowerCase();
    const entityType = this.config.entityName;
    const formDataType = this.config.formDataName;

    return `/**
 * Hook otimizado para gerenciamento de ${resourceLower}
 * Versão com cache inteligente e otimizações de performance
 */

import { useOptimizedResource } from '../useOptimizedResource';
import { useFormatters } from '../useFormatters';
import { ${entityType}, ${formDataType} } from '@/types/financas360';

export function use${this.config.resourceName}ManagerOptimized() {
  const { formatCNPJ, formatPhone, formatCEP, formatCurrency } = useFormatters();

  return useOptimizedResource<${entityType}, ${formDataType}>({
    resource: '${resourceLower}',
    initialFormData: {
      // TODO: Definir campos iniciais baseados no tipo ${formDataType}
      nome: '',
      ativo: true
    },
    mapEntityToForm: (entity) => ({
      // TODO: Mapear campos da entidade para o formulário
      id: entity.id,
      nome: entity.nome || '',
      ativo: entity.ativo ?? true
    }),
    
    // Configurações de cache otimizadas
    cacheStrategy: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 15 * 60 * 1000, // 15 minutos no cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2
    },

    // Otimistic updates habilitadas
    optimisticUpdates: {
      enabled: true,
      onMutate: (variables: ${formDataType}) => ({
        id: Date.now(),
        ...variables,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true
      }),
      onError: (error, variables, context) => {
        console.error('Erro no optimistic update de ${resourceLower}:', error);
      }
    },

    // Prefetch recursos relacionados
    prefetchRelated: [], // TODO: Definir recursos relacionados

    // Mensagens customizadas
    customMessages: {
      create: '${this.config.resourceName} criado com sucesso!',
      update: '${this.config.resourceName} atualizado com sucesso!',
      delete: '${this.config.resourceName} excluído com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir este ${resourceLower}?',
      loading: 'Carregando ${resourceLower}s...'
    }
  });
}

// Hook com filtros avançados
export function use${this.config.resourceName}WithAdvancedFilters() {
  const manager = use${this.config.resourceName}ManagerOptimized();

  // TODO: Definir filtros específicos para ${resourceLower}
  const advancedFilters = [
    {
      type: 'boolean' as const,
      key: 'ativo',
      label: 'Status',
      value: null
    },
    {
      type: 'dateRange' as const,
      key: 'created_at',
      label: 'Data de Criação'
    }
    // TODO: Adicionar mais filtros conforme necessário
  ];

  return {
    ...manager,
    advancedFilters
  };
}`;
  }

  // Gerar template do componente
  private generateComponentTemplate(): string {
    const resourceName = this.config.resourceName;
    const resourceLower = resourceName.toLowerCase();
    const entityType = this.config.entityName;

    return `/**
 * ${resourceName} Manager com todas as funcionalidades da Fase 3
 * - Cache inteligente e otimizações
 * - Validação aprimorada
 * - Paginação automática
 * - Bulk actions
 * - Filtros avançados  
 * - Export/Import
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Hooks Phase 3
import { use${resourceName}WithAdvancedFilters } from '@/hooks/financas360/use${resourceName}ManagerOptimized';
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useExportImport } from '@/hooks/useExportImport';
import { useFormValidation } from '@/hooks/useFormValidation';

// Components Phase 3
import { ManagerLayout } from '@/components/ui/manager/ManagerLayout';
import { BulkActionsBar, SelectableItemWrapper } from '@/components/ui/manager/BulkActionsBar';
import { AdvancedFilters, AdvancedFilter } from '@/components/ui/manager/AdvancedFilters';
import { ExportImportDialog } from '@/components/ui/manager/ExportImportDialog';
import { Pagination } from '@/components/ui/manager/Pagination';
import { FormDialog } from '@/components/ui/manager/FormDialog';
import { FilterBar } from '@/components/ui/manager/FilterBar';

import { Search, Plus, Settings, Download } from 'lucide-react';
import { ${entityType} } from '@/types/financas360';

export function ${resourceName}ManagerPhase3() {
  // Manager principal com cache otimizado
  const manager = use${resourceName}WithAdvancedFilters();

  // Paginação
  const pagination = usePaginatedResource({
    resource: '${resourceLower}',
    pageSize: 20,
    enabled: !!manager.items
  });

  // Bulk actions
  const bulkActions = useBulkActions({
    items: manager.filteredItems,
    onDelete: async (ids) => {
      for (const id of ids) {
        await manager.deleteMutation.mutateAsync(id);
      }
    },
    onActivate: async (ids) => {
      for (const id of ids) {
        await manager.updateMutation.mutateAsync({
          id,
          data: { ativo: true }
        });
      }
    }
  });

  // Export/Import
  const exportImport = useExportImport({
    resource: '${resourceLower}',
    exportFields: [
      // TODO: Definir campos de export
      { key: 'nome', label: 'Nome', type: 'string' },
      { key: 'ativo', label: 'Ativo', type: 'boolean' }
    ],
    importFields: [
      // TODO: Definir campos de import
      { key: 'nome', label: 'Nome', required: true, type: 'string' },
      { key: 'ativo', label: 'Ativo', type: 'boolean' }
    ]
  });

  // Estados locais
  const [showExportImport, setShowExportImport] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>(
    manager.advancedFilters || []
  );

  // Dados paginados
  const paginatedItems = pagination.data?.data || manager.filteredItems;
  const totalPages = pagination.data?.totalPages || 1;
  const currentPage = pagination.currentPage;

  // Renderizar item
  const renderItem = (item: ${entityType}) => (
    <SelectableItemWrapper
      key={item.id}
      isSelected={bulkActions.selectedItems.includes(item.id)}
      onToggle={() => bulkActions.toggleItem(item.id)}
      isSelectionMode={bulkActions.selectedItems.length > 0}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {/* TODO: Exibir título do item */}
              {item.nome || 'Item'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => manager.startEdit(item)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Personalizar conteúdo do card */}
          <div className="space-y-2 text-sm">
            <div>ID: {item.id}</div>
            <span className={\`
              px-2 py-1 rounded-full text-xs font-medium
              \${item.ativo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            \`}>
              {item.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </CardContent>
      </Card>
    </SelectableItemWrapper>  
  );

  // TODO: Definir campos do formulário
  const formFields = [
    {
      name: 'nome',
      label: 'Nome',
      type: 'text' as const,
      required: true
    },
    {
      name: 'ativo',
      label: 'Ativo',
      type: 'checkbox' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">${resourceName} (Phase 3)</h1>
          {manager.debugInfo && (
            <p className="text-sm text-gray-600">
              Cache: {manager.debugInfo.cacheStatus.itemsCount} items
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportImport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export/Import
          </Button>
          <Button onClick={manager.openDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo ${resourceName}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <FilterBar
            searchValue={manager.filters.search}
            onSearchChange={manager.updateFilters}
            placeholder="Buscar ${resourceLower}s..."
            showActiveFilter={true}
            activeFilter={manager.filters.ativo}
            onActiveFilterChange={(ativo) => manager.updateFilters({ ativo })}
          />
        </div>
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters(manager.advancedFilters || [])}
        />
      </div>

      {/* Manager Layout */}
      <ManagerLayout
        isLoading={manager.isLoading}
        error={manager.error}
        items={paginatedItems}
        totalCount={manager.filteredItems.length}
        emptyMessage="Nenhum ${resourceLower} encontrado"
        onRetry={manager.handleRetry}
        renderItem={renderItem}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={pagination.setCurrentPage}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.setPageSize}
        totalItems={manager.filteredItems.length}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        isVisible={bulkActions.selectedItems.length > 0}
        selectedCount={bulkActions.selectedItems.length}
        totalCount={manager.filteredItems.length}
        isAllSelected={bulkActions.isAllSelected}
        isPartialSelected={bulkActions.isPartialSelected}
        onToggleAll={bulkActions.toggleAll}
        onClearSelection={bulkActions.clearSelection}
        onExecuteAction={bulkActions.executeAction}
        isExecuting={bulkActions.isExecuting}
      />

      {/* Form Dialog */}
      <FormDialog
        isOpen={manager.isDialogOpen}
        onOpenChange={manager.setIsDialogOpen}
        title={manager.editingItem ? 'Editar ${resourceName}' : 'Novo ${resourceName}'}
        fields={formFields}
        formData={manager.formData}
        onFormDataChange={manager.updateFormData}
        onSubmit={manager.handleSubmit}
        onCancel={manager.closeDialog}
        isSubmitting={manager.isSubmitting}
      />

      {/* Export/Import Dialog */}
      <ExportImportDialog
        isOpen={showExportImport}
        onOpenChange={setShowExportImport}
        onExport={exportImport.exportData}
        onImport={exportImport.importFile}
        onDownloadTemplate={exportImport.downloadTemplate}
        onPreviewImport={exportImport.previewImport}
        isExporting={exportImport.isExporting}
        isImporting={exportImport.isImporting}
        importResult={exportImport.importResult}
        exportFields={exportImport.exportFields}
        importFields={exportImport.importFields}
        selectedCount={bulkActions.selectedItems.length}
        totalCount={manager.filteredItems.length}
      />
    </div>
  );
}`;
  }

  // Criar relatório de migração
  private async createMigrationReport(): Promise<void> {
    const report = this.generateMigrationReport();
    const reportPath = `migration-report-${this.config.resourceName.toLowerCase()}.md`;
    
    await this.writeFile(reportPath, report);
    console.log(`📊 Relatório de migração criado: ${reportPath}`);
  }

  // Gerar relatório de migração
  private generateMigrationReport(): string {
    return `# Relatório de Migração - ${this.config.resourceName}

## ✅ Arquivos Criados

- \`src/hooks/financas360/use${this.config.resourceName}ManagerOptimized.ts\` - Hook otimizado
- \`src/components/financas360/${this.config.resourceName}ManagerPhase3.tsx\` - Componente Phase 3

## 📋 Tarefas Pendentes (TODO)

### Hook Otimizado:
- [ ] Definir campos iniciais no \`initialFormData\`
- [ ] Implementar \`mapEntityToForm\` com campos corretos
- [ ] Configurar recursos relacionados no \`prefetchRelated\`
- [ ] Adicionar filtros avançados específicos

### Componente:
- [ ] Personalizar renderização do card/item
- [ ] Definir campos do formulário
- [ ] Configurar campos de export/import
- [ ] Adicionar validações específicas
- [ ] Testar todas as funcionalidades

### Testes:
- [ ] Testar cache inteligente
- [ ] Testar paginação
- [ ] Testar bulk actions
- [ ] Testar filtros avançados
- [ ] Testar export/import
- [ ] Testar formulário com validação

## 🚀 Features Disponíveis

### ✨ Cache Inteligente
- Cache configurável (5min stale, 15min cache)
- Optimistic updates habilitados
- Prefetch de recursos relacionados
- Debug info em desenvolvimento

### 📄 Paginação
- Paginação automática (20 items por página)
- Navegação por páginas
- Seletor de tamanho da página
- Mantém estado durante filtros

### 🔄 Bulk Actions
- Seleção múltipla de items
- Ações em lote (deletar, ativar, exportar)
- Confirmação para ações destrutivas
- Indicadores visuais

### 🔍 Filtros Avançados
- Filtro de texto/busca
- Filtros booleanos (ativo/inativo)
- Filtros de data (range)
- Badges dos filtros ativos

### 📊 Export/Import
- Export em múltiplos formatos (XLSX, CSV, JSON, PDF)
- Import com validação
- Templates de importação
- Preview dos dados

### ✅ Validação
- Validação em tempo real
- Mensagens de erro personalizadas
- Validação de CNPJ/CPF (se aplicável)
- Estados de touch

## 📖 Como Usar

1. Importe o componente Phase 3:
\`\`\`tsx
import { ${this.config.resourceName}ManagerPhase3 } from '@/components/financas360/${this.config.resourceName}ManagerPhase3';
\`\`\`

2. Use no seu roteamento:
\`\`\`tsx
<Route path="/${this.config.resourceName.toLowerCase()}" element={<${this.config.resourceName}ManagerPhase3 />} />
\`\`\`

3. Complete as tarefas TODO marcadas acima

## 🔧 Configurações Avançadas

### Cache Strategy:
\`\`\`ts
cacheStrategy: {
  staleTime: 5 * 60 * 1000, // Dados ficam "frescos" por 5min
  cacheTime: 15 * 60 * 1000, // Permanecem no cache por 15min
  refetchOnWindowFocus: false, // Não refetch ao focar janela
  refetchOnReconnect: true, // Refetch ao reconectar
  retry: 2 // Tentar 2x em caso de erro
}
\`\`\`

### Optimistic Updates:
\`\`\`ts
optimisticUpdates: {
  enabled: true, // Habilitado por padrão
  onMutate: (variables) => ({
    // Criar objeto temporário
    id: Date.now(),
    ...variables,
    isOptimistic: true
  })
}
\`\`\`

---

*Migração gerada em: ${new Date().toISOString()}*
`;
  }

  // Utility para escrever arquivo
  private async writeFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('❌ Uso: npm run migrate <resourceName> <entityName> <formDataName>');
    console.log('📝 Exemplo: npm run migrate Canais CanalEntity CanalFormData');
    process.exit(1);
  }

  const [resourceName, entityName, formDataName] = args;

  const config: MigrationConfig = {
    sourcePath: `src/components/myarea/financas360/${resourceName}Manager.tsx`,
    targetPath: `src/components/financas360/${resourceName}ManagerPhase3.tsx`,
    resourceName,
    entityName,
    formDataName,
    hasAdvancedFilters: true,
    hasBulkActions: true,
    hasExportImport: true,
    useOptimizedCache: true
  };

  const migrator = new Phase3Migrator(config);
  await migrator.migrate();

  console.log('\\n🎉 Migração concluída!');
  console.log('📋 Próximos passos:');
  console.log('1. Complete as tarefas TODO nos arquivos gerados');
  console.log('2. Teste todas as funcionalidades');
  console.log('3. Atualize as rotas para usar o novo componente');
  console.log('4. Verifique o relatório de migração gerado');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { Phase3Migrator, MigrationConfig };`;