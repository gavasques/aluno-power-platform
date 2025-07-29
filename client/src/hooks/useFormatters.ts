/**
 * Hook centralizado para formatação de dados
 * Elimina duplicação das funções de formatação nos managers
 */

import { formatters } from '@/lib/utils/formatters';

export function useFormatters() {
  return {
    // Formatações monetárias
    currency: formatters.currency,
    
    // Formatações de data
    date: (dateString: string | null | undefined): string => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR');
    },

    // Formatações de documentos
    cnpj: (cnpj: string | null | undefined): string => {
      if (!cnpj) return '-';
      const cleaned = cnpj.replace(/\D/g, '');
      if (cleaned.length !== 14) return cnpj;
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    },

    cpf: (cpf: string | null | undefined): string => {
      if (!cpf) return '-';
      const cleaned = cpf.replace(/\D/g, '');
      if (cleaned.length !== 11) return cpf;
      return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    },

    cep: (cep: string | null | undefined): string => {
      if (!cep) return '-';
      const cleaned = cep.replace(/\D/g, '');
      if (cleaned.length !== 8) return cep;
      return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    },

    // Formatações de telefone
    phone: (phone: string | null | undefined): string => {
      if (!phone) return '-';
      const cleaned = phone.replace(/\D/g, '');
      
      if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
      } else if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      }
      
      return phone;
    },

    // Formatações de status
    status: (status: string, statusConfig?: Record<string, { label: string; color: string }>): {
      label: string;
      color: string;
    } => {
      const defaultConfig = {
        ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
        inativo: { label: 'Inativo', color: 'bg-red-100 text-red-800' },
        pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        pago: { label: 'Pago', color: 'bg-green-100 text-green-800' },
        cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
        vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800' }
      };

      const config = statusConfig || defaultConfig;
      return config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    },

    // Formatações de tipo
    tipo: (tipo: string, tipoConfig?: Record<string, string>): string => {
      const defaultConfig = {
        vendas: 'Vendas',
        compras: 'Compras',
        servicos: 'Serviços',
        receita: 'Receita',
        despesa: 'Despesa',
        entrada: 'Entrada',
        saida: 'Saída'
      };

      const config = tipoConfig || defaultConfig;
      return config[tipo] || tipo;
    },

    // Formatação de percentual
    percentage: formatters.percentage,

    // Formatação de números
    number: formatters.number,

    // Formatação de boolean para string
    boolean: (value: boolean | null | undefined, trueLabel = 'Sim', falseLabel = 'Não'): string => {
      if (value === null || value === undefined) return '-';
      return value ? trueLabel : falseLabel;
    },

    // Truncar texto
    truncate: (text: string | null | undefined, maxLength = 50): string => {
      if (!text) return '-';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  };
}