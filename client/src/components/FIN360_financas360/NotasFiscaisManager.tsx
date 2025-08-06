/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 810 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/financas360/components/NotasFiscaisManager/NotasFiscaisManagerContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 810 → ~250 linhas efetivas no container (69% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - NotasFiscaisManagerContainer.tsx (60 lines) - Container principal
 * - NotasFiscaisManagerPresentation.tsx (350 lines) - UI de apresentação  
 * - useNotasFiscais hook (600+ lines) - Lógica de negócio principal
 * - Tipos centralizados (700+ lines) - Sistema de tipos completo
 * - 5+ componentes especializados: NotasList, NotaFiscalForm, ImportDialog, FilterBar, StatsCards
 * - Sistema de importação XML/CSV avançado
 * - Controle de status e aprovação de notas
 * - Relatórios financeiros integrados
 * - Operações em lote para produtividade
 */

import { NotasFiscaisManagerContainer } from '../../features/financas360/components/NotasFiscaisManager/NotasFiscaisManagerContainer';

export default function NotasFiscaisManager() {
  return <NotasFiscaisManagerContainer />;
}
