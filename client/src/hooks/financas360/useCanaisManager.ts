/**
 * Hook específico para gerenciar Canais
 */

import { useFinancasResource } from '../useFinancasResource';
import { Canal, CanalFormData } from '@/types/financas360';

const initialCanalFormData: CanalFormData = {
  nome: '',
  tipo: 'vendas',
  descricao: '',
  cor: '#3b82f6',
  icone: 'ShoppingCart'
};

function mapCanalToForm(canal: Canal): CanalFormData {
  return {
    nome: canal.nome,
    tipo: canal.tipo,
    descricao: canal.descricao || '',
    cor: canal.cor,
    icone: canal.icone
  };
}

export function useCanaisManager() {
  return useFinancasResource<Canal, CanalFormData>({
    resource: 'canais',
    initialFormData: initialCanalFormData,
    mapEntityToForm: mapCanalToForm,
    customMessages: {
      create: 'Canal criado com sucesso!',
      update: 'Canal atualizado com sucesso!',
      delete: 'Canal excluído com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir este canal?',
      loading: 'Carregando canais...'
    }
  });
}