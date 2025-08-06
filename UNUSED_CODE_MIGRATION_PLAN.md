# Plano de Migração para Eliminar Código Não Utilizado

## Status: Implementação dos Novos Hooks Unificados

### Análise Realizada

Identifiquei que temos hooks antigos que podem ser substituídos pelos novos hooks unificados:

**Hooks Antigos (Para Substituição):**
- `useManagerState.ts` - Substituído por `useEntityCRUD`
- `useModalState.ts` - Funcionalidade integrada no `useEntityCRUD`
- `useLoadingState.ts` - Substituído por `UnifiedLoadingState`

**Componentes que Usam Hooks Antigos:**
- `client/src/components/ui/modals/FormModal.tsx`
- `client/src/components/common/LoadingStates.tsx`
- `client/src/components/financas360/common/BaseManager.tsx`

## Estratégia de Migração

### Fase 1: Migrar FormModal para DynamicForm
### Fase 2: Substituir useManagerState por useEntityCRUD
### Fase 3: Consolidar Loading States
### Fase 4: Remover Código Obsoleto