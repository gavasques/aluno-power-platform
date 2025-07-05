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
  price?: string | number;
  [key: string]: string | number | undefined;
}

// Convert string or number values to numbers, handling Brazilian formatting
const parseValue = (value: string | number | undefined): number => {
  if (!value && value !== 0) return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return value;
  
  // If it's a string, clean it up and convert
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

// Interface for individual cost breakdown items
export interface CostBreakdownItem {
  label: string;
  value: number;
  isRebate?: boolean; // Indicates if this is a rebate (positive value)
}

// Generate detailed cost breakdown for a specific channel
export const getDetailedCostBreakdown = (
  channelType: string,
  channelData: ChannelData,
  productBase: ProductBaseData,
  packCost: number = 0
): CostBreakdownItem[] => {
  const price = parseValue(channelData.price);
  const productCost = productBase.costItem;
  const taxPercent = productBase.taxPercent;
  const breakdown: CostBreakdownItem[] = [];
  
  if (!price || price <= 0) {
    return breakdown;
  }

  // Base costs that appear for all channels
  const taxCost = price * (taxPercent / 100);
  
  // Add channel-specific breakdown based on channel type
  switch (channelType) {
    case 'SITE_PROPRIO':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const sitePackaging = parseValue(channelData.packagingCostValue);
      const siteFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const siteOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const siteOtherCostValue = parseValue(channelData.otherCostValue);
      const siteMarketing = price * (parseValue(channelData.marketingCostPercent) / 100);
      const siteMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const siteFinancial = price * (parseValue(channelData.financialCostPercent) / 100);
      
      if (sitePackaging > 0) breakdown.push({ label: 'Embalagem', value: sitePackaging });
      if (siteFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: siteFixedCost });
      if (siteOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: siteOtherCostPct });
      if (siteOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: siteOtherCostValue });
      if (siteMarketing > 0) breakdown.push({ label: `Marketing (${parseValue(channelData.marketingCostPercent)}%)`, value: siteMarketing });
      if (siteMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: siteMarketplaceFee });
      if (siteFinancial > 0) breakdown.push({ label: `Financeiro (${parseValue(channelData.financialCostPercent)}%)`, value: siteFinancial });
      break;
      
    case 'AMAZON_FBM':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const fbmCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const fbmMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const fbmFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const fbmInstallment = price * (parseValue(channelData.installmentPercent) / 100);
      const fbmPackaging = parseValue(channelData.packagingCostValue);
      const fbmOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const fbmOtherCostValue = parseValue(channelData.otherCostValue);
      const fbmTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const fbmRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const fbmRebateValue = parseValue(channelData.rebateValue);
      
      if (fbmCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: fbmCommission });
      if (fbmMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: fbmMarketplaceFee });
      if (fbmFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: fbmFixedCost });
      if (fbmInstallment > 0) breakdown.push({ label: `Parcelamento (${parseValue(channelData.installmentPercent)}%)`, value: fbmInstallment });
      if (fbmPackaging > 0) breakdown.push({ label: 'Embalagem', value: fbmPackaging });
      if (fbmOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: fbmOtherCostPct });
      if (fbmOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: fbmOtherCostValue });
      if (fbmTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: fbmTacos });
      if (fbmRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: fbmRebatePct, isRebate: true });
      if (fbmRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: fbmRebateValue, isRebate: true });
      break;
      
    case 'AMAZON_FBA_ONSITE':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const onsiteShipping = parseValue(channelData.shippingCost);
      const onsiteCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const onsiteMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const onsiteInstallment = price * (parseValue(channelData.installmentPercent) / 100);
      const onsiteFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const onsitePackaging = parseValue(channelData.packagingCostValue);
      const onsiteOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const onsiteOtherCostValue = parseValue(channelData.otherCostValue);
      const onsiteRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const onsiteRebateValue = parseValue(channelData.rebateValue);
      const onsiteTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      
      if (onsiteShipping > 0) breakdown.push({ label: 'Frete FBA ON Site', value: onsiteShipping });
      if (onsiteCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: onsiteCommission });
      if (onsiteMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: onsiteMarketplaceFee });
      if (onsiteInstallment > 0) breakdown.push({ label: `Parcelamento (${parseValue(channelData.installmentPercent)}%)`, value: onsiteInstallment });
      if (onsiteFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: onsiteFixedCost });
      if (onsitePackaging > 0) breakdown.push({ label: 'Embalagem', value: onsitePackaging });
      if (onsiteOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: onsiteOtherCostPct });
      if (onsiteOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: onsiteOtherCostValue });
      if (onsiteRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: onsiteRebatePct, isRebate: true });
      if (onsiteRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: onsiteRebateValue, isRebate: true });
      if (onsiteTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: onsiteTacos });
      break;
      
    case 'AMAZON_DBA':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const dbaShipping = parseValue(channelData.shippingCost);
      const dbaCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const dbaMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const dbaInstallment = price * (parseValue(channelData.installmentPercent) / 100);
      const dbaFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const dbaPackaging = parseValue(channelData.packagingCostValue);
      const dbaOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const dbaOtherCostValue = parseValue(channelData.otherCostValue);
      const dbaTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const dbaRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const dbaRebateValue = parseValue(channelData.rebateValue);
      
      if (dbaShipping > 0) breakdown.push({ label: 'Frete DBA', value: dbaShipping });
      if (dbaCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: dbaCommission });
      if (dbaMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: dbaMarketplaceFee });
      if (dbaInstallment > 0) breakdown.push({ label: `Parcelamento (${parseValue(channelData.installmentPercent)}%)`, value: dbaInstallment });
      if (dbaFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: dbaFixedCost });
      if (dbaPackaging > 0) breakdown.push({ label: 'Embalagem', value: dbaPackaging });
      if (dbaOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: dbaOtherCostPct });
      if (dbaOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: dbaOtherCostValue });
      if (dbaTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: dbaTacos });
      if (dbaRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: dbaRebatePct, isRebate: true });
      if (dbaRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: dbaRebateValue, isRebate: true });
      break;
      
    case 'AMAZON_FBA':
      const fbaProductCost = parseValue(channelData.productCostFBA) || productCost;
      breakdown.push({ label: 'Custo no FBA', value: fbaProductCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      
      const fbaShipping = parseValue(channelData.shippingCost);
      const fbaCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const fbaMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const fbaInstallment = price * (parseValue(channelData.installmentPercent) / 100);
      const fbaFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const fbaPackaging = parseValue(channelData.packagingCostValue);
      const fbaPrepCenter = parseValue(channelData.prepCenterCost);
      const fbaOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const fbaOtherCostValue = parseValue(channelData.otherCostValue);
      const fbaTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const fbaRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const fbaRebateValue = parseValue(channelData.rebateValue);
      
      if (fbaShipping > 0) breakdown.push({ label: 'Frete FBA', value: fbaShipping });
      if (fbaCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: fbaCommission });
      if (fbaMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: fbaMarketplaceFee });
      if (fbaInstallment > 0) breakdown.push({ label: `Parcelamento (${parseValue(channelData.installmentPercent)}%)`, value: fbaInstallment });
      if (fbaFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: fbaFixedCost });
      if (fbaPackaging > 0) breakdown.push({ label: 'Embalagem', value: fbaPackaging });
      if (fbaPrepCenter > 0) breakdown.push({ label: 'Prep Center', value: fbaPrepCenter });
      if (fbaOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: fbaOtherCostPct });
      if (fbaOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: fbaOtherCostValue });
      if (fbaTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: fbaTacos });
      if (fbaRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: fbaRebatePct, isRebate: true });
      if (fbaRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: fbaRebateValue, isRebate: true });
      break;
      
    case 'MERCADO_LIVRE_ME1':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const me1Commission = price * (parseValue(channelData.commissionPercent) / 100);
      const me1MarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const me1FixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const me1Packaging = parseValue(channelData.packagingCostValue);
      const me1OtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const me1OtherCostValue = parseValue(channelData.otherCostValue);
      const me1Tacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const me1RebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const me1RebateValue = parseValue(channelData.rebateValue);
      
      if (me1Commission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: me1Commission });
      if (me1MarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: me1MarketplaceFee });
      if (me1FixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: me1FixedCost });
      if (me1Packaging > 0) breakdown.push({ label: 'Embalagem', value: me1Packaging });
      if (me1OtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: me1OtherCostPct });
      if (me1OtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: me1OtherCostValue });
      if (me1Tacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: me1Tacos });
      if (me1RebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: me1RebatePct, isRebate: true });
      if (me1RebateValue > 0) breakdown.push({ label: 'Rebate R$', value: me1RebateValue, isRebate: true });
      break;
      
    case 'MERCADO_LIVRE_FLEX':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const flexShipping = parseValue(channelData.shippingCost);
      const flexCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const flexMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const flexFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const flexPackaging = parseValue(channelData.packagingCostValue);
      const flexRevenue = parseValue(channelData.revenueMLFlex);
      const flexOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const flexOtherCostValue = parseValue(channelData.otherCostValue);
      const flexTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const flexRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const flexRebateValue = parseValue(channelData.rebateValue);
      
      if (flexShipping > 0) breakdown.push({ label: 'Frete ML Flex', value: flexShipping });
      if (flexCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: flexCommission });
      if (flexMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: flexMarketplaceFee });
      if (flexFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: flexFixedCost });
      if (flexPackaging > 0) breakdown.push({ label: 'Embalagem', value: flexPackaging });
      if (flexRevenue > 0) breakdown.push({ label: 'Receita ML Flex', value: flexRevenue, isRebate: true });
      if (flexOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: flexOtherCostPct });
      if (flexOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: flexOtherCostValue });
      if (flexTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: flexTacos });
      if (flexRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: flexRebatePct, isRebate: true });
      if (flexRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: flexRebateValue, isRebate: true });
      break;
      
    case 'MERCADO_LIVRE_ENVIOS':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const enviosShipping = parseValue(channelData.shippingCost);
      const enviosCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const enviosMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const enviosPackaging = parseValue(channelData.packagingCostValue);
      const enviosFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const enviosOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const enviosOtherCostValue = parseValue(channelData.otherCostValue);
      const enviosTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const enviosRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const enviosRebateValue = parseValue(channelData.rebateValue);
      
      if (enviosShipping > 0) breakdown.push({ label: 'Frete ML Envios', value: enviosShipping });
      if (enviosCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: enviosCommission });
      if (enviosMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: enviosMarketplaceFee });
      if (enviosPackaging > 0) breakdown.push({ label: 'Embalagem', value: enviosPackaging });
      if (enviosFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: enviosFixedCost });
      if (enviosOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: enviosOtherCostPct });
      if (enviosOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: enviosOtherCostValue });
      if (enviosTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: enviosTacos });
      if (enviosRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: enviosRebatePct, isRebate: true });
      if (enviosRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: enviosRebateValue, isRebate: true });
      break;
      
    case 'MERCADO_LIVRE_FULL':
      const fullProductCost = parseValue(channelData.productCostMLFull) || productCost;
      breakdown.push({ label: 'Custo no ML FULL', value: fullProductCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      
      const fullShipping = parseValue(channelData.shippingCost);
      const fullCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const fullMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const fullPackaging = parseValue(channelData.packagingCostValue);
      const fullFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const fullPrepCenter = parseValue(channelData.prepCenterCost);
      const fullOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const fullOtherCostValue = parseValue(channelData.otherCostValue);
      const fullTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const fullRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const fullRebateValue = parseValue(channelData.rebateValue);
      
      if (fullShipping > 0) breakdown.push({ label: 'Frete ML FULL', value: fullShipping });
      if (fullCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: fullCommission });
      if (fullMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: fullMarketplaceFee });
      if (fullPackaging > 0) breakdown.push({ label: 'Embalagem', value: fullPackaging });
      if (fullFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: fullFixedCost });
      if (fullPrepCenter > 0) breakdown.push({ label: 'Prep Center', value: fullPrepCenter });
      if (fullOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: fullOtherCostPct });
      if (fullOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: fullOtherCostValue });
      if (fullTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: fullTacos });
      if (fullRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: fullRebatePct, isRebate: true });
      if (fullRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: fullRebateValue, isRebate: true });
      break;
      
    case 'SHOPEE':
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const shopeeCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const shopeeMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const shopeeFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const shopeePackaging = parseValue(channelData.packagingCostValue);
      const shopeeOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const shopeeOtherCostValue = parseValue(channelData.otherCostValue);
      const shopeeTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const shopeeRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const shopeeRebateValue = parseValue(channelData.rebateValue);
      
      if (shopeeCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: shopeeCommission });
      if (shopeeMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: shopeeMarketplaceFee });
      if (shopeeFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: shopeeFixedCost });
      if (shopeePackaging > 0) breakdown.push({ label: 'Embalagem', value: shopeePackaging });
      if (shopeeOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: shopeeOtherCostPct });
      if (shopeeOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: shopeeOtherCostValue });
      if (shopeeTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: shopeeTacos });
      if (shopeeRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: shopeeRebatePct, isRebate: true });
      if (shopeeRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: shopeeRebateValue, isRebate: true });
      break;

    case 'MAGALU_FULL':
      // MAGALU FULL usa custo específico do produto no MGL FULL
      const magaluFullCost = parseValue(channelData.productCostMagaluFull) || productCost;
      breakdown.push({ label: 'Custo do Produto MGL FULL', value: magaluFullCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const magaluFullCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const magaluFullMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const magaluFullFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const magaluFullPackaging = parseValue(channelData.packagingCostValue);
      const magaluFullOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const magaluFullOtherCostValue = parseValue(channelData.otherCostValue);
      const magaluFullTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const magaluFullRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const magaluFullRebateValue = parseValue(channelData.rebateValue);
      
      if (magaluFullCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: magaluFullCommission });
      if (magaluFullMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: magaluFullMarketplaceFee });
      if (magaluFullFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: magaluFullFixedCost });
      if (magaluFullPackaging > 0) breakdown.push({ label: 'Embalagem', value: magaluFullPackaging });
      if (magaluFullOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: magaluFullOtherCostPct });
      if (magaluFullOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: magaluFullOtherCostValue });
      if (magaluFullTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: magaluFullTacos });
      if (magaluFullRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: magaluFullRebatePct, isRebate: true });
      if (magaluFullRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: magaluFullRebateValue, isRebate: true });
      break;

    case 'MAGALU_ENVIOS':
      // MAGALU ENVIOS usa custo geral do produto
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const magaluEnviosCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const magaluEnviosMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const magaluEnviosShipping = parseValue(channelData.shippingCostValue);
      const magaluEnviosFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const magaluEnviosPackaging = parseValue(channelData.packagingCostValue);
      const magaluEnviosOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const magaluEnviosOtherCostValue = parseValue(channelData.otherCostValue);
      const magaluEnviosTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const magaluEnviosRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      const magaluEnviosRebateValue = parseValue(channelData.rebateValue);
      
      if (magaluEnviosCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: magaluEnviosCommission });
      if (magaluEnviosMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: magaluEnviosMarketplaceFee });
      if (magaluEnviosShipping > 0) breakdown.push({ label: 'Frete', value: magaluEnviosShipping });
      if (magaluEnviosFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: magaluEnviosFixedCost });
      if (magaluEnviosPackaging > 0) breakdown.push({ label: 'Embalagem', value: magaluEnviosPackaging });
      if (magaluEnviosOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: magaluEnviosOtherCostPct });
      if (magaluEnviosOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: magaluEnviosOtherCostValue });
      if (magaluEnviosTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: magaluEnviosTacos });
      if (magaluEnviosRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: magaluEnviosRebatePct, isRebate: true });
      if (magaluEnviosRebateValue > 0) breakdown.push({ label: 'Rebate R$', value: magaluEnviosRebateValue, isRebate: true });
      break;

    case 'TIKTOKSHOP_NORMAL':
      // TIKTOKSHOP usa custo geral do produto
      breakdown.push({ label: 'Custo do Produto', value: productCost });
      if (taxCost > 0) breakdown.push({ label: `Impostos s/ Venda (${taxPercent}%)`, value: taxCost });
      if (packCost > 0) breakdown.push({ label: 'Custo de Embalagem', value: packCost });
      
      const tiktokCommission = price * (parseValue(channelData.commissionPercent) / 100);
      const tiktokMarketplaceFee = parseValue(channelData.marketplaceFeeValue);
      const tiktokAffiliateCommission = price * (parseValue(channelData.affiliateCommissionPercent) / 100);
      const tiktokFixedCost = price * (parseValue(channelData.fixedCostPercent) / 100);
      const tiktokShipping = parseValue(channelData.shippingCostValue);
      const tiktokPackaging = parseValue(channelData.packagingCostValue);
      const tiktokOtherCostPct = price * (parseValue(channelData.otherCostPercent) / 100);
      const tiktokOtherCostValue = parseValue(channelData.otherCostValue);
      const tiktokTacos = price * (parseValue(channelData.tacosCostPercent) / 100);
      const tiktokRebatePct = price * (parseValue(channelData.rebatePercent) / 100);
      
      if (tiktokCommission > 0) breakdown.push({ label: `Comissão (${parseValue(channelData.commissionPercent)}%)`, value: tiktokCommission });
      if (tiktokMarketplaceFee > 0) breakdown.push({ label: 'Taxa Fixa Marketplace R$', value: tiktokMarketplaceFee });
      if (tiktokAffiliateCommission > 0) breakdown.push({ label: `Comissão Afiliado (${parseValue(channelData.affiliateCommissionPercent)}%)`, value: tiktokAffiliateCommission });
      if (tiktokFixedCost > 0) breakdown.push({ label: `Custo Fixo (${parseValue(channelData.fixedCostPercent)}%)`, value: tiktokFixedCost });
      if (tiktokShipping > 0) breakdown.push({ label: 'Frete R$', value: tiktokShipping });
      if (tiktokPackaging > 0) breakdown.push({ label: 'Embalagem', value: tiktokPackaging });
      if (tiktokOtherCostPct > 0) breakdown.push({ label: `Outro Custo (${parseValue(channelData.otherCostPercent)}%)`, value: tiktokOtherCostPct });
      if (tiktokOtherCostValue > 0) breakdown.push({ label: 'Outro Custo R$', value: tiktokOtherCostValue });
      if (tiktokTacos > 0) breakdown.push({ label: `TaCos (${parseValue(channelData.tacosCostPercent)}%)`, value: tiktokTacos });
      if (tiktokRebatePct > 0) breakdown.push({ label: `Rebate (${parseValue(channelData.rebatePercent)}%)`, value: tiktokRebatePct, isRebate: true });
      break;
  }
  
  return breakdown;
};