import { MesSimulacao, FaixaAliquota, ValidationResult, NovoMesForm } from './types';
import { ANEXO_I_FAIXAS, ANEXO_II_FAIXAS, VALIDATION_PATTERNS } from './constants';
import { formatters } from '@/lib/utils/formatters';

export const formatCurrency = formatters.currency;
export const formatPercentage = (value: number): string => {
  return formatters.percentage(value * 100, { precision: 2 });
};

export const buscarFaixaAnexo = (rbt12: number, anexo: 'Anexo I' | 'Anexo II'): FaixaAliquota => {
  const tabela = anexo === 'Anexo I' ? ANEXO_I_FAIXAS : ANEXO_II_FAIXAS;
  
  for (let i = tabela.length - 1; i >= 0; i--) {
    if (rbt12 >= tabela[i].apartir) {
      return tabela[i];
    }
  }
  
  return tabela[0];
};

export const calcularSomaUltimos12Meses = (meses: MesSimulacao[], indiceAtual: number): number => {
  if (indiceAtual < 11) {
    return meses.slice(0, indiceAtual + 1)
      .reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0);
  }
  
  const inicio = indiceAtual - 11;
  const fim = indiceAtual + 1;
  return meses.slice(inicio, fim)
    .reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0);
};

export const calcularMediaUltimos12Meses = (meses: MesSimulacao[], indiceAtual: number): number => {
  if (indiceAtual < 11) {
    const mesesDisponiveis = meses.slice(0, indiceAtual + 1);
    return mesesDisponiveis.reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0) / mesesDisponiveis.length;
  }
  
  const ultimos12Meses = meses.slice(indiceAtual - 11, indiceAtual + 1);
  return ultimos12Meses.reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0) / 12;
};

export const validarNovoMes = (novoMes: NovoMesForm): ValidationResult => {
  if (!novoMes.mesAno.match(VALIDATION_PATTERNS.MES_ANO)) {
    return {
      isValid: false,
      message: "Use o formato MM/AAAA para o mês/ano"
    };
  }

  if (novoMes.faturamentoSemST < 0 || novoMes.faturamentoComST < 0) {
    return {
      isValid: false,
      message: "Os valores de faturamento devem ser positivos"
    };
  }

  return { isValid: true };
};

export const exportarParaCSV = (meses: MesSimulacao[]): string => {
  const headers = [
    "Mês/Ano", "Fat. sem ST", "Fat. com ST", "Anexo", "Fat. Total", 
    "Acum. 12 meses", "RBT12", "Média 12 meses", "Disp. Média", "Disp. Anual",
    "Alíq. Efetiva", "% ICMS", "Valor sem ST", "Valor com ST", "Valor Total"
  ];

  const rows = meses.map(mes => [
    mes.mesAno,
    formatCurrency(mes.faturamentoSemST),
    formatCurrency(mes.faturamentoComST),
    mes.anexo,
    formatCurrency(mes.faturamentoTotal),
    formatCurrency(mes.faturamentoAcumulado12Meses),
    formatCurrency(mes.rbt12),
    formatCurrency(mes.media12Meses),
    formatCurrency(mes.disponivelMedia),
    formatCurrency(mes.disponivelAnual),
    formatPercentage(mes.aliquotaEfetiva),
    formatPercentage(mes.percentualICMS),
    formatCurrency(mes.valorSemST),
    formatCurrency(mes.valorComST),
    formatCurrency(mes.valorTotal)
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

export const baixarCSV = (csvContent: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `simples-nacional-completo-${Date.now()}.csv`;
  link.click();
};

export const criarNovoMes = (dadosForm: NovoMesForm): MesSimulacao => {
  return {
    id: Date.now().toString(),
    ...dadosForm,
    faturamentoTotal: 0,
    faturamentoAcumulado12Meses: 0,
    rbt12: 0,
    media12Meses: 0,
    disponivelMedia: 0,
    disponivelAnual: 0,
    aliquotaEfetiva: 0,
    percentualICMS: 0,
    valorSemST: 0,
    valorComST: 0,
    valorTotal: 0
  };
};