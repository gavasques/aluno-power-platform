import { useMemo } from 'react';
import { MesSimulacao, ResumoSimulacao } from '../types';
import { LIMITS } from '../constants';
import { 
  calcularSomaUltimos12Meses, 
  calcularMediaUltimos12Meses, 
  buscarFaixaAnexo,
  formatCurrency
} from '../utils';

export const useCalculations = (meses: MesSimulacao[]) => {
  const mesesCalculados = useMemo(() => {
    const mesesComFaturamentoTotal = meses.map(mes => ({
      ...mes,
      faturamentoTotal: mes.faturamentoSemST + mes.faturamentoComST
    }));
    
    return mesesComFaturamentoTotal.map((mes, index) => {
      const faturamentoAcumulado12Meses = calcularSomaUltimos12Meses(mesesComFaturamentoTotal, index);
      const rbt12 = faturamentoAcumulado12Meses;
      const media12Meses = calcularMediaUltimos12Meses(mesesComFaturamentoTotal, index);
      
      const disponivelMedia = LIMITS.MEDIA_MENSAL - media12Meses;
      const disponivelAnual = LIMITS.LIMITE_ANUAL - rbt12;
      
      const faixa = buscarFaixaAnexo(rbt12, mes.anexo);
      const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * faixa.aliquotaNominal) - faixa.valorDeduzir) / rbt12 : 0;
      const percentualICMS = faixa.percentualICMS;
      
      const valorSemST = mes.faturamentoSemST * aliquotaEfetiva;
      const valorComST = mes.faturamentoComST * aliquotaEfetiva * (1 - percentualICMS);
      const valorTotal = valorSemST + valorComST;
      
      return {
        ...mes,
        faturamentoTotal: mes.faturamentoTotal,
        faturamentoAcumulado12Meses,
        rbt12,
        media12Meses,
        disponivelMedia,
        disponivelAnual,
        aliquotaEfetiva,
        percentualICMS,
        valorSemST,
        valorComST,
        valorTotal
      };
    });
  }, [meses]);

  const resumo = useMemo((): ResumoSimulacao | null => {
    if (mesesCalculados.length === 0) return null;

    const ultimoMes = mesesCalculados[mesesCalculados.length - 1];
    const totalImpostos = mesesCalculados.reduce((total, mes) => total + mes.valorTotal, 0);
    const totalFaturamento = mesesCalculados.reduce((total, mes) => total + mes.faturamentoTotal, 0);
    const aliquotaMedia = totalFaturamento > 0 ? totalImpostos / totalFaturamento : 0;

    return {
      totalMeses: mesesCalculados.length,
      ultimoRBT12: ultimoMes.rbt12,
      ultimaMedia: ultimoMes.media12Meses,
      totalImpostos,
      totalFaturamento,
      aliquotaMedia,
      disponivelAnual: ultimoMes.disponivelAnual,
      disponivelMedia: ultimoMes.disponivelMedia
    };
  }, [mesesCalculados]);

  return {
    mesesCalculados,
    resumo
  };
};