import { useMemo } from 'react';
import { SimulacaoCompleta, CalculatedResults, ProdutoSimulacao } from '../types';
import { safeNumber, safeDiv } from '../utils';

/**
 * Custom hook for complex import simulation calculations
 * Follows Single Responsibility Principle - only handles calculations
 */
export const useCalculations = (simulation: SimulacaoCompleta): CalculatedResults => {
  return useMemo(() => {
    const cfg = simulation.configuracoesGerais;
    const produtos = Array.isArray(simulation.produtos) ? simulation.produtos : [];

    // Global calculations
    const peso_bruto_total_simulacao_kg = produtos.reduce((sum, p) => {
      const pesoTotal = safeNumber(p.quantidade) * safeNumber(p.peso_bruto_unitario_kg);
      return sum + pesoTotal;
    }, 0);

    const valor_fob_total_simulacao_usd = produtos.reduce((sum, p) => 
      sum + (safeNumber(p.quantidade) * safeNumber(p.valor_unitario_usd)), 0);

    const quantidade_total_itens_simulacao = produtos.reduce((sum, p) => 
      sum + safeNumber(p.quantidade), 0);

    const custo_frete_internacional_total_brl = cfg.moeda_frete_internacional === "USD" 
      ? cfg.custo_frete_internacional_total_moeda_original * cfg.taxa_cambio_usd_brl
      : cfg.custo_frete_internacional_total_moeda_original;

    // Calculate per product using helper function
    const produtosCalculados = produtos.map(p => 
      calculateProductCosts(p, cfg, {
        peso_bruto_total_simulacao_kg,
        valor_fob_total_simulacao_usd,
        quantidade_total_itens_simulacao,
        custo_frete_internacional_total_brl
      })
    );

    // Calculate totals
    const totals = calculateTotals(produtosCalculados, cfg, {
      quantidade_total_itens_simulacao,
      valor_fob_total_simulacao_usd,
      peso_bruto_total_simulacao_kg
    });

    return {
      produtos: produtosCalculados,
      totals
    };
  }, [simulation]);
};

/**
 * Calculate costs for a single product
 * Pure function - easier to test
 */
const calculateProductCosts = (
  produto: ProdutoSimulacao, 
  cfg: any, 
  globalTotals: {
    peso_bruto_total_simulacao_kg: number;
    valor_fob_total_simulacao_usd: number;
    quantidade_total_itens_simulacao: number;
    custo_frete_internacional_total_brl: number;
  }
): ProdutoSimulacao => {
  const peso_bruto_total_produto_kg = safeNumber(produto.quantidade) * safeNumber(produto.peso_bruto_unitario_kg);
  const valor_total_produto_usd = safeNumber(produto.quantidade) * safeNumber(produto.valor_unitario_usd);
  const custo_produto_brl = valor_total_produto_usd * cfg.taxa_cambio_usd_brl;

  // Calculate freight cost allocation
  const custo_frete_por_produto_brl = calculateFreightAllocation(
    produto,
    cfg.metodo_rateio_frete,
    globalTotals,
    { peso_bruto_total_produto_kg, valor_total_produto_usd }
  );

  const produto_mais_frete_brl = custo_produto_brl + custo_frete_por_produto_brl;
  const base_calculo_ii_brl = produto_mais_frete_brl;
  const valor_ii_brl = base_calculo_ii_brl * cfg.aliquota_ii_percentual;

  // Calculate other expenses allocation
  const outras_despesas_rateadas_brl = calculateExpensesAllocation(
    produto,
    cfg.metodo_rateio_outras_despesas,
    { ...globalTotals, outras_despesas_aduaneiras_total_brl: cfg.outras_despesas_aduaneiras_total_brl },
    { peso_bruto_total_produto_kg, valor_total_produto_usd }
  );

  // ICMS calculation following spreadsheet logic
  const base_calculo_icms_planilha_brl = (produto_mais_frete_brl + valor_ii_brl) / (1 - cfg.aliquota_icms_percentual);
  const valor_icms_brl = base_calculo_icms_planilha_brl * cfg.aliquota_icms_percentual;

  // Include outras despesas aduaneiras rateadas in final cost calculation
  const valor_total_produto_impostos_brl = produto_mais_frete_brl + valor_ii_brl + valor_icms_brl + outras_despesas_rateadas_brl;
  const custo_unitario_sem_imposto_brl = safeDiv(produto_mais_frete_brl + outras_despesas_rateadas_brl, produto.quantidade);
  const custo_unitario_com_imposto_brl = safeDiv(valor_total_produto_impostos_brl, produto.quantidade);

  return {
    ...produto,
    peso_bruto_total_produto_kg,
    valor_total_produto_usd,
    custo_produto_brl,
    custo_frete_por_produto_brl,
    produto_mais_frete_brl,
    base_calculo_ii_brl,
    valor_ii_brl,
    outras_despesas_rateadas_brl,
    base_calculo_icms_planilha_brl,
    valor_icms_brl,
    valor_total_produto_impostos_brl,
    custo_unitario_sem_imposto_brl,
    custo_unitario_com_imposto_brl,
  };
};

/**
 * Calculate freight allocation based on method
 * Pure function for easy testing
 */
const calculateFreightAllocation = (
  produto: ProdutoSimulacao,
  metodo: string,
  globalTotals: any,
  productTotals: { peso_bruto_total_produto_kg: number; valor_total_produto_usd: number }
): number => {
  const { custo_frete_internacional_total_brl } = globalTotals;

  switch (metodo) {
    case "peso":
      return globalTotals.peso_bruto_total_simulacao_kg > 0
        ? safeDiv(productTotals.peso_bruto_total_produto_kg, globalTotals.peso_bruto_total_simulacao_kg) * custo_frete_internacional_total_brl
        : 0;
    
    case "valor_fob":
      return globalTotals.valor_fob_total_simulacao_usd > 0
        ? safeDiv(productTotals.valor_total_produto_usd, globalTotals.valor_fob_total_simulacao_usd) * custo_frete_internacional_total_brl
        : 0;
    
    case "quantidade":
      return globalTotals.quantidade_total_itens_simulacao > 0
        ? safeDiv(produto.quantidade, globalTotals.quantidade_total_itens_simulacao) * custo_frete_internacional_total_brl
        : 0;
    
    default:
      return 0;
  }
};

/**
 * Calculate expenses allocation based on method
 * Pure function for easy testing
 */
const calculateExpensesAllocation = (
  produto: ProdutoSimulacao,
  metodo: string,
  globalTotals: any,
  productTotals: { peso_bruto_total_produto_kg: number; valor_total_produto_usd: number }
): number => {
  const cfg = globalTotals;

  switch (metodo) {
    case "peso":
      return cfg.peso_bruto_total_simulacao_kg > 0
        ? safeDiv(productTotals.peso_bruto_total_produto_kg, cfg.peso_bruto_total_simulacao_kg) * cfg.outras_despesas_aduaneiras_total_brl
        : 0;
    
    case "valor_fob":
      return cfg.valor_fob_total_simulacao_usd > 0
        ? safeDiv(productTotals.valor_total_produto_usd, cfg.valor_fob_total_simulacao_usd) * cfg.outras_despesas_aduaneiras_total_brl
        : 0;
    
    case "quantidade":
      return cfg.quantidade_total_itens_simulacao > 0
        ? safeDiv(produto.quantidade, cfg.quantidade_total_itens_simulacao) * cfg.outras_despesas_aduaneiras_total_brl
        : 0;
    
    default:
      return 0;
  }
};

/**
 * Calculate simulation totals
 * Pure function for easy testing
 */
const calculateTotals = (
  produtosCalculados: ProdutoSimulacao[],
  cfg: any,
  globalData: {
    quantidade_total_itens_simulacao: number;
    valor_fob_total_simulacao_usd: number;
    peso_bruto_total_simulacao_kg: number;
  }
) => {
  // Ensure produtosCalculados is an array
  const produtos = Array.isArray(produtosCalculados) ? produtosCalculados : [];
  
  const totals = {
    total_sim_quantidade_itens: globalData.quantidade_total_itens_simulacao,
    total_sim_custo_produto_brl: produtos.reduce((sum, p) => sum + (p.custo_produto_brl || 0), 0),
    total_sim_produto_mais_frete_brl: produtos.reduce((sum, p) => sum + (p.produto_mais_frete_brl || 0), 0),
    total_sim_valor_ii_brl: produtos.reduce((sum, p) => sum + (p.valor_ii_brl || 0), 0),
    total_sim_valor_icms_brl: produtos.reduce((sum, p) => sum + (p.valor_icms_brl || 0), 0),
    total_sim_outras_despesas_aduaneiras_brl: cfg.outras_despesas_aduaneiras_total_brl,
  };

  const custo_total_importacao_brl = totals.total_sim_produto_mais_frete_brl + 
    totals.total_sim_valor_ii_brl + 
    totals.total_sim_valor_icms_brl + 
    totals.total_sim_outras_despesas_aduaneiras_brl;
  
  // Additional calculations
  const peso_total_kg = Number(globalData.peso_bruto_total_simulacao_kg.toFixed(2));
  const preco_por_kg_usd = safeDiv(cfg.custo_frete_internacional_total_moeda_original, peso_total_kg);
  const multiplicador_importacao = globalData.valor_fob_total_simulacao_usd > 0 
    ? custo_total_importacao_brl / (globalData.valor_fob_total_simulacao_usd * cfg.taxa_cambio_usd_brl) 
    : 0;

  return {
    ...totals,
    custo_total_importacao_brl,
    peso_total_kg,
    preco_por_kg_usd,
    multiplicador_importacao,
    valor_fob_total_usd: globalData.valor_fob_total_simulacao_usd
  };
};