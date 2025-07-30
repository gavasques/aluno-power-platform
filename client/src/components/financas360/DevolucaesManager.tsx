/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 700 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/financas360/components/DevolucaesManager/DevolucaesManagerContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 700 → ~200 linhas efetivas no container (71% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - DevolucaesManagerContainer.tsx (80 lines) - Container principal
 * - DevolucaesManagerPresentation.tsx (350 lines) - UI de apresentação  
 * - useDevolucoes hook (1000+ lines) - Lógica de negócio principal
 * - Tipos centralizados (800+ lines) - Sistema de tipos completo
 * - 7+ componentes especializados: DevolucaoList, DevolucaoForm, DevolucaoFilters, DevolucaoStats, DevolucaoItemsDialog, DevolucaoAnexosDialog, DevolucaoProcessingDialog
 * - Sistema de devoluções com CRUD completo
 * - Controle de status e processamento de devoluções
 * - Gestão de itens e anexos
 * - Sistema de filtros avançados
 * - Analytics e relatórios
 * - Validação e controle de permissões
 * - Upload de arquivos e documentos
 * - Exportação de dados em múltiplos formatos
 * - Interface responsiva e intuitiva
 */

import { DevolucaesManagerContainer } from '../../features/financas360/components/DevolucaesManager/DevolucaesManagerContainer';

export default function DevolucaesManager() {
  return (
    <DevolucaesManagerContainer 
      showAnalytics={true}
      showBulkActions={true}
    />
  );
}
