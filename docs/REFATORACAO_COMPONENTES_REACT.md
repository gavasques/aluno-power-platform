# Análise e Refatoração de Componentes React

## 📋 Resumo Executivo

Esta análise identifica oportunidades de melhoria na separação entre lógica de negócio e apresentação nos componentes React do projeto. Foram encontrados padrões que violam princípios de arquitetura limpa e dificultam a manutenibilidade, testabilidade e reutilização do código.

## 🔍 Problemas Identificados

### 1. **Componentes com Lógica de Negócio Embutida**

#### Exemplo: `PricingCalculator.tsx` (Original)
```typescript
// ❌ PROBLEMA: Lógica de cálculo misturada com apresentação
const handleCalculate = useCallback(async () => {
  const pricingData = {
    costPrice: state.costPrice,
    marginPercentage: state.marginPercentage,
    // ... mais lógica de negócio
  };
  const result = await calculatePricing(product.id, pricingData);
}, [product, state, onCalculate]);
```

#### Exemplo: `FormalImportSimulator.tsx`
```typescript
// ❌ PROBLEMA: Múltiplas responsabilidades em um componente
const updateProduct = (index: number, field: keyof Product, value: any) => {
  setSimulation(prev => {
    // Lógica de cálculo CBM
    const cbmUnitario = comp > 0 && larg > 0 && alt > 0 ? 
      (comp * larg * alt) / 1000000 : 0;
    // Lógica de rateio
    const totalCBM = updatedProducts.reduce((sum, p) => sum + (p.cbmTotal || 0), 0);
    // ... mais lógica de negócio
  });
};
```

### 2. **Chamadas de API Diretas em Componentes de Apresentação**

#### Exemplo: `UltraEnhanceTool.tsx`
```typescript
// ❌ PROBLEMA: API call direta no componente
const response = await fetch('/api/picsart/ultra-enhance', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: formData
});
```

#### Exemplo: `HtmlDescriptionAgent.tsx`
```typescript
// ❌ PROBLEMA: Lógica de API e negócio misturada
const response = await fetch('/api/ai-providers/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({
    provider: agentConfig.provider,
    model: agentConfig.model,
    // ... mais configurações
  })
});
```

### 3. **Componentes que Poderiam Seguir Container/Presentational**

#### Exemplo: `ChannelsEditor.tsx`
```typescript
// ❌ PROBLEMA: Componente fazendo tudo: UI, lógica de negócio, API calls
React.useEffect(() => {
  watchedValues.channels.forEach((channel, index) => {
    const calculation = calculateChannelProfitability(
      channel.type,
      channel.data as any,
      productBase
    );
    newCalculations[channel.type] = calculation;
  });
  setChannelCalculations(newCalculations);
}, [watchedValues, product]);
```

## ✅ Exemplos de Boas Práticas Identificadas

### 1. **Hooks Especializados para Lógica de Negócio**

#### Exemplo: `useCalculations.ts`
```typescript
// ✅ Lógica de cálculo isolada em hook
export const useCalculations = (simulation: SimulacaoCompleta): CalculatedResults => {
  return useMemo(() => {
    // Pure functions para cálculos
    const produtosCalculados = produtos.map(p => 
      calculateProductCosts(p, cfg, globalTotals)
    );
    return { produtos: produtosCalculados, totals };
  }, [simulation]);
};
```

### 2. **Hooks para Operações de API**

#### Exemplo: `useSimulationAPI.ts`
```typescript
// ✅ API operations isoladas em hooks
export const useSimulationAPI = () => {
  const useSaveSimulation = () => {
    return useMutation({
      mutationFn: (data: SimulacaoCompleta) => {
        return apiRequest('/api/simulations/import', {
          method: 'POST', 
          body: data,
        });
      },
      onSuccess: (savedSimulation) => {
        queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
        toast({ title: "Simulação salva com sucesso!" });
      }
    });
  };
};
```

### 3. **Componentes Refatorados com Separação Clara**

#### Exemplo: `ImportacaoSimplificadaRefactored.tsx`
```typescript
// ✅ Separação clara de responsabilidades
export default function ImportacaoSimplificadaRefactored() {
  // Hooks especializados
  const { uiState, setUIState, actions: uiActions } = useUIState();
  const { useSimulations, useSaveSimulation } = useSimulationAPI();
  const calculatedResults = useCalculations(activeSimulation);
  const validation = useValidation(activeSimulation);
  
  // Componentes de apresentação puros
  return (
    <div>
      <SimulationHeader {...componentProps} />
      <ConfigurationPanel {...componentProps} />
      <ProductTable {...componentProps} />
      <SummaryPanel {...componentProps} />
    </div>
  );
}
```

## 🚀 Recomendações de Refatoração

### 1. **Refatorar `PricingCalculator.tsx`**

**Problema:** Mistura lógica de cálculo com apresentação

**Solução:** Separar em Container e Presentation components

```typescript
// ✅ Container Component - Gerencia lógica de negócio
export const PricingCalculatorContainer: React.FC<ContainerProps> = ({ children }) => {
  const { state, handlers } = usePricingCalculations();
  const { saveCalculation, loading } = usePricingAPI();
  
  return children({ state, handlers, loading });
};

// ✅ Presentation Component - Apenas renderiza UI
export const PricingCalculatorPresentation: React.FC<PresentationProps> = (props) => {
  return (
    <div>
      {/* Apenas renderização, sem lógica de negócio */}
    </div>
  );
};

// ✅ Componente principal que conecta os dois
export const PricingCalculator: React.FC = () => {
  return (
    <PricingCalculatorContainer>
      {(containerProps) => (
        <PricingCalculatorPresentation {...containerProps} />
      )}
    </PricingCalculatorContainer>
  );
};
```

### 2. **Criar Hooks Especializados para Lógica de Negócio**

#### Para Cálculos Complexos
```typescript
// ✅ Hook para cálculos de importação
export const useImportCalculations = (simulation: ImportSimulation) => {
  return useMemo(() => {
    // Lógica de cálculo isolada
    const calculations = calculateImportCosts(simulation);
    return calculations;
  }, [simulation]);
};
```

#### Para Operações de API
```typescript
// ✅ Hook para operações de API
export const useProductAPI = () => {
  const queryClient = useQueryClient();
  
  const saveProduct = useMutation({
    mutationFn: (product: Product) => 
      apiRequest('/api/products', { method: 'POST', body: product }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    }
  });
  
  return { saveProduct };
};
```

### 3. **Refatorar Componentes com Múltiplas Responsabilidades**

#### Exemplo: `FormalImportSimulator.tsx`
```typescript
// ✅ Separar em hooks especializados
const useImportSimulation = () => {
  // Lógica de simulação
};

const useImportCalculations = () => {
  // Lógica de cálculos
};

const useImportAPI = () => {
  // Lógica de API
};

// ✅ Componente principal limpo
export const FormalImportSimulator: React.FC = () => {
  const simulation = useImportSimulation();
  const calculations = useImportCalculations();
  const api = useImportAPI();
  
  return (
    <ImportSimulationContainer>
      {(props) => <ImportSimulationPresentation {...props} />}
    </ImportSimulationContainer>
  );
};
```

## 📊 Benefícios da Refatoração

### 1. **Testabilidade**
- ✅ Lógica de negócio isolada em hooks
- ✅ Componentes de apresentação puros
- ✅ Fácil de testar cada parte separadamente
- ✅ Mocks mais simples e específicos

### 2. **Reutilização**
- ✅ Hooks podem ser reutilizados em outros componentes
- ✅ Componentes de apresentação podem ser reutilizados
- ✅ Lógica de API centralizada
- ✅ Menos duplicação de código

### 3. **Manutenibilidade**
- ✅ Responsabilidades claras e separadas
- ✅ Mudanças na lógica não afetam a UI
- ✅ Mudanças na UI não afetam a lógica
- ✅ Código mais legível e organizado

### 4. **Performance**
- ✅ Memoização mais eficiente
- ✅ Re-renders otimizados
- ✅ Lógica de negócio isolada
- ✅ Menos re-renders desnecessários

### 5. **Arquitetura Limpa**
- ✅ Segue princípios SOLID
- ✅ Single Responsibility Principle
- ✅ Dependency Inversion Principle
- ✅ Open/Closed Principle

## 🎯 Priorização de Refatoração

### **Alta Prioridade**
1. `PricingCalculator.tsx` - Componente crítico com lógica complexa
2. `FormalImportSimulator.tsx` - Componente grande com múltiplas responsabilidades
3. `ChannelsEditor.tsx` - Componente com lógica de negócio embutida

### **Média Prioridade**
4. `UltraEnhanceTool.tsx` - Chamadas de API diretas
5. `HtmlDescriptionAgent.tsx` - Lógica de API misturada
6. `ProductPricingForm.tsx` - Componente com múltiplas responsabilidades

### **Baixa Prioridade**
7. Componentes menores que seguem padrões similares
8. Componentes utilitários que podem ser melhorados

## 🛠️ Estratégia de Implementação

### **Fase 1: Preparação**
1. Criar hooks especializados para lógica de negócio
2. Criar hooks para operações de API
3. Definir interfaces e tipos claros

### **Fase 2: Refatoração Gradual**
1. Começar pelos componentes de alta prioridade
2. Refatorar um componente por vez
3. Manter funcionalidade existente durante a transição

### **Fase 3: Consolidação**
1. Aplicar padrões aprendidos em outros componentes
2. Criar documentação e exemplos
3. Estabelecer padrões de código

## 📝 Checklist de Refatoração

### **Para Cada Componente:**
- [ ] Identificar lógica de negócio embutida
- [ ] Extrair hooks especializados
- [ ] Separar em Container e Presentation components
- [ ] Criar interfaces claras
- [ ] Adicionar testes unitários
- [ ] Documentar mudanças

### **Para Hooks Especializados:**
- [ ] Lógica de cálculo isolada
- [ ] Operações de API centralizadas
- [ ] Estado bem tipado
- [ ] Memoização apropriada
- [ ] Tratamento de erros

### **Para Componentes de Apresentação:**
- [ ] Apenas renderização
- [ ] Props bem tipadas
- [ ] Sem lógica de negócio
- [ ] Reutilizáveis
- [ ] Testáveis

## 🔄 Exemplos de Refatoração Implementados

### 4.1 PricingCalculator (Refatorado)

O componente `PricingCalculator` foi refatorado seguindo o padrão container/presentational:

**Estrutura de Arquivos:**
```
components/calculations/
├── PricingCalculator.tsx              # Componente principal
├── PricingCalculatorContainer.tsx     # Container (lógica)
├── PricingCalculatorPresentation.tsx  # Presentation (UI)
└── PricingCalculatorExample.tsx       # Exemplo completo
```

**Container (Lógica de Negócio):**
```tsx
export const PricingCalculatorContainer = () => {
  const [state, setState] = useState<PricingState>({
    costPrice: 0,
    marginPercentage: 30,
    taxRate: 18,
    // ... outros estados
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PricingCalculation | null>(null);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    try {
      const calculation = await calculatePricing(state);
      setResults(calculation);
    } catch (error) {
      console.error('Erro no cálculo:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  const handlers = {
    updateField: (field: keyof PricingState, value: number) => {
      setState(prev => ({ ...prev, [field]: value }));
    },
    handleCalculate,
    resetForm: () => {
      setState(initialState);
      setResults(null);
    }
  };

  return (
    <PricingCalculatorPresentation
      values={state}
      results={results}
      isLoading={isLoading}
      handlers={handlers}
    />
  );
};
```

**Presentation (UI Pura):**
```tsx
export const PricingCalculatorPresentation = ({
  values,
  results,
  isLoading,
  handlers
}: PricingCalculatorPresentationProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Calculadora de Preços</CardTitle>
        <CardDescription>
          Calcule preços com margem e impostos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="costPrice">Preço de Custo</Label>
            <Input
              id="costPrice"
              type="number"
              value={values.costPrice}
              onChange={(e) => handlers.updateField('costPrice', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="marginPercentage">Margem (%)</Label>
            <Input
              id="marginPercentage"
              type="number"
              value={values.marginPercentage}
              onChange={(e) => handlers.updateField('marginPercentage', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Botão de cálculo */}
        <Button 
          onClick={handlers.handleCalculate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Calculando...' : 'Calcular Preço'}
        </Button>

        {/* Resultados */}
        {results && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Preço de Venda:</span>
              <span className="font-bold">{formatCurrency(results.sellingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Margem:</span>
              <span>{formatCurrency(results.margin)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impostos:</span>
              <span>{formatCurrency(results.taxes)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### 4.2 FormalImportSimulator (Refatorado)

O componente `FormalImportSimulator` foi completamente refatorado seguindo o padrão container/presentational:

**Estrutura de Arquivos:**
```
FormalImportSimulator/
├── hooks/
│   ├── useFormalImportState.ts      # Gerenciamento de estado
│   ├── useFormalImportAPI.ts        # Operações de API
│   ├── useProductOperations.ts      # Operações de produtos
│   └── useTaxAndExpenseOperations.ts # Operações de impostos/despesas
├── FormalImportSimulatorContainer.tsx    # Container principal
├── FormalImportSimulatorPresentation.tsx # Componente de apresentação
└── types.ts                           # Tipos das props
```

**Container (Lógica de Negócio):**
```tsx
export const FormalImportSimulatorContainer = ({ simulationId }) => {
  // Hooks para gerenciamento de estado e operações
  const {
    simulation,
    setSimulation,
    activeTab,
    setActiveTab,
    // ... outros estados
  } = useFormalImportState(simulationId);

  const {
    handleCalculate,
    handleSave,
    handleDelete,
    isCalculating,
    isSaving,
    isDeleting
  } = useFormalImportAPI();

  const {
    addProduct,
    updateProduct,
    removeProduct,
    calculateProductTotals
  } = useProductOperations(simulation, setSimulation);

  const {
    calculateTaxEstimate,
    addCustomTax,
    removeCustomTax,
    // ... outras operações
  } = useTaxAndExpenseOperations(simulation, setSimulation);

  // Cálculos derivados
  const { totalCBM, totalUSD } = useMemo(() => {
    return calculateProductTotals();
  }, [simulation.produtos]);

  return (
    <FormalImportSimulatorPresentation
      // Estado
      simulation={simulation}
      activeTab={activeTab}
      isLoading={isLoading}
      isCalculating={isCalculating}
      isSaving={isSaving}
      isDeleting={isDeleting}
      
      // Cálculos
      totalCBM={totalCBM}
      totalUSD={totalUSD}
      totalTaxes={totalTaxes}
      totalExpenses={totalExpenses}
      
      // Handlers
      handleCalculateClick={handleCalculate}
      handleSaveClick={handleSave}
      handleDeleteClick={handleDelete}
      
      // Operações
      addProduct={addProduct}
      updateProduct={updateProduct}
      removeProduct={removeProduct}
      // ... outras props
    />
  );
};
```

**Hooks Customizados:**

```tsx
// useFormalImportState.ts
export const useFormalImportState = (simulationId?: string | null) => {
  const [simulation, setSimulation] = useState<FormalImportSimulation>({...});
  const [activeTab, setActiveTab] = useState("info");
  // ... outros estados

  // Load existing simulation
  const { data: existingSimulation, isLoading } = useQuery({...});

  return {
    simulation,
    setSimulation,
    updateSimulation,
    activeTab,
    setActiveTab,
    isLoading,
    // ... outros retornos
  };
};

// useFormalImportAPI.ts
export const useFormalImportAPI = () => {
  const calculateMutation = useMutation({...});
  const saveMutation = useMutation({...});
  const deleteMutation = useMutation({...});

  return {
    handleCalculate,
    handleSave,
    handleDelete,
    isCalculating: calculateMutation.isPending,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

// useProductOperations.ts
export const useProductOperations = (simulation, setSimulation) => {
  const addProduct = () => {
    const newProduct = { id: Date.now().toString(), ... };
    setSimulation({...simulation, produtos: [...simulation.produtos, newProduct]});
  };

  const updateProduct = (index, field, value) => {
    // Lógica de atualização com cálculos automáticos
  };

  return { addProduct, updateProduct, removeProduct, calculateProductTotals };
};
```

## 📚 Recursos Adicionais

- [React Patterns: Container/Presentational](https://reactpatterns.com/#container-component)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [SOLID Principles in React](https://blog.logrocket.com/solid-principles-react/)

---

**Conclusão:** A refatoração proposta melhorará significativamente a qualidade do código, facilitando manutenção, testes e evolução do sistema. A implementação gradual permitirá manter a funcionalidade existente enquanto melhora a arquitetura.

Os exemplos implementados demonstram como aplicar o padrão container/presentational de forma efetiva, separando claramente as responsabilidades e criando componentes mais modulares e reutilizáveis. 