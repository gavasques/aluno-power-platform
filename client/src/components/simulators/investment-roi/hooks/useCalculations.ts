import { useMemo } from 'react';
import { ConfiguracaoSimulacao, GiroCalculado, GiroEditavel, CalculatedResults, SimulationTotals } from '../types';
import { convertToDays } from '../utils';

/**
 * Custom hook for investment ROI calculations
 * Implements all business logic for cycle calculations and totals
 */
export const useCalculations = (
  config: ConfiguracaoSimulacao,
  girosData: { [key: number]: GiroEditavel }
): CalculatedResults => {
  
  const girosCalculados = useMemo(() => {
    const giros: GiroCalculado[] = [];
    let saldoAnterior = config.investimentoInicial;
    let tempoAcumulado = 0;

    for (let i = 1; i <= config.numeroGiros; i++) {
      const giroData = girosData[i] || { aporte: 0, retirada: 0, roiGiro: 20 };
      
      // Aplicar aporte antes do cálculo do retorno
      const investimentoComAporte = saldoAnterior + giroData.aporte;
      
      // Calcular retorno baseado no ROI do giro
      const retorno = (investimentoComAporte * giroData.roiGiro) / 100;
      
      // Saldo após retorno e antes da retirada
      const saldoAposRetorno = investimentoComAporte + retorno;
      
      // Saldo final após retirada
      const saldoFinal = saldoAposRetorno - giroData.retirada;
      
      // Calcular tempo decorrido
      tempoAcumulado += convertToDays(config.duracaoGiro, config.unidadeTempo);

      const giro: GiroCalculado = {
        numero: i,
        investimento: investimentoComAporte,
        retorno,
        aporte: giroData.aporte,
        retirada: giroData.retirada,
        saldo: saldoFinal,
        roiGiro: giroData.roiGiro,
        tempoDecorrido: tempoAcumulado
      };

      giros.push(giro);
      saldoAnterior = saldoFinal;
    }

    return giros;
  }, [config, girosData]);

  const totals = useMemo((): SimulationTotals => {
    const totalAportes = girosCalculados.reduce((sum, giro) => sum + giro.aporte, 0);
    const totalRetiradas = girosCalculados.reduce((sum, giro) => sum + giro.retirada, 0);
    const totalRetornos = girosCalculados.reduce((sum, giro) => sum + giro.retorno, 0);
    const saldoFinal = girosCalculados[girosCalculados.length - 1]?.saldo || 0;
    const totalInvestido = config.investimentoInicial + totalAportes;
    const ganhoLiquido = saldoFinal + totalRetiradas - totalInvestido;
    const roiTotal = totalInvestido > 0 ? (ganhoLiquido / totalInvestido) * 100 : 0;

    return {
      totalAportes,
      totalRetiradas,
      totalRetornos,
      saldoFinal,
      totalInvestido,
      ganhoLiquido,
      roiTotal
    };
  }, [girosCalculados, config.investimentoInicial]);

  return {
    giros: girosCalculados,
    totals
  };
};

/**
 * Hook for bulk operations on giros data
 */
export const useBulkOperations = () => {
  const applyBulkROI = (
    girosData: { [key: number]: GiroEditavel },
    numeroGiros: number,
    roiValue: number
  ): { [key: number]: GiroEditavel } => {
    const newGirosData = { ...girosData };
    
    for (let i = 1; i <= numeroGiros; i++) {
      newGirosData[i] = {
        ...newGirosData[i],
        aporte: newGirosData[i]?.aporte || 0,
        retirada: newGirosData[i]?.retirada || 0,
        roiGiro: roiValue
      };
    }
    
    return newGirosData;
  };

  const applyBulkAporte = (
    girosData: { [key: number]: GiroEditavel },
    numeroGiros: number,
    aporteValue: number
  ): { [key: number]: GiroEditavel } => {
    const newGirosData = { ...girosData };
    
    for (let i = 1; i <= numeroGiros; i++) {
      newGirosData[i] = {
        ...newGirosData[i],
        aporte: aporteValue,
        retirada: newGirosData[i]?.retirada || 0,
        roiGiro: newGirosData[i]?.roiGiro || 20
      };
    }
    
    return newGirosData;
  };

  const applyBulkRetirada = (
    girosData: { [key: number]: GiroEditavel },
    numeroGiros: number,
    retiradaValue: number
  ): { [key: number]: GiroEditavel } => {
    const newGirosData = { ...girosData };
    
    for (let i = 1; i <= numeroGiros; i++) {
      newGirosData[i] = {
        ...newGirosData[i],
        aporte: newGirosData[i]?.aporte || 0,
        retirada: retiradaValue,
        roiGiro: newGirosData[i]?.roiGiro || 20
      };
    }
    
    return newGirosData;
  };

  return {
    applyBulkROI,
    applyBulkAporte,
    applyBulkRetirada
  };
};