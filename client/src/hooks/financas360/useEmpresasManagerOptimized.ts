/**
 * Hook otimizado para gerenciamento de empresas
 * Versão com cache inteligente e otimizações de performance
 */

import { useOptimizedResource } from '../useOptimizedResource';
import { useFormatters } from '../useFormatters';
import { EmpresaEntity, EmpresaFormData } from '@/types/financas360';

export function useEmpresasManagerOptimized() {
  const { formatCNPJ, formatPhone, formatCEP } = useFormatters();

  return useOptimizedResource<EmpresaEntity, EmpresaFormData>({
    resource: 'empresas',
    initialFormData: {
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      ativo: true
    },
    mapEntityToForm: (entity) => ({
      id: entity.id,
      razao_social: entity.razao_social || '',
      nome_fantasia: entity.nome_fantasia || '',
      cnpj: entity.cnpj || '',
      email: entity.email || '',
      telefone: entity.telefone || '',
      endereco: entity.endereco || '',
      cidade: entity.cidade || '',
      estado: entity.estado || '',
      cep: entity.cep || '',
      ativo: entity.ativo ?? true
    }),
    
    // Configurações de cache otimizadas para empresas
    cacheStrategy: {
      staleTime: 10 * 60 * 1000, // 10 minutos (empresas mudam pouco)
      cacheTime: 30 * 60 * 1000, // 30 minutos no cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2
    },

    // Otimistic updates habilitadas
    optimisticUpdates: {
      enabled: true,
      onMutate: (variables: EmpresaFormData) => ({
        id: Date.now(),
        razao_social: variables.razao_social,
        nome_fantasia: variables.nome_fantasia,
        cnpj: formatCNPJ(variables.cnpj),
        email: variables.email,
        telefone: formatPhone(variables.telefone),
        endereco: variables.endereco,
        cidade: variables.cidade,
        estado: variables.estado,
        cep: formatCEP(variables.cep),
        ativo: variables.ativo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true
      }),
      onError: (error, variables, context) => {
        console.error('Erro no optimistic update de empresa:', error);
      }
    },

    // Prefetch recursos relacionados
    prefetchRelated: ['canais', 'usuarios'], // Carregar canais e usuários em background

    // Mensagens customizadas
    customMessages: {
      create: 'Empresa criada com sucesso!',
      update: 'Empresa atualizada com sucesso!',
      delete: 'Empresa excluída com sucesso!',
      deleteConfirm: 'Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.',
      loading: 'Carregando empresas...'
    }
  });
}

// Hook para empresas com filtros avançados
export function useEmpresasWithAdvancedFilters() {
  const empresasManager = useEmpresasManagerOptimized();

  // Filtros específicos para empresas
  const advancedFilters = [
    {
      type: 'multiSelect' as const,
      key: 'estado',
      label: 'Estado',
      options: [
        { value: 'SP', label: 'São Paulo' },
        { value: 'RJ', label: 'Rio de Janeiro' },
        { value: 'MG', label: 'Minas Gerais' },
        { value: 'RS', label: 'Rio Grande do Sul' },
        { value: 'PR', label: 'Paraná' }
      ],
      selectedValues: []
    },
    {
      type: 'boolean' as const,
      key: 'ativo',
      label: 'Status',
      value: null
    },
    {
      type: 'dateRange' as const,
      key: 'created_at',
      label: 'Data de Criação'
    }
  ];

  return {
    ...empresasManager,
    advancedFilters
  };
}