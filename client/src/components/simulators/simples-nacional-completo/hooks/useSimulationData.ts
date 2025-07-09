import { useState, useEffect, useCallback } from 'react';
import { MesSimulacao, NovoMesForm, ValidationResult } from '../types';
import { STORAGE_KEYS } from '../constants';
import { validarNovoMes, criarNovoMes } from '../utils';

export const useSimulationData = () => {
  const [meses, setMeses] = useState<MesSimulacao[]>([]);
  const [novoMes, setNovoMes] = useState<NovoMesForm>({
    mesAno: '',
    faturamentoSemST: 0,
    faturamentoComST: 0,
    anexo: 'Anexo I'
  });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem(STORAGE_KEYS.SIMPLES_NACIONAL_COMPLETO);
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        setMeses(dados);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (meses.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SIMPLES_NACIONAL_COMPLETO, JSON.stringify(meses));
    }
  }, [meses]);

  const adicionarMes = useCallback((): ValidationResult => {
    const validation = validarNovoMes(novoMes);
    if (!validation.isValid) {
      return validation;
    }

    const novoMesCompleto = criarNovoMes(novoMes);
    setMeses(prev => [...prev, novoMesCompleto]);
    
    setNovoMes({
      mesAno: '',
      faturamentoSemST: 0,
      faturamentoComST: 0,
      anexo: 'Anexo I'
    });

    return { isValid: true };
  }, [novoMes]);

  const removerMes = useCallback((id: string) => {
    setMeses(prev => prev.filter(mes => mes.id !== id));
  }, []);

  const updateNovoMes = useCallback((field: keyof NovoMesForm, value: any) => {
    setNovoMes(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    meses,
    novoMes,
    adicionarMes,
    removerMes,
    updateNovoMes
  };
};