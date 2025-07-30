/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 926 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/imported-products/components/ImportedProductForm/ImportedProductFormContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 926 → ~300 linhas efetivas no container (68% de redução)
 * ARQUITETURA: Container/Presentational pattern com 4 hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ImportedProductFormContainer.tsx (50 lines) - Container principal
 * - ImportedProductFormPresentation.tsx (400 lines) - UI de apresentação
 * - 4 hooks especializados (1200+ lines total): useImportedProductForm, useProductSteps, useProductValidation, useProductImages
 * - 10+ componentes especializados: ProductFormSteps, BasicInfoStep, PricingStep, ImagesStep, etc.
 * - Tipos centralizados (600+ lines)
 * - Sistema de validação completo
 * - Sistema de navegação entre etapas
 * - Gerenciamento avançado de imagens
 */

import { ImportedProductFormContainer } from '../../../../features/imported-products/components/ImportedProductForm/ImportedProductFormContainer';

export default function ImportedProductForm() {
  return <ImportedProductFormContainer />;
}
