/**
 * Componente de Calculadora de Precificação - Refatorado
 * Separação clara entre lógica de negócio e apresentação
 */

import React from 'react';
import { PricingCalculatorContainer } from './PricingCalculatorContainer';
import { PricingCalculatorPresentation } from './PricingCalculatorPresentation';
import { 
  ProductPricingProps,
  ButtonProps,
  CardProps,
  BadgeProps,
  FormFieldProps
} from '@/types/core/components';
import { 
  Product, 
  CompetitorPrice 
} from '@/types/core/domain';
import { 
  calculatePricing, 
  PricingCalculation, 
  PricingBreakdown 
} from '@/types/core/calculations';

/**
 * Componente principal que conecta lógica e apresentação
 */
export const PricingCalculator: React.FC<ProductPricingProps> = (props) => {
  return (
    <PricingCalculatorContainer {...props}>
      {(containerProps) => (
        <PricingCalculatorPresentation {...containerProps} />
      )}
    </PricingCalculatorContainer>
  );
};

// Tipos específicos para o estado do componente
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

// Tipo para handler de mudança de input
type InputChangeHandler = (value: string) => void; 