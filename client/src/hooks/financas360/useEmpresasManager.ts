/**
 * Hook específico para gerenciar Empresas
 */

import { useFinancasResource } from '../useFinancasResource';
import { Empresa, EmpresaFormData } from '@/types/financas360';

const initialEmpresaFormData: EmpresaFormData = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  endereco: {
    cep: '',
    logradouro: '',
    cidade: '',
    estado: ''
  },
  telefone: '',
  email: ''
};

function mapEmpresaToForm(empresa: Empresa): EmpresaFormData {
  return {
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia || '',
    cnpj: empresa.cnpj,
    inscricaoEstadual: empresa.inscricaoEstadual || '',
    inscricaoMunicipal: empresa.inscricaoMunicipal || '',
    endereco: empresa.endereco,
    telefone: empresa.telefone || '',
    email: empresa.email || ''
  };
}

export function useEmpresasManager() {
  return useFinancasResource<Empresa, EmpresaFormData>({
    resource: 'empresas',
    initialFormData: initialEmpresaFormData,
    mapEntityToForm: mapEmpresaToForm,
    customMessages: {
      create: 'Empresa criada com sucesso!',
      update: 'Empresa atualizada com sucesso!',
      delete: 'Empresa excluída com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir esta empresa?',
      loading: 'Carregando empresas...'
    }
  });
}