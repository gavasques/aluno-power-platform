# Guia de Migração - Phase 3

Este guia explica como migrar seus managers existentes para usar todas as funcionalidades da Phase 3.

## 🚀 Recursos da Phase 3

### ✨ Cache Inteligente
- Cache configurável com stale/cache times
- Optimistic updates para melhor UX
- Prefetch de recursos relacionados
- Debug info para desenvolvimento

### 📄 Paginação Automática
- Paginação com React Query
- Navegação por páginas
- Seletor de tamanho da página
- keepPreviousData para transições suaves

### 🔄 Bulk Actions
- Seleção múltipla com checkboxes
- Ações em lote (deletar, ativar, exportar)
- Confirmação para ações destrutivas
- Barra de ações flutuante

### 🔍 Filtros Avançados
- Filtros de data com calendário
- Multi-select com contadores
- Range sliders para números
- Filtros booleanos
- Badges dos filtros ativos

### 📊 Export/Import
- Export em XLSX, CSV, JSON, PDF
- Import com validação e preview
- Templates de importação
- Relatório de erros/warnings

### ✅ Validação Aprimorada
- Validação CNPJ/CPF com algoritmos
- Estados de touch
- Mensagens de erro personalizadas
- Validação em tempo real

## 🛠️ Como Migrar

### 1. Migração Automática (Recomendado)

Use o script de migração automática:

```bash
# Para Canais
npm run migrate Canais CanalEntity CanalFormData

# Para Empresas  
npm run migrate Empresas EmpresaEntity EmpresaFormData

# Para Usuários
npm run migrate Usuarios UsuarioEntity UsuarioFormData
```

O script criará:
- `src/hooks/financas360/use[Resource]ManagerOptimized.ts`
- `src/components/financas360/[Resource]ManagerPhase3.tsx`
- `migration-report-[resource].md`

### 2. Migração Manual

Se preferir migrar manualmente, siga estes passos:

#### Passo 1: Criar Hook Otimizado

```typescript
// src/hooks/financas360/useCanaisManagerOptimized.ts
import { useOptimizedResource } from '../useOptimizedResource';
import { CanalEntity, CanalFormData } from '@/types/financas360';

export function useCanaisManagerOptimized() {
  return useOptimizedResource<CanalEntity, CanalFormData>({
    resource: 'canais',
    initialFormData: {
      nome: '',
      descricao: '',
      ativo: true
    },
    mapEntityToForm: (entity) => ({
      id: entity.id,
      nome: entity.nome || '',
      descricao: entity.descricao || '',
      ativo: entity.ativo ?? true
    }),
    cacheStrategy: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 15 * 60 * 1000, // 15 minutos
    },
    optimisticUpdates: { enabled: true }
  });
}
```

#### Passo 2: Criar Componente Phase 3

```typescript
// src/components/financas360/CanaisManagerPhase3.tsx
import React, { useState } from 'react';
import { useCanaisManagerOptimized } from '@/hooks/financas360/useCanaisManagerOptimized';
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useExportImport } from '@/hooks/useExportImport';

// Imports dos componentes...

export function CanaisManagerPhase3() {
  const manager = useCanaisManagerOptimized();
  const pagination = usePaginatedResource({ resource: 'canais' });
  const bulkActions = useBulkActions({ items: manager.filteredItems });
  const exportImport = useExportImport({ resource: 'canais' });

  // Implementação do componente...
}
```

#### Passo 3: Configurar Hooks Específicos

```typescript
// Paginação
const pagination = usePaginatedResource({
  resource: 'canais',
  pageSize: 20,
  enabled: !!manager.items
});

// Bulk Actions
const bulkActions = useBulkActions({
  items: manager.filteredItems,
  onDelete: async (ids) => {
    for (const id of ids) {
      await manager.deleteMutation.mutateAsync(id);
    }
  }
});

// Export/Import
const exportImport = useExportImport({
  resource: 'canais',
  exportFields: [
    { key: 'nome', label: 'Nome', type: 'string' },
    { key: 'ativo', label: 'Ativo', type: 'boolean' }
  ]
});
```

### 3. Tarefas Pós-Migração

Após usar o script ou migrar manualmente:

#### ✅ Completar TODOs
- [ ] Definir `initialFormData` com todos os campos
- [ ] Implementar `mapEntityToForm` corretamente
- [ ] Configurar `prefetchRelated` com recursos relacionados
- [ ] Definir filtros avançados específicos
- [ ] Personalizar renderização dos cards
- [ ] Configurar campos de export/import
- [ ] Adicionar validações específicas

#### ✅ Testar Funcionalidades
- [ ] Cache inteligente
- [ ] Paginação
- [ ] Bulk actions
- [ ] Filtros avançados
- [ ] Export/import
- [ ] Validação de formulários

#### ✅ Atualizar Rotas
```typescript
// Atualizar suas rotas para usar o componente Phase 3
<Route path="/canais" element={<CanaisManagerPhase3 />} />
```

## 🔧 Configurações Avançadas

### Cache Strategy

```typescript
cacheStrategy: {
  staleTime: 5 * 60 * 1000,      // Dados ficam frescos por 5min
  cacheTime: 15 * 60 * 1000,     // Ficam no cache por 15min
  refetchOnWindowFocus: false,    // Não refetch ao focar
  refetchOnReconnect: true,       // Refetch ao reconectar
  retry: 2                        // 2 tentativas em caso de erro
}
```

### Optimistic Updates

```typescript
optimisticUpdates: {
  enabled: true,
  onMutate: (variables) => ({
    id: Date.now(), // ID temporário
    ...variables,
    created_at: new Date().toISOString(),
    isOptimistic: true // Flag para identificar
  }),
  onError: (error, variables, context) => {
    // Log de erros
    console.error('Optimistic update failed:', error);
  }
}
```

### Filtros Avançados

```typescript
const advancedFilters = [
  {
    type: 'dateRange',
    key: 'created_at',
    label: 'Data de Criação'
  },
  {
    type: 'multiSelect',
    key: 'categoria',
    label: 'Categoria',
    options: [
      { value: 'A', label: 'Categoria A', count: 5 },
      { value: 'B', label: 'Categoria B', count: 10 }
    ],
    selectedValues: []
  },
  {
    type: 'range',
    key: 'preco',
    label: 'Preço',
    min: 0,
    max: 1000,
    currentMin: 0,
    currentMax: 1000,
    formatter: (value) => `R$ ${value}`
  }
];
```

## 📊 Monitoramento

### Debug Info (Development)

O hook otimizado fornece informações de debug:

```typescript
const manager = useCanaisManagerOptimized();

// Acessível via manager.debugInfo
{
  cacheStatus: {
    isStale: false,
    lastUpdated: '14:30:25',
    isFetching: false,
    itemsCount: 25,
    filteredCount: 8
  },
  performance: {
    prefetchedResources: 2,
    optimisticUpdatesEnabled: true,
    cacheSettings: {
      staleTime: '300s',
      cacheTime: '900s'
    }
  }
}
```

### Performance Metrics

```typescript
// Métricas de cache
manager.cacheMetrics = {
  isStale: false,
  lastFetch: new Date(),
  hitRate: 'cached' // ou 'fetched'
}
```

## 🆘 Troubleshooting

### Problema: Listings não carregam
**Solução**: Verificar se `enabled: !!token && !authLoading` no useQuery

### Problema: Cache não atualiza
**Solução**: Usar `invalidateCache()` após mutations

### Problema: Optimistic updates não funcionam
**Solução**: Verificar se `optimisticUpdates.enabled: true` e `onMutate` está configurado

### Problema: Paginação perdida ao filtrar
**Solução**: Usar `keepPreviousData` e resetar página ao filtrar

### Problema: Bulk actions lentas
**Solução**: Usar Promise.all para operações paralelas ao invés de loop sequencial

## 📚 Exemplos Completos

Veja os exemplos completos em:
- `src/components/financas360/EmpresasManagerPhase3.tsx`
- `src/hooks/financas360/useEmpresasManagerOptimized.ts`

## 🎯 Próximos Passos

1. **Migre um manager por vez** - Comece com o mais simples
2. **Teste extensivamente** - Todas as funcionalidades devem funcionar
3. **Documente customizações** - Registre configurações específicas
4. **Monitore performance** - Use as métricas de debug
5. **Colete feedback** - Dos usuários finais sobre as melhorias

---

*Este guia é parte da refatoração Phase 3 para eliminação de duplicação de código seguindo o princípio DRY.*