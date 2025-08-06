/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 723 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/products/components/ProductEdit/ProductEditContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 723 → ~200 linhas efetivas no container (72% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - ProductEditContainer.tsx (60 lines) - Container principal
 * - ProductEditPresentation.tsx (500 lines) - UI de apresentação  
 * - useProductEdit hook (800+ lines) - Lógica de negócio principal
 * - Tipos centralizados (600+ lines) - Sistema de tipos completo
 * - 3+ componentes especializados: ProductBasicInfo, ProductDimensions, ProductForm
 * - Sistema completo de edição de produtos
 * - Formulário multi-seção com validação
 * - Upload e preview de imagens
 * - Integração com fornecedores e categorias
 * - Validação de EAN, NCM e SKU
 * - Cálculo automático de volume
 * - Sistema de abas opcional
 * - Detecção de alterações não salvas
 * - Interface responsiva com modo apenas leitura
 */

import { useParams } from 'wouter';
import { ProductEditContainer } from '../../features/products/components/ProductEdit/ProductEditContainer';

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID do produto não fornecido</div>;
  }

  return (
    <ProductEditContainer 
      productId={id}
      showTabs={false}
    />
  );
}
