// Componentes reutilizáveis de Minha Área
export { PageHeader } from './PageHeader';
export { SearchFilter } from './SearchFilter';
export { EmptyState } from './EmptyState';
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';
export { DevelopmentBadge } from './DevelopmentBadge';

// Re-export hooks relacionados
export { useCrudMutations } from '@/hooks/useCrudMutations';
export { useAuthFetch } from '@/hooks/useAuthFetch';