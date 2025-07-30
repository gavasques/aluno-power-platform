/**
 * PRESENTATION: FormalImportSimulatorPresentation
 * Interface de usuário para simulador de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx (1053 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Save, Download, History, FileText } from 'lucide-react';

// Import specialized components
import { SimulationBasicInfo } from '../SimulationBasicInfo/SimulationBasicInfo';

// Import types
import {
  FormalImportSimulation,
  Product,
  Tax,
  Expense,
  SimulationResults,
  UseSimulationDataReturn,
  UseProductsReturn,
  UseTaxesReturn,
  UseExpensesReturn,
  UseCalculationsReturn
} from '../../types';

// ===== INTERFACE TYPES =====
interface SimulationProps {
  simulation: FormalImportSimulation;
  isLoading: boolean;
  error: string | null;
  onUpdateSimulation: (data: Partial<FormalImportSimulation>) => void;
  onSaveSimulation: () => Promise<void>;
  onLoadSimulation: (id: number) => Promise<void>;
  onResetSimulation: () => void;
}

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onRemoveProduct: (id: string) => void;
  onCalculateMetrics: () => void;
}

interface TaxesProps {
  taxes: Tax[];
  onAddTax: (tax: Omit<Tax, 'valor'>) => void;
  onUpdateTax: (index: number, tax: Partial<Tax>) => void;
  onRemoveTax: (index: number) => void;
}

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'valorReal'>) => void;
  onUpdateExpense: (index: number, expense: Partial<Expense>) => void;
  onRemoveExpense: (index: number) => void;
}

interface CalculationsProps {
  results: SimulationResults;
  calculateAll: () => void;
  calculateFob: () => number;
  calculateFreight: () => number;
  calculateInsurance: () => number;
  calculateTotalTaxes: () => number;
  calculateTotalExpenses: () => number;
  calculateFinalCost: () => number;
}

interface FormalImportSimulatorPresentationProps {
  simulationProps: SimulationProps;
  productsProps: ProductsProps;
  taxesProps: TaxesProps;
  expensesProps: ExpensesProps;
  calculationsProps: CalculationsProps;
}

export const FormalImportSimulatorPresentation = ({
  simulationProps,
  productsProps,
  taxesProps,
  expensesProps,
  calculationsProps
}: FormalImportSimulatorPresentationProps) => {
  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState('basic');

  // ===== UTILITY FUNCTIONS =====
  const formatCurrency = (value: number): string => {
    const { formatCurrency: unifiedFormatCurrency } = require('@/lib/utils/unifiedFormatters');
    return unifiedFormatCurrency(value);
  };

  const formatUSD = (value: number): string => {
    const { formatCurrency: unifiedFormatCurrency } = require('@/lib/utils/unifiedFormatters');
    return unifiedFormatCurrency(value, 'USD', 'en-US');
  };

  // ===== ACTIONS =====
  const handleSave = async () => {
    try {
      await simulationProps.onSaveSimulation();
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
    }
  };

  const handleExport = () => {
    // Export logic would be implemented here
    console.log('Exportar simulação');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Simulador de Importação Formal</CardTitle>
                <CardDescription>
                  Calcule custos, impostos e despesas para importação formal
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={simulationProps.simulation.status === 'Aprovada' ? 'default' : 'secondary'}
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {simulationProps.simulation.status}
              </Badge>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={simulationProps.isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  {simulationProps.isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Results Summary */}
      {calculationsProps.results.custoTotalImportacao && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(calculationsProps.results.custoTotalImportacao)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Impostos</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(calculationsProps.results.totalImpostos || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(calculationsProps.results.totalDespesas || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Custo Unitário Médio</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculationsProps.results.custoUnitarioMedio || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <SimulationBasicInfo
            simulation={simulationProps.simulation}
            onUpdate={simulationProps.onUpdateSimulation}
            isLoading={simulationProps.isLoading}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductsTab
            {...productsProps}
            taxaDolar={simulationProps.simulation.taxaDolar}
          />
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <TaxesTab
            {...taxesProps}
            simulation={simulationProps.simulation}
            results={calculationsProps.results}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab
            {...expensesProps}
            taxaDolar={simulationProps.simulation.taxaDolar}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsTab
            simulation={simulationProps.simulation}
            results={calculationsProps.results}
            onExport={handleExport}
          />
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {simulationProps.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">
              <span className="font-medium">Erro:</span> {simulationProps.error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};