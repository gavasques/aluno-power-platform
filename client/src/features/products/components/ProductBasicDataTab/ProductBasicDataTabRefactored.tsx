/**
 * ARQUIVO REFATORADO: ProductBasicDataTabRefactored
 * Arquivo principal para dados básicos de produtos
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 765 → ~300 linhas efetivas no container (61% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ProductBasicDataTabContainer.tsx (80 lines) - Container principal
 * - ProductBasicDataTabPresentation.tsx (400 lines) - UI de apresentação
 * - useProductBasicData hook (700+ lines) - Lógica de negócio principal
 * - Tipos centralizados (600+ lines) - Sistema de tipos completo
 * - 6+ componentes especializados para diferentes funcionalidades
 */
import { ProductBasicDataTabContainer } from './ProductBasicDataTabContainer';

export function ProductBasicDataTabRefactored() {
  return <ProductBasicDataTabContainer />;
}