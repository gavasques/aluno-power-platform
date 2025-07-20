/**
 * Exemplo de Refatoração: Componente com Lógica de Negócio Misturada
 * 
 * ANTES (Problema):
 * - Lógica de cálculo misturada com apresentação
 * - Chamadas de API diretas no componente
 * - Estado complexo e handlers embutidos
 * - Difícil de testar e reutilizar
 * 
 * DEPOIS (Solução):
 * - Separação clara entre lógica e apresentação
 * - Hooks especializados para lógica de negócio
 * - Componentes de apresentação puros
 * - Fácil de testar e reutilizar
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// ANTES: Componente com Lógica Misturada (PROBLEMA)
// ============================================================================

/**
 * ❌ PROBLEMA: Lógica de negócio misturada com apresentação
 * - Cálculos embutidos no componente
 * - Chamadas de API diretas
 * - Estado complexo
 * - Difícil de testar
 */
export const PricingCalculatorProblematic: React.FC = () => {
  const [costPrice, setCostPrice] = useState(0);
  const [margin, setMargin] = useState(30);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ❌ Lógica de cálculo embutida
  const calculatePrice = useCallback(() => {
    const taxRate = 0.18;
    const totalCost = costPrice * (1 + taxRate);
    const suggestedPrice = totalCost * (1 + margin / 100);
    const profit = suggestedPrice - totalCost;
    const roi = (profit / totalCost) * 100;

    setResult({
      suggestedPrice,
      profit,
      roi,
      totalCost
    });
  }, [costPrice, margin]);

  // ❌ Chamada de API direta no componente
  const saveCalculation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pricing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costPrice, margin, result })
      });
      const data = await response.json();
      console.log('Saved:', data);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  }, [costPrice, margin, result]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Preços (PROBLEMÁTICO)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label>Preço de Custo:</label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Margem (%):</label>
            <Input
              type="number"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
            />
          </div>
          <Button onClick={calculatePrice}>Calcular</Button>
          <Button onClick={saveCalculation} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          {result && (
            <div>
              <p>Preço Sugerido: R$ {result.suggestedPrice?.toFixed(2)}</p>
              <p>Lucro: R$ {result.profit?.toFixed(2)}</p>
              <p>ROI: {result.roi?.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DEPOIS: Separação Container/Presentational (SOLUÇÃO)
// ============================================================================

interface PricingResult {
  suggestedPrice: number;
  profit: number;
  roi: number;
  totalCost: number;
}

interface PricingState {
  costPrice: number;
  margin: number;
  result: PricingResult | null;
  loading: boolean;
}

// ✅ Hook especializado para lógica de cálculo
const usePricingCalculations = () => {
  const [state, setState] = useState<PricingState>({
    costPrice: 0,
    margin: 30,
    result: null,
    loading: false
  });

  const calculatePrice = useCallback(() => {
    const taxRate = 0.18;
    const totalCost = state.costPrice * (1 + taxRate);
    const suggestedPrice = totalCost * (1 + state.margin / 100);
    const profit = suggestedPrice - totalCost;
    const roi = (profit / totalCost) * 100;

    setState(prev => ({
      ...prev,
      result: { suggestedPrice, profit, roi, totalCost }
    }));
  }, [state.costPrice, state.margin]);

  const updateCostPrice = useCallback((value: number) => {
    setState(prev => ({ ...prev, costPrice: value }));
  }, []);

  const updateMargin = useCallback((value: number) => {
    setState(prev => ({ ...prev, margin: value }));
  }, []);

  return {
    ...state,
    calculatePrice,
    updateCostPrice,
    updateMargin
  };
};

// ✅ Hook especializado para operações de API
const usePricingAPI = () => {
  const [loading, setLoading] = useState(false);

  const saveCalculation = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/pricing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveCalculation, loading };
};

// ✅ Container Component - Gerencia lógica de negócio
interface PricingCalculatorContainerProps {
  children: (props: PricingCalculatorRenderProps) => React.ReactElement;
}

interface PricingCalculatorRenderProps {
  costPrice: number;
  margin: number;
  result: PricingResult | null;
  loading: boolean;
  onCostPriceChange: (value: number) => void;
  onMarginChange: (value: number) => void;
  onCalculate: () => void;
  onSave: () => Promise<void>;
}

export const PricingCalculatorContainer: React.FC<PricingCalculatorContainerProps> = ({ children }) => {
  const { costPrice, margin, result, calculatePrice, updateCostPrice, updateMargin } = usePricingCalculations();
  const { saveCalculation, loading } = usePricingAPI();

  const handleSave = useCallback(async () => {
    await saveCalculation({ costPrice, margin, result });
  }, [saveCalculation, costPrice, margin, result]);

  const renderProps: PricingCalculatorRenderProps = {
    costPrice,
    margin,
    result,
    loading,
    onCostPriceChange: updateCostPrice,
    onMarginChange: updateMargin,
    onCalculate: calculatePrice,
    onSave: handleSave
  };

  return children(renderProps);
};

// ✅ Presentation Component - Apenas renderiza UI
interface PricingCalculatorPresentationProps extends PricingCalculatorRenderProps {}

export const PricingCalculatorPresentation: React.FC<PricingCalculatorPresentationProps> = ({
  costPrice,
  margin,
  result,
  loading,
  onCostPriceChange,
  onMarginChange,
  onCalculate,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Preços (REFATORADO)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label>Preço de Custo:</label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => onCostPriceChange(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Margem (%):</label>
            <Input
              type="number"
              value={margin}
              onChange={(e) => onMarginChange(Number(e.target.value))}
            />
          </div>
          <Button onClick={onCalculate}>Calcular</Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          {result && (
            <div>
              <p>Preço Sugerido: R$ {result.suggestedPrice?.toFixed(2)}</p>
              <p>Lucro: R$ {result.profit?.toFixed(2)}</p>
              <p>ROI: {result.roi?.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ Componente principal que conecta container e presentation
export const PricingCalculatorRefactored: React.FC = () => {
  return (
    <PricingCalculatorContainer>
      {(containerProps) => (
        <PricingCalculatorPresentation {...containerProps} />
      )}
    </PricingCalculatorContainer>
  );
};

// ============================================================================
// BENEFÍCIOS DA REFATORAÇÃO:
// ============================================================================

/**
 * ✅ VANTAGENS DA SEPARAÇÃO:
 * 
 * 1. TESTABILIDADE:
 *    - Lógica de negócio isolada em hooks
 *    - Componentes de apresentação puros
 *    - Fácil de testar cada parte separadamente
 * 
 * 2. REUTILIZABILIDADE:
 *    - Hooks podem ser reutilizados em outros componentes
 *    - Componentes de apresentação podem ser reutilizados
 *    - Lógica de API centralizada
 * 
 * 3. MANUTENIBILIDADE:
 *    - Responsabilidades claras e separadas
 *    - Mudanças na lógica não afetam a UI
 *    - Mudanças na UI não afetam a lógica
 * 
 * 4. PERFORMANCE:
 *    - Memoização mais eficiente
 *    - Re-renders otimizados
 *    - Lógica de negócio isolada
 * 
 * 5. ARQUITETURA LIMPA:
 *    - Segue princípios SOLID
 *    - Single Responsibility Principle
 *    - Dependency Inversion Principle
 */ 