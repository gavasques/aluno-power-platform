// Utility functions for channel profitability calculations

export interface ChannelCalculationResult {
  totalCosts: number;
  netProfit: number;
  marginPercent: number;
  roi: number;
  isProfit: boolean;
}

export interface ProductBaseData {
  costItem: number;
  taxPercent: number;
}

export interface ChannelData {
  price?: string;
  [key: string]: string | undefined;
}

// Convert string values to numbers, handling Brazilian formatting
const parseValue = (value: string | undefined): number => {
  if (!value) return 0;
  
  // Remove R$, %, and spaces, replace comma with dot
  const cleanValue = value
    .replace(/[R$%\s]/g, '')
    .replace(',', '.');
  
  return parseFloat(cleanValue) || 0;
};

// Calculate channel profitability based on channel type and data
export const calculateChannelProfitability = (
  channelType: string,
  channelData: ChannelData,
  productBase: ProductBaseData
): ChannelCalculationResult => {
  const price = parseValue(channelData.price);
  const productCost = productBase.costItem;
  const taxPercent = productBase.taxPercent;
  
  if (!price || price <= 0) {
    return {
      totalCosts: 0,
      netProfit: 0,
      marginPercent: 0,
      roi: 0,
      isProfit: false
    };
  }

  // Calculate tax cost based on sale price
  const taxCost = price * (taxPercent / 100);
  
  // Base costs (product + taxes)
  let totalCosts = productCost + taxCost;
  
  // Add channel-specific costs based on channel type
  switch (channelType) {
    case 'SITE_PROPRIO':
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.marketingCostPercent) / 100); // Marketing
      totalCosts += price * (parseValue(channelData.financialCostPercent) / 100); // Financeiro
      break;
      
    case 'AMAZON_FBM':
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += price * (parseValue(channelData.installmentPercent) / 100); // Parcelamento
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'AMAZON_FBA_ONSITE':
      totalCosts += parseValue(channelData.shippingCost); // Frete FBA ON Site
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.installmentPercent) / 100); // Parcelamento
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      break;
      
    case 'AMAZON_DBA':
      totalCosts += parseValue(channelData.shippingCost); // Frete DBA
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.installmentPercent) / 100); // Parcelamento
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'AMAZON_FBA':
      totalCosts = parseValue(channelData.productCostFBA) || productCost; // Custo no FBA (ou produto base)
      totalCosts += taxCost; // Impostos
      totalCosts += parseValue(channelData.shippingCost); // Frete FBA
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.installmentPercent) / 100); // Parcelamento
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += parseValue(channelData.prepCenterCost); // Prep Center
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'MERCADO_LIVRE_ME1':
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'MERCADO_LIVRE_FLEX':
      totalCosts += parseValue(channelData.shippingCost); // Frete ML Flex
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts -= parseValue(channelData.revenueMLFlex); // Receita ML Flex (subtract as it's revenue)
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'MERCADO_LIVRE_ENVIOS':
      totalCosts += parseValue(channelData.shippingCost); // Frete ML Envios
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'MERCADO_LIVRE_FULL':
      totalCosts = parseValue(channelData.productCostMLFull) || productCost; // Custo no ML FULL
      totalCosts += taxCost; // Impostos
      totalCosts += parseValue(channelData.shippingCost); // Frete ML FULL
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.prepCenterCost); // Prep Center
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
      
    case 'SHOPEE':
      totalCosts += price * (parseValue(channelData.commissionPercent) / 100); // Comissão
      totalCosts += price * (parseValue(channelData.fixedCostPercent) / 100); // Custo Fixo
      totalCosts += parseValue(channelData.packagingCostValue); // Embalagem
      totalCosts += price * (parseValue(channelData.otherCostPercent) / 100); // Outro Custo %
      totalCosts += parseValue(channelData.otherCostValue); // Outro Custo R$
      totalCosts += price * (parseValue(channelData.tacosCostPercent) / 100); // TaCos
      totalCosts += price * (parseValue(channelData.rebatePercent) / 100); // Rebate %
      totalCosts += parseValue(channelData.rebateValue); // Rebate R$
      break;
  }
  
  // Calculate net profit
  const netProfit = price - totalCosts;
  
  // Calculate margin percentage
  const marginPercent = price > 0 ? (netProfit / price) * 100 : 0;
  
  // Calculate ROI (Return on Investment)
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
  
  return {
    totalCosts: Math.max(0, totalCosts),
    netProfit,
    marginPercent,
    roi,
    isProfit: netProfit > 0
  };
};

// Format currency for Brazilian display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Format percentage for Brazilian display
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};