/**
 * Hook específico para gerenciar Lançamentos
 */

import { useFinancasResource } from '../useFinancasResource';
import { Lancamento, LancamentoFormData } from '@/types/financas360';

const initialLancamentoFormData: LancamentoFormData = {
  empresaId: 0,
  tipo: 'receita',
  descricao: '',
  valor: 0,
  dataVencimento: '',
  dataPagamento: '',
  status: 'pendente',
  categoria: '',
  observacoes: ''
};

function mapLancamentoToForm(lancamento: Lancamento): LancamentoFormData {
  return {
    empresaId: lancamento.empresa.id,
    tipo: lancamento.tipo,
    descricao: lancamento.descricao,
    valor: lancamento.valor,
    dataVencimento: lancamento.dataVencimento.split('T')[0],
    dataPagamento: lancamento.dataPagamento ? lancamento.dataPagamento.split('T')[0] : '',
    status: lancamento.status,
    categoria: lancamento.categoria || '',
    observacoes: lancamento.observacoes || ''
  };
}

export function useLancamentosManager() {
  return useFinancasResource<Lancamento, LancamentoFormData>({
    resource: 'lancamentos',
    initialFormData: initialLancamentoFormData,
    mapEntityToForm: mapLancamentoToForm,
    customMessages: {
      create: 'Lançamento criado com sucesso!',
      update: 'Lançamento atualizado com sucesso!',
      delete: 'Lançamento excluído com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir este lançamento?',
      loading: 'Carregando lançamentos...'
    }
  });
}