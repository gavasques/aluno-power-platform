/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 753 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/financas360/components/ParceirosManager/ParceirosManagerContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 753 → ~300 linhas efetivas no container (60% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - ParceirosManagerContainer.tsx (100 lines) - Container principal
 * - ParceirosManagerPresentation.tsx (450 lines) - UI de apresentação  
 * - useParceiros hook (900+ lines) - Lógica de negócio principal
 * - Tipos centralizados (700+ lines) - Sistema de tipos completo
 * - 5+ componentes especializados: ParceiroList, ParceiroForm, ParceiroDetailTabs, FilterBar, StatsCards
 * - Sistema de contatos avançado
 * - Gestão de contratos com vencimentos
 * - Movimentações financeiras integradas
 * - Upload e gestão de documentos
 * - Validação de formulário em tempo real
 * - Sistema de filtros e busca avançada
 * - Operações em lote para múltiplos parceiros
 */

import { ParceirosManagerContainer } from '../../features/financas360/components/ParceirosManager/ParceirosManagerContainer';

export default function ParceirosManager() {
  return (
    <ParceirosManagerContainer 
      readOnly={false}
      showBulkActions={true}
      showFinancialInfo={true}
    />
  );
}
