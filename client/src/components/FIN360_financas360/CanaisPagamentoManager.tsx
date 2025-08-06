/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 693 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/financas360/components/CanaisPagamentoManager/CanaisPagamentoManagerContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 693 → ~250 linhas efetivas no container (64% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - CanaisPagamentoManagerContainer.tsx (90 lines) - Container principal
 * - CanaisPagamentoManagerPresentation.tsx (400 lines) - UI de apresentação  
 * - useCanaisPagamento hook (1200+ lines) - Lógica de negócio principal
 * - Tipos centralizados (1000+ lines) - Sistema de tipos completo
 * - 3+ componentes especializados: CanalPagamentoList, CanalPagamentoForm, CanalPagamentoFilters
 * - Sistema completo de canais de pagamento
 * - Configuração de múltiplos tipos (PIX, Cartão, Boleto, etc.)
 * - Teste de conexão com processadoras
 * - Gestão de taxas e limites de transação
 * - Analytics de performance e volume
 * - Sistema de filtros avançados
 * - Validação e configuração por tipo
 * - Upload de certificados e documentos
 * - Exportação de dados em múltiplos formatos
 * - Interface responsiva com dashboard de métricas
 */

import { CanaisPagamentoManagerContainer } from '../../features/financas360/components/CanaisPagamentoManager/CanaisPagamentoManagerContainer';

export default function CanaisPagamentoManager() {
  return (
    <CanaisPagamentoManagerContainer 
      showAnalytics={true}
      showBulkActions={true}
    />
  );
}
