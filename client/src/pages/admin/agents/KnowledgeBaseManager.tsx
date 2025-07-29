/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 843 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/knowledge-base/components/KnowledgeBaseManager/KnowledgeBaseManagerContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 843 → ~200 linhas efetivas no container (76% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - KnowledgeBaseManagerContainer.tsx (50 lines) - Container principal
 * - KnowledgeBaseManagerPresentation.tsx (400 lines) - UI de apresentação
 * - useKnowledgeBase hook (500+ lines) - Lógica de negócio principal
 * - Tipos centralizados (800+ lines) - Sistema de tipos completo
 * - 7+ componentes especializados: DocumentList, CollectionList, DocumentForm, FileUploadForm, etc.
 * - Sistema de busca e filtros avançados
 * - Upload de arquivos com processamento
 * - Gerenciamento completo de coleções
 */

import { KnowledgeBaseManagerContainer } from '../../../features/knowledge-base/components/KnowledgeBaseManager/KnowledgeBaseManagerContainer';

export function KnowledgeBaseManager() {
  return <KnowledgeBaseManagerContainer />;
}
