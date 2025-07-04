// Shared types for the pricing system

export interface PricingCalculationInput {
  productId: number;
  channelId: number;
  salePrice: number;
  customCosts?: {
    inboundFreight?: number;
    outboundFreight?: number;
    prepCenter?: number;
    fixedCost?: number;
    adsPercentage?: number;
    otherCostPercentage?: number;
    otherCostValue?: number;
    customCommission?: number;
  };
  settings?: {
    useNoInterestSurcharge?: boolean;
    customFreightCalculation?: boolean;
  };
}

export interface PricingCalculationStep {
  step: string;
  description: string;
  calculation: string;
  value: number;
  appliedRate?: number;
}

export interface DetailedCalculationResult {
  profit: number;
  margin: number;
  roi: number;
  totalCost: number;
  salePrice: number;
  breakdown: {
    baseCost: number;
    packagingCost: number;
    freightCost: number;
    commissionCost: number;
    taxCost: number;
    adsCost: number;
    otherCosts: number;
  };
  appliedRates: {
    commissionRate: number;
    freightRate: number;
    taxRate: number;
  };
  calculationSteps: PricingCalculationStep[];
}

export interface FreightRateQuery {
  stateId: number;
  serviceType: string;
  weight: number;
}

export interface CommissionRateQuery {
  categoryId: number;
  channelType: string;
  serviceType: string;
  salePrice: number;
}

// User setup wizard types
export interface UserSetupStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface SetupWizardState {
  currentStep: number;
  steps: UserSetupStep[];
  data: {
    stateId?: number;
    taxPercentage?: number;
    selectedChannels?: number[];
    channelSettings?: Record<number, any>;
  };
}

// Channel configuration types
export interface ChannelConfig {
  id: number;
  channelType: string;
  serviceType: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isUserActive?: boolean;
  customSettings?: any;
}

// Admin configuration types
export interface FreightTableImport {
  stateCode: string;
  serviceType: string;
  weightRanges: Array<{
    from: number;
    to: number;
    price: number;
  }>;
}

export interface CommissionTableImport {
  categoryName: string;
  channelType: string;
  serviceType: string;
  priceRanges: Array<{
    from: number;
    to: number;
    commissionPercentage: number;
  }>;
}

// Product pricing configuration
export interface ProductPricingSettings {
  productId: number;
  channels: Array<{
    channelId: number;
    isActive: boolean;
    pricing: {
      salePrice?: number;
      customCosts?: {
        inboundFreight?: number;
        outboundFreight?: number;
        prepCenter?: number;
        fixedCost?: number;
        adsPercentage?: number;
        otherCostPercentage?: number;
        otherCostValue?: number;
        customCommission?: number;
      };
      settings?: {
        useNoInterestSurcharge?: boolean;
        customFreightCalculation?: boolean;
      };
    };
    lastCalculation?: DetailedCalculationResult;
  }>;
}