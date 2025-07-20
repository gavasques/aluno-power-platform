/**
 * Serviço de Cálculos - Implementação tipada para operações de cálculo
 * Utiliza tipos específicos de domínio para cálculos de e-commerce
 */

import { 
  PricingCalculation, 
  PricingBreakdown,
  ImportCalculation,
  SimplesNacionalCalculation,
  InvestmentCalculation,
  SalesStatistics,
  PerformanceMetrics,
  CalculationResult,
  CalculationOptions,
  CalculationFunction
} from '@/types/core';

// ============================================================================
// CÁLCULOS DE PRECIFICAÇÃO
// ============================================================================

export interface PricingCalculationRequest {
  productId: number;
  channelType: string;
  baseCost: number;
  targetMargin: number;
  competitorPrices?: number[];
  includeTaxes?: boolean;
  includeShipping?: boolean;
}

export const calculatePricing: CalculationFunction<PricingCalculationRequest, PricingCalculation> = 
  (data, options = {}) => {
    try {
      const {
        productId,
        channelType,
        baseCost,
        targetMargin,
        competitorPrices = [],
        includeTaxes = true,
        includeShipping = true
      } = data;

      // Cálculo do custo total
      let totalCost = baseCost;
      
      if (includeTaxes) {
        totalCost += baseCost * 0.18; // ICMS + PIS/COFINS
      }
      
      if (includeShipping) {
        totalCost += baseCost * 0.05; // Frete estimado
      }

      // Cálculo do preço sugerido baseado na margem
      const suggestedPrice = totalCost / (1 - targetMargin / 100);
      
      // Cálculo do markup
      const markup = ((suggestedPrice - totalCost) / totalCost) * 100;
      
      // Cálculo do ROI
      const roi = ((suggestedPrice - totalCost) / totalCost) * 100;
      
      // Preço de equilíbrio
      const breakEvenPrice = totalCost;

      // Análise de concorrência
      const competitorAnalysis = competitorPrices.map(price => ({
        competitor: `Competidor ${Math.floor(Math.random() * 100)}`,
        price,
        difference: price - suggestedPrice,
        percentage: ((price - suggestedPrice) / suggestedPrice) * 100
      }));

      return {
        success: true,
        data: {
          productId,
          channelType: channelType as any,
          baseCost,
          totalCost,
          suggestedPrice,
          margin: targetMargin,
          markup,
          roi,
          breakEvenPrice,
          competitorAnalysis
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo de precificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

export const calculatePricingBreakdown = (pricing: PricingCalculation): PricingBreakdown => {
  const costBreakdown = {
    productCost: pricing.baseCost,
    shippingCost: pricing.baseCost * 0.05,
    handlingCost: pricing.baseCost * 0.02,
    packagingCost: pricing.baseCost * 0.01,
    totalCost: pricing.totalCost
  };

  const taxBreakdown = {
    icms: pricing.baseCost * 0.12,
    pis: pricing.baseCost * 0.0165,
    cofins: pricing.baseCost * 0.076,
    ipi: 0,
    totalTaxes: pricing.baseCost * 0.2125
  };

  const commissionBreakdown = {
    marketplaceFee: pricing.suggestedPrice * 0.15,
    paymentFee: pricing.suggestedPrice * 0.03,
    advertisingFee: pricing.suggestedPrice * 0.05,
    totalCommissions: pricing.suggestedPrice * 0.23
  };

  const profitBreakdown = {
    grossProfit: pricing.suggestedPrice - pricing.totalCost,
    netProfit: pricing.suggestedPrice - pricing.totalCost - commissionBreakdown.totalCommissions,
    margin: pricing.margin,
    markup: pricing.markup
  };

  return {
    costBreakdown,
    taxBreakdown,
    commissionBreakdown,
    profitBreakdown
  };
};

// ============================================================================
// CÁLCULOS DE IMPORTAÇÃO
// ============================================================================

export interface ImportCalculationRequest {
  simulationId: number;
  type: 'import_simplified' | 'import_formal';
  currency: 'USD' | 'EUR' | 'CNY';
  exchangeRate: number;
  totalFobValue: number;
  freightCost: number;
  insuranceCost: number;
  customsDuties: number;
  otherExpenses: number;
  totalQuantity: number;
}

export const calculateImport: CalculationFunction<ImportCalculationRequest, ImportCalculation> = 
  (data, options = {}) => {
    try {
      const {
        simulationId,
        type,
        currency,
        exchangeRate,
        totalFobValue,
        freightCost,
        insuranceCost,
        customsDuties,
        otherExpenses,
        totalQuantity
      } = data;

      // Conversão para BRL
      const fobValueBRL = totalFobValue * exchangeRate;
      const freightCostBRL = freightCost * exchangeRate;
      const insuranceCostBRL = insuranceCost * exchangeRate;
      const customsDutiesBRL = customsDuties * exchangeRate;
      const otherExpensesBRL = otherExpenses * exchangeRate;

      // Cálculo do custo total
      const totalCost = fobValueBRL + freightCostBRL + insuranceCostBRL + 
                       customsDutiesBRL + otherExpensesBRL;

      // Custo por unidade
      const costPerUnit = totalCost / totalQuantity;

      // Preço sugerido com margem de 30%
      const suggestedPrice = costPerUnit / 0.7;

      // Margem de lucro
      const profitMargin = ((suggestedPrice - costPerUnit) / suggestedPrice) * 100;

      return {
        success: true,
        data: {
          simulationId,
          type,
          currency,
          exchangeRate,
          totalFobValue,
          freightCost,
          insuranceCost,
          customsDuties,
          otherExpenses,
          totalCost,
          costPerUnit,
          suggestedPrice,
          profitMargin
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo de importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

// ============================================================================
// CÁLCULOS DE SIMPLES NACIONAL
// ============================================================================

export interface SimplesNacionalRequest {
  revenue: number;
  anexo: number;
  state: string;
}

export const calculateSimplesNacional: CalculationFunction<SimplesNacionalRequest, SimplesNacionalCalculation> = 
  (data, options = {}) => {
    try {
      const { revenue, anexo, state } = data;

      // Definição das faixas do Simples Nacional (Anexo I)
      const faixas = [
        { faixa: 1, receitaInicial: 0, receitaFinal: 180000, aliquota: 4, deducao: 0 },
        { faixa: 2, receitaInicial: 180000, receitaFinal: 360000, aliquota: 7.3, deducao: 5940 },
        { faixa: 3, receitaInicial: 360000, receitaFinal: 720000, aliquota: 9.5, deducao: 13860 },
        { faixa: 4, receitaInicial: 720000, receitaFinal: 1800000, aliquota: 10.7, deducao: 22500 },
        { faixa: 5, receitaInicial: 1800000, receitaFinal: 3600000, aliquota: 14.3, deducao: 87300 },
        { faixa: 6, receitaInicial: 3600000, receitaFinal: 4800000, aliquota: 19, deducao: 378000 }
      ];

      // Encontrar a faixa aplicável
      const faixa = faixas.find(f => revenue >= f.receitaInicial && revenue <= f.receitaFinal);
      
      if (!faixa) {
        throw new Error('Receita fora das faixas do Simples Nacional');
      }

      // Cálculo do imposto devido
      const impostoDevido = (revenue * faixa.aliquota / 100) - faixa.deducao;

      // Distribuição dos impostos (aproximada)
      const pis = impostoDevido * 0.078;
      const cofins = impostoDevido * 0.358;
      const icms = impostoDevido * 0.564;

      return {
        success: true,
        data: {
          revenue,
          anexo,
          faixa: faixa.faixa,
          aliquota: faixa.aliquota,
          deducao: faixa.deducao,
          impostoDevido,
          pis,
          cofins,
          icms,
          totalImpostos: impostoDevido
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo do Simples Nacional: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

// ============================================================================
// CÁLCULOS DE INVESTIMENTO
// ============================================================================

export interface InvestmentCalculationRequest {
  initialInvestment: number;
  monthlyInvestment: number;
  period: number; // em meses
  expectedReturn: number; // percentual anual
  inflationRate: number;
}

export const calculateInvestment: CalculationFunction<InvestmentCalculationRequest, InvestmentCalculation> = 
  (data, options = {}) => {
    try {
      const {
        initialInvestment,
        monthlyInvestment,
        period,
        expectedReturn,
        inflationRate
      } = data;

      const monthlyReturn = expectedReturn / 12 / 100;
      const monthlyInflation = inflationRate / 12 / 100;

      let totalInvested = initialInvestment;
      let totalReturn = initialInvestment;
      const projections: any[] = [];

      for (let month = 1; month <= period; month++) {
        // Aplicar retorno mensal
        totalReturn *= (1 + monthlyReturn);
        
        // Adicionar investimento mensal
        if (month > 1) {
          totalInvested += monthlyInvestment;
          totalReturn += monthlyInvestment * (1 + monthlyReturn);
        }

        // Ajustar pela inflação
        const adjustedTotal = totalReturn / Math.pow(1 + monthlyInflation, month);

        projections.push({
          month,
          invested: totalInvested,
          return: totalReturn,
          total: totalReturn,
          adjustedTotal
        });
      }

      const roi = ((totalReturn - totalInvested) / totalInvested) * 100;
      const adjustedReturn = totalReturn / Math.pow(1 + monthlyInflation, period);

      return {
        success: true,
        data: {
          initialInvestment,
          monthlyInvestment,
          period,
          expectedReturn,
          inflationRate,
          totalInvested,
          totalReturn,
          adjustedReturn,
          roi,
          projections
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo de investimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

// ============================================================================
// CÁLCULOS DE ESTATÍSTICAS
// ============================================================================

export interface SalesStatisticsRequest {
  period: {
    start: Date;
    end: Date;
  };
  salesData: Array<{
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
    channel: string;
    date: Date;
  }>;
}

export const calculateSalesStatistics: CalculationFunction<SalesStatisticsRequest, SalesStatistics> = 
  (data, options = {}) => {
    try {
      const { period, salesData } = data;

      const totalSales = salesData.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = salesData.length;
      const averageOrderValue = totalRevenue / totalOrders;

      // Agrupar por produto
      const productMap = new Map();
      salesData.forEach(item => {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: 0,
            revenue: 0
          });
        }
        const product = productMap.get(item.productId);
        product.quantity += item.quantity;
        product.revenue += item.revenue;
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(product => ({
          ...product,
          percentage: (product.revenue / totalRevenue) * 100
        }));

      // Agrupar por canal
      const channelMap = new Map();
      salesData.forEach(item => {
        if (!channelMap.has(item.channel)) {
          channelMap.set(item.channel, {
            channel: item.channel,
            sales: 0,
            revenue: 0
          });
        }
        const channel = channelMap.get(item.channel);
        channel.sales += item.quantity;
        channel.revenue += item.revenue;
      });

      const salesByChannel = Array.from(channelMap.values())
        .map(channel => ({
          ...channel,
          percentage: (channel.revenue / totalRevenue) * 100
        }));

      return {
        success: true,
        data: {
          period,
          totalSales,
          totalRevenue,
          averageOrderValue,
          totalOrders,
          conversionRate: 0, // Seria calculado com dados de visitantes
          topProducts,
          salesByChannel,
          salesByPeriod: [] // Seria calculado com agrupamento por período
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo de estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

// ============================================================================
// CÁLCULOS DE PERFORMANCE
// ============================================================================

export interface PerformanceCalculationRequest {
  productId: number;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  adSpend: number;
}

export const calculatePerformanceMetrics: CalculationFunction<PerformanceCalculationRequest, PerformanceMetrics> = 
  (data, options = {}) => {
    try {
      const { productId, views, clicks, conversions, revenue, adSpend } = data;

      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const cpc = clicks > 0 ? adSpend / clicks : 0;
      const cpa = conversions > 0 ? adSpend / conversions : 0;
      const roas = adSpend > 0 ? revenue / adSpend : 0;
      const acos = revenue > 0 ? (adSpend / revenue) * 100 : 0;

      return {
        success: true,
        data: {
          productId,
          views,
          clicks,
          conversions,
          revenue,
          ctr,
          cvr,
          cpc,
          cpa,
          roas,
          acos
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no cálculo de performance: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

// ============================================================================
// UTILITÁRIOS DE CÁLCULO
// ============================================================================

export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const calculatePercentage = (part: number, total: number): number => {
  return total > 0 ? (part / total) * 100 : 0;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
};

export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
}; 