/**
 * Container Component para PricingCalculator
 * Gerencia toda a lógica de negócio, estado e operações
 */

import React, { useState, useCallback } from 'react';
import { 
  calculatePricing, 
  PricingCalculation 
} from '@/types/core/calculations';
import { 
  CompetitorPrice 
} from '@/types/core/domain';
import { 
  ProductPricingProps,
  ButtonProps
} from '@/types/core/components';

interface PricingCalculatorState {
  costPrice: number;
  competitorPrices: CompetitorPrice[];
  marginPercentage: number;
  taxRate: number;
  shippingCost: number;
  platformFees: number;
  isCalculating: boolean;
  error: string | null;
}

interface PricingCalculatorContainerProps extends ProductPricingProps {
  children: (props: PricingCalculatorContainerRenderProps) => React.ReactElement;
}

export interface PricingCalculatorContainerRenderProps {
  // State
  state: PricingCalculatorState;
  calculation: PricingCalculation | null;
  
  // Event handlers
  onCostPriceChange: (value: string) => void;
  onMarginChange: (value: string) => void;
  onTaxRateChange: (value: string) => void;
  onShippingCostChange: (value: string) => void;
  onPlatformFeesChange: (value: string) => void;
  onCalculate: () => Promise<void>;
  onSave: () => Promise<void>;
  onAddCompetitorPrice: () => void;
  onCompetitorPriceChange: (index: number, value: string) => void;
  onRemoveCompetitorPrice: (index: number) => void;
  onCompetitorNameChange: (index: number, value: string) => void;
  
  // Computed values
  isCalculating: boolean;
  hasError: boolean;
  errorMessage: string | null;
  canCalculate: boolean;
  canSave: boolean;
}

export const PricingCalculatorContainer: React.FC<PricingCalculatorContainerProps> = ({
  product,
  calculation,
  onCalculate,
  onSave,
  loading = false,
  children
}) => {
  // State tipado com interfaces específicas
  const [state, setState] = useState<PricingCalculatorState>({
    costPrice: product?.costPrice || 0,
    competitorPrices: [],
    marginPercentage: 30,
    taxRate: 18,
    shippingCost: 0,
    platformFees: 0,
    isCalculating: false,
    error: null
  });

  // Handlers tipados para eventos específicos
  const handleCostPriceChange = useCallback((value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      costPrice: numericValue,
      error: null
    }));
  }, []);

  const handleMarginChange = useCallback((value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      marginPercentage: numericValue,
      error: null
    }));
  }, []);

  const handleTaxRateChange = useCallback((value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      taxRate: numericValue,
      error: null
    }));
  }, []);

  const handleShippingCostChange = useCallback((value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      shippingCost: numericValue,
      error: null
    }));
  }, []);

  const handlePlatformFeesChange = useCallback((value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      platformFees: numericValue,
      error: null
    }));
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!product) {
      setState(prev => ({
        ...prev,
        error: 'Produto não encontrado'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isCalculating: true,
      error: null
    }));

    try {
      const pricingData = {
        costPrice: state.costPrice,
        marginPercentage: state.marginPercentage,
        taxRate: state.taxRate,
        shippingCost: state.shippingCost,
        platformFees: state.platformFees,
        competitorPrices: state.competitorPrices
      };

      const result = await calculatePricing(product.id, pricingData);
      
      if (onCalculate) {
        onCalculate(product.id);
      }

      setState(prev => ({
        ...prev,
        isCalculating: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCalculating: false,
        error: error instanceof Error ? error.message : 'Erro ao calcular preço'
      }));
    }
  }, [product, state, onCalculate]);

  const handleSave = useCallback(async () => {
    if (!calculation) {
      setState(prev => ({
        ...prev,
        error: 'Nenhum cálculo disponível para salvar'
      }));
      return;
    }

    try {
      if (onSave) {
        await onSave(calculation);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao salvar cálculo'
      }));
    }
  }, [calculation, onSave]);

  const handleAddCompetitorPrice = useCallback(() => {
    const newCompetitorPrice: CompetitorPrice = {
      id: Date.now(),
      name: `Concorrente ${state.competitorPrices.length + 1}`,
      price: 0,
      source: 'manual',
      lastUpdated: new Date()
    };

    setState(prev => ({
      ...prev,
      competitorPrices: [...prev.competitorPrices, newCompetitorPrice]
    }));
  }, [state.competitorPrices]);

  const handleCompetitorPriceChange = useCallback((index: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      competitorPrices: prev.competitorPrices.map((cp, i) => 
        i === index ? { ...cp, price: numericValue } : cp
      )
    }));
  }, []);

  const handleCompetitorNameChange = useCallback((index: number, value: string) => {
    setState(prev => ({
      ...prev,
      competitorPrices: prev.competitorPrices.map((cp, i) => 
        i === index ? { ...cp, name: value } : cp
      )
    }));
  }, []);

  const handleRemoveCompetitorPrice = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      competitorPrices: prev.competitorPrices.filter((_, i) => i !== index)
    }));
  }, []);

  // Computed values
  const isCalculating = state.isCalculating || loading;
  const hasError = !!state.error;
  const errorMessage = state.error;
  const canCalculate = !!product && state.costPrice > 0;
  const canSave = !!calculation && !isCalculating;

  const containerProps: PricingCalculatorContainerRenderProps = {
    state,
    calculation: calculation || null,
    onCostPriceChange: handleCostPriceChange,
    onMarginChange: handleMarginChange,
    onTaxRateChange: handleTaxRateChange,
    onShippingCostChange: handleShippingCostChange,
    onPlatformFeesChange: handlePlatformFeesChange,
    onCalculate: handleCalculate,
    onSave: handleSave,
    onAddCompetitorPrice: handleAddCompetitorPrice,
    onCompetitorPriceChange: handleCompetitorPriceChange,
    onRemoveCompetitorPrice: handleRemoveCompetitorPrice,
    onCompetitorNameChange: handleCompetitorNameChange,
    isCalculating,
    hasError,
    errorMessage,
    canCalculate,
    canSave
  };

  return children(containerProps);
}; 