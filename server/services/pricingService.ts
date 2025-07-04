// Pricing calculation service for multiple sales channels
export type ChannelType = 'site' | 'amazon_fbm' | 'amazon_fba_onsite' | 'amazon_dba' | 'amazon_fba' | 'ml_me1' | 'ml_flex' | 'ml_envios' | 'ml_full';

// Pricing calculation input interface
export interface ChannelInput {
  price: number; // P
  costItem: number; // Cg
  packCost?: number; // Cb
  inboundFreight?: number; // Cin
  outboundFreight?: number; // Cf
  prepCenter?: number; // Cprep
  fixedFee?: number; // Cfix
  commissionPct?: number; // Com%
  adsPct?: number; // Ads%
  otherPct?: number; // Oth%
  otherValue?: number; // Oth$
  mlFlexRevenue?: number; // Special for ML Flex (positive value)
  taxPct?: number; // Tax% (can be overridden per calculation)
}

// Pricing calculation result interface
export interface ChannelResult {
  price: number;
  totalCosts: number;
  unitCosts: number;
  percentageCosts: number;
  profit: number;
  marginPct: number;
  roiPct: number;
  breakdown: {
    costItem: number;
    packCost: number;
    inboundFreight: number;
    outboundFreight: number;
    prepCenter: number;
    fixedFee: number;
    otherValue: number;
    commission: number;
    ads: number;
    otherPct: number;
    tax: number;
    mlFlexRevenue: number;
  };
}

/**
 * Comprehensive pricing calculation service for multiple sales channels
 * Supports Amazon FBM/FBA, Mercado Livre, and internal site calculations
 */
export class PricingService {
  
  /**
   * Calculate pricing for any channel type
   */
  static calculateChannelPricing(
    channelType: ChannelType,
    input: ChannelInput
  ): ChannelResult {
    switch (channelType) {
      case 'site':
        return this.calculateSitePricing(input);
      case 'amazon_fbm':
        return this.calculateAmazonFBM(input);
      case 'amazon_fba_onsite':
        return this.calculateAmazonFBAOnsite(input);
      case 'amazon_dba':
        return this.calculateAmazonDBA(input);
      case 'amazon_fba':
        return this.calculateAmazonFBA(input);
      case 'ml_me1':
        return this.calculateMLMe1(input);
      case 'ml_flex':
        return this.calculateMLFlex(input);
      case 'ml_envios':
        return this.calculateMLEnvios(input);
      case 'ml_full':
        return this.calculateMLFull(input);
      default:
        throw new Error(`Unsupported channel type: ${channelType}`);
    }
  }

  /**
   * Site pricing calculation
   * Formula: Lucro = P - Cg - Cb - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateSitePricing(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      commissionPct = 0,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight: 0,
        outboundFreight: 0,
        prepCenter: 0,
        fixedFee: 0,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Amazon FBM pricing calculation
   * Formula: Lucro = P - Cg - Cb - Cf - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateAmazonFBM(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      outboundFreight = 0,
      commissionPct = 15, // Default Amazon commission
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + outboundFreight + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight: 0,
        outboundFreight,
        prepCenter: 0,
        fixedFee: 0,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Amazon FBA Onsite pricing calculation
   * Formula: Lucro = P - Cg - Cb - Cin - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateAmazonFBAOnsite(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 15,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight: 0,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Amazon DBA pricing calculation
   * Formula: Lucro = P - (Cg especial) - Cb - Cin - Cf - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateAmazonDBA(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      outboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 15,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + outboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Amazon FBA pricing calculation
   * Formula: Lucro = P - (Cg especial) - Cb - Cin - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateAmazonFBA(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 15,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight: 0,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Mercado Livre ME1 pricing calculation
   * Formula: Lucro = P - Cg - Cb - Cf - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateMLMe1(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      outboundFreight = 0,
      commissionPct = 18, // Default ML commission
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + outboundFreight + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight: 0,
        outboundFreight,
        prepCenter: 0,
        fixedFee: 0,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Mercado Livre Flex pricing calculation
   * Formula: Lucro = P + ML Flex Revenue - Cg - Cb - Cin - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateMLFlex(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 18,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0,
      mlFlexRevenue = 0 // Additional revenue from ML Flex
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    // ML Flex adds revenue, so profit calculation includes it
    const adjustedRevenue = price + mlFlexRevenue;
    const profit = adjustedRevenue - totalCosts;
    const marginPct = adjustedRevenue > 0 ? (profit / adjustedRevenue) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price: adjustedRevenue, // Show total revenue including flex
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight: 0,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue
      }
    };
  }

  /**
   * Mercado Livre Envios pricing calculation
   * Formula: Lucro = P - Cg - Cb - Cin - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateMLEnvios(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 18,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight: 0,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Mercado Livre Full pricing calculation
   * Formula: Lucro = P - (Cg especial) - Cb - Cin - Cprep - Cfix - Com% - Ads% - Oth% - Oth$ - Tax%
   */
  private static calculateMLFull(input: ChannelInput): ChannelResult {
    const {
      price,
      costItem,
      packCost = 0,
      inboundFreight = 0,
      prepCenter = 0,
      fixedFee = 0,
      commissionPct = 18,
      adsPct = 0,
      otherPct = 0,
      otherValue = 0,
      taxPct = 0
    } = input;

    const commission = price * (commissionPct / 100);
    const ads = price * (adsPct / 100);
    const other = price * (otherPct / 100);
    const tax = price * (taxPct / 100);

    const unitCosts = costItem + packCost + inboundFreight + prepCenter + fixedFee + otherValue;
    const percentageCosts = commission + ads + other + tax;
    const totalCosts = unitCosts + percentageCosts;
    
    const profit = price - totalCosts;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    const roiPct = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

    return {
      price,
      totalCosts,
      unitCosts,
      percentageCosts,
      profit,
      marginPct,
      roiPct,
      breakdown: {
        costItem,
        packCost,
        inboundFreight,
        outboundFreight: 0,
        prepCenter,
        fixedFee,
        otherValue,
        commission,
        ads,
        otherPct: other,
        tax,
        mlFlexRevenue: 0
      }
    };
  }

  /**
   * Calculate optimal price to achieve target margin
   */
  static calculateTargetPrice(
    channelType: ChannelType,
    targetMarginPct: number,
    baseCosts: Omit<ChannelInput, 'price'>
  ): number {
    // Start with estimated price and iterate to find optimal
    let estimatedPrice = baseCosts.costItem * 2; // Initial estimate
    let iterations = 0;
    const maxIterations = 20;
    const tolerance = 0.01; // 0.01% tolerance

    while (iterations < maxIterations) {
      const testInput: ChannelInput = { ...baseCosts, price: estimatedPrice };
      const result = this.calculateChannelPricing(channelType, testInput);
      
      const marginDiff = Math.abs(result.marginPct - targetMarginPct);
      
      if (marginDiff <= tolerance) {
        return estimatedPrice;
      }
      
      // Adjust price based on margin difference
      if (result.marginPct < targetMarginPct) {
        estimatedPrice *= 1.05; // Increase price by 5%
      } else {
        estimatedPrice *= 0.95; // Decrease price by 5%
      }
      
      iterations++;
    }
    
    return estimatedPrice;
  }

  /**
   * Get channel configuration metadata
   */
  static getChannelConfig(channelType: ChannelType) {
    const configs = {
      site: {
        name: 'Site Próprio',
        description: 'Vendas através do site próprio',
        defaultCommission: 0,
        fields: ['commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      amazon_fbm: {
        name: 'Amazon FBM',
        description: 'Fulfilled by Merchant',
        defaultCommission: 15,
        fields: ['outboundFreight', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      amazon_fba_onsite: {
        name: 'Amazon FBA Onsite',
        description: 'FBA com estoque próprio',
        defaultCommission: 15,
        fields: ['inboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      amazon_dba: {
        name: 'Amazon DBA',
        description: 'Direct by Amazon',
        defaultCommission: 15,
        fields: ['inboundFreight', 'outboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      amazon_fba: {
        name: 'Amazon FBA',
        description: 'Fulfilled by Amazon',
        defaultCommission: 15,
        fields: ['inboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      ml_me1: {
        name: 'Mercado Livre ME1',
        description: 'Mercado Envios 1',
        defaultCommission: 18,
        fields: ['outboundFreight', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      ml_flex: {
        name: 'Mercado Livre Flex',
        description: 'Mercado Livre Flex',
        defaultCommission: 18,
        fields: ['inboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct', 'mlFlexRevenue']
      },
      ml_envios: {
        name: 'Mercado Livre Envios',
        description: 'Mercado Envios',
        defaultCommission: 18,
        fields: ['inboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      },
      ml_full: {
        name: 'Mercado Livre Full',
        description: 'Mercado Livre Full',
        defaultCommission: 18,
        fields: ['inboundFreight', 'prepCenter', 'fixedFee', 'commissionPct', 'adsPct', 'otherPct', 'otherValue', 'taxPct']
      }
    };

    return configs[channelType];
  }
}