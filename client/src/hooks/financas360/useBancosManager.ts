/**
 * Hook específico para gerenciar Bancos
 */

import { useFinancasResource } from '../useFinancasResource';
import { Banco, BancoFormData } from '@/types/financas360';

const initialBancoFormData: BancoFormData = {
  codigo: '',
  nome: '',
  nomeCompleto: '',
  ativo: true
};

function mapBancoToForm(banco: Banco): BancoFormData {
  return {
    codigo: banco.codigo,
    nome: banco.nome,
    nomeCompleto: banco.nomeCompleto,
    ativo: banco.ativo
  };
}

export function useBancosManager() {
  return useFinancasResource<Banco, BancoFormData>({
    resource: 'bancos',
    initialFormData: initialBancoFormData,
    mapEntityToForm: mapBancoToForm,
    customMessages: {
      create: 'Banco criado com sucesso!',
      update: 'Banco atualizado com sucesso!',
      delete: 'Banco excluído com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir este banco?',
      loading: 'Carregando bancos...'
    }
  });
}