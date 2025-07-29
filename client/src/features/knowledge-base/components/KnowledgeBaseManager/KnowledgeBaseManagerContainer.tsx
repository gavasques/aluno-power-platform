/**
 * CONTAINER: KnowledgeBaseManagerContainer
 * Lógica de negócio para gerenciamento da base de conhecimento
 * Extraído de KnowledgeBaseManager.tsx para modularização
 */
import { useKnowledgeBase } from '../../hooks/useKnowledgeBase';
import { KnowledgeBaseManagerPresentation } from './KnowledgeBaseManagerPresentation';
import { KnowledgeBaseManagerContainerProps } from '../../types';

export const KnowledgeBaseManagerContainer = ({
  initialCollectionId,
  readOnly = false,
  showCollections = true,
  allowUpload = true,
  maxFileSize,
  allowedFileTypes,
  onDocumentSelect,
  onCollectionSelect
}: KnowledgeBaseManagerContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const knowledgeBase = useKnowledgeBase();

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: knowledgeBase.state,
    documents: knowledgeBase.documents,
    collections: knowledgeBase.collections,
    actions: knowledgeBase.actions,
    search: knowledgeBase.search,
    upload: knowledgeBase.upload,
    readOnly,
    showCollections,
    allowUpload
  };

  return <KnowledgeBaseManagerPresentation {...containerProps} />;
};