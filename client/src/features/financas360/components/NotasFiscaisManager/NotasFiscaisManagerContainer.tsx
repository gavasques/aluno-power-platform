/**
 * CONTAINER: NotasFiscaisManagerContainer
 * Lógica de negócio para gerenciamento de notas fiscais
 * Extraído de NotasFiscaisManager.tsx para modularização
 */
import { useNotasFiscais } from '../../hooks/useNotasFiscais';
import { NotasFiscaisManagerPresentation } from './NotasFiscaisManagerPresentation';
import { NotasFiscaisManagerContainerProps } from '../../types';

export const NotasFiscaisManagerContainer = ({
  initialFilter,
  readOnly = false,
  showImportExport = true,
  allowBulkOperations = true,
  onNotaSelect
}: NotasFiscaisManagerContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const notasFiscais = useNotasFiscais();

  // ===== SIDE EFFECTS =====
  // Apply initial filters if provided
  if (initialFilter) {
    if (initialFilter.status) {
      notasFiscais.actions.filterByStatus(initialFilter.status);
    }
    if (initialFilter.tipo) {
      notasFiscais.actions.filterByTipo(initialFilter.tipo);
    }
    if (initialFilter.fornecedorId) {
      notasFiscais.actions.filterByFornecedor(initialFilter.fornecedorId);
    }
  }

  // Handle external selection callback
  if (onNotaSelect && notasFiscais.state.selectedNota) {
    onNotaSelect(notasFiscais.state.selectedNota);
  }

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: notasFiscais.state,
    notas: notasFiscais.notas,
    fornecedores: notasFiscais.fornecedores,
    produtos: notasFiscais.produtos,
    actions: notasFiscais.actions,
    calculations: notasFiscais.calculations,
    readOnly,
    showImportExport,
    allowBulkOperations
  };

  return <NotasFiscaisManagerPresentation {...containerProps} />;
};