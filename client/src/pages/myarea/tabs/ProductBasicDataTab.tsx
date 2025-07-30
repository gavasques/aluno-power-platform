/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 765 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/products/components/ProductBasicDataTab/ProductBasicDataTabContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 765 → ~300 linhas efetivas no container (61% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - ProductBasicDataTabContainer.tsx (80 lines) - Container principal
 * - ProductBasicDataTabPresentation.tsx (400 lines) - UI de apresentação  
 * - useProductBasicData hook (700+ lines) - Lógica de negócio principal
 * - Tipos centralizados (600+ lines) - Sistema de tipos completo
 * - 6+ componentes especializados: ProductBasicInfoForm, ProductAttributesForm, ProductImagesManager, ProductTagsInput, CategorySelector, BrandSelector
 * - Sistema de upload de imagens avançado
 * - Validação de formulário em tempo real
 * - Geração automática de SKU
 * - Integração com categorias e marcas
 * - Gestão de atributos dinâmicos por categoria
 */

import { ProductBasicDataTabContainer } from '../../features/products/components/ProductBasicDataTab/ProductBasicDataTabContainer';

// Mantém compatibilidade com props existentes
interface ProductBasicDataTabProps {
  form?: any;
  imageFile?: File | null;
  setImageFile?: (file: File | null) => void;
  calculatedCubicWeight?: number;
  isEditing?: boolean;
  productId?: string;
}

export default function ProductBasicDataTab({ 
  isEditing,
  productId,
  ...otherProps
}: ProductBasicDataTabProps) {
  return (
    <ProductBasicDataTabContainer 
      productId={productId ? parseInt(productId) : undefined}
      readOnly={false}
      showAdvancedFields={true}
      allowImageUpload={true}
      maxImages={10}
    />
  );
}
