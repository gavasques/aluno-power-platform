import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, Copy, Save, Download, ArrowLeft, ArrowRight, X, History, Check, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { 
  formatCurrency, 
  formatUSD, 
  formatPercentage, 
  formatCBM,
  calculateTaxEstimate 
} from '@/utils/formal-import-utils';
import { 
  FormalImportSimulation, 
  DEFAULT_TAXES, 
  DEFAULT_EXPENSES, 
  DEFAULT_TAX_NAMES 
} from '@/types/formal-import';

const FEATURE_CODE = 'formal-import-simulator';

// Componente memoizado para inputs
const OptimizedInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  className = "" 
}: {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <Input
      type={type}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className={`no-spin ${className}`}
    />
  </div>
));

// Componente memoizado para produtos
const ProductRow = React.memo(({ 
  product, 
  index, 
  onUpdate, 
  onRemove 
}: {
  product: any;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}) => (
  <TableRow>
    <TableCell>
      <Input
        value={product.nome}
        onChange={(e) => onUpdate(index, 'nome', e.target.value)}
        className="w-32"
      />
    </TableCell>
    <TableCell>
      <Input
        value={product.ncm}
        onChange={(e) => onUpdate(index, 'ncm', e.target.value)}
        className="w-24"
      />
    </TableCell>
    <TableCell>
      <Input
        type="number"
        className="w-16 no-spin"
        value={product.quantidade || ''}
        onChange={(e) => onUpdate(index, 'quantidade', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
        placeholder="Qtd"
      />
    </TableCell>
    <TableCell>
      <Input
        type="number"
        step="0.01"
        className="w-20 no-spin"
        value={product.valorUnitarioUsd || ''}
        onChange={(e) => onUpdate(index, 'valorUnitarioUsd', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
        placeholder="USD"
      />
    </TableCell>
    <TableCell>
      <Input
        type="number"
        className="w-16 no-spin"
        value={product.comprimento || ''}
        onChange={(e) => onUpdate(index, 'comprimento', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
        placeholder="cm"
      />
    </TableCell>
    <TableCell>
      <Input
        type="number"
        className="w-16 no-spin"
        value={product.largura || ''}
        onChange={(e) => onUpdate(index, 'largura', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
        placeholder="cm"
      />
    </TableCell>
    <TableCell>
      <Input
        type="number"
        className="w-16 no-spin"
        value={product.altura || ''}
        onChange={(e) => onUpdate(index, 'altura', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
        placeholder="cm"
      />
    </TableCell>
    <TableCell>
      <Badge variant="outline">
        {product.cbmUnitario !== undefined && product.cbmUnitario >= 0 ? formatCBM(product.cbmUnitario) : '-'}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge variant="outline">
        {product.cbmTotal !== undefined && product.cbmTotal >= 0 ? formatCBM(product.cbmTotal) : '-'}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge variant="outline">
        {product.percentualContainer !== undefined && product.percentualContainer >= 0 ? formatPercentage(product.percentualContainer) : '-'}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge variant="outline" className="font-bold text-blue-600">
        {product.custoUnitario ? formatCurrency(product.custoUnitario) : '-'}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge variant="outline" className="font-bold">
        {product.custoTotal ? formatCurrency(product.custoTotal) : '-'}
      </Badge>
    </TableCell>
    <TableCell>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRemove(index)}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </TableCell>
  </TableRow>
));

interface FormalImportSimulatorOptimizedProps {
  simulation: FormalImportSimulation;
  onSimulationChange: (simulation: FormalImportSimulation) => void;
  onCalculate: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isCalculating?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export const FormalImportSimulatorOptimized: React.FC<FormalImportSimulatorOptimizedProps> = React.memo(({
  simulation,
  onSimulationChange,
  onCalculate,
  onSave,
  onDelete,
  isLoading = false,
  isCalculating = false,
  isSaving = false,
  isDeleting = false
}) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Estados locais otimizados
  const [activeTab, setActiveTab] = React.useState("info");
  const [showAddTaxDialog, setShowAddTaxDialog] = React.useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = React.useState(false);
  const [newTax, setNewTax] = React.useState({ nome: "", aliquota: 0, baseCalculo: "fob_frete_seguro", valor: 0 });
  const [newExpense, setNewExpense] = React.useState({ nome: "", valorDolar: 0, valorReal: 0 });

  // Funções otimizadas
  const updateSimulation = useCallback((updates: Partial<FormalImportSimulation>) => {
    onSimulationChange({ ...simulation, ...updates });
  }, [simulation, onSimulationChange]);

  const updateProduct = useCallback((index: number, field: string, value: any) => {
    const updatedProducts = (simulation.produtos || []).map((produto, i) => {
      if (i === index) {
        return { ...produto, [field]: value };
      }
      return produto;
    });
    updateSimulation({ produtos: updatedProducts });
  }, [simulation.produtos, updateSimulation]);

  const addProduct = useCallback(() => {
    const newProduct = {
      id: Date.now().toString(),
      nome: `Produto ${(simulation.produtos || []).length + 1}`,
      ncm: "",
      quantidade: 1,
      valorUnitarioUsd: 0,
      comprimento: 0,
      largura: 0,
      altura: 0
    };
    updateSimulation({ produtos: [...(simulation.produtos || []), newProduct] });
  }, [simulation.produtos, updateSimulation]);

  const removeProduct = useCallback((index: number) => {
    updateSimulation({ 
      produtos: (simulation.produtos || []).filter((_, i) => i !== index) 
    });
  }, [simulation.produtos, updateSimulation]);

  // Cálculos memoizados
  const totalCBM = useMemo(() => {
    return (simulation.produtos || []).reduce((sum, p) => sum + (p.cbmTotal || 0), 0);
  }, [simulation.produtos]);

  const totalCost = useMemo(() => {
    return (simulation.resultados || {}).custoTotal || 0;
  }, [simulation.resultados]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Simulador de Importação Formal</h1>
            <p className="text-muted-foreground">Cálculo com rateio por CBM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {simulation.codigoSimulacao && (
            <Badge variant="secondary">{simulation.codigoSimulacao}</Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
          >
            <History className="h-4 w-4 mr-2" />
            Voltar à Lista
          </Button>
          <Button onClick={onCalculate} disabled={isCalculating}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Concluir
            </Button>
            
            {onDelete && (
              <Button 
                onClick={onDelete} 
                disabled={isDeleting}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="info">1. Info Inicial</TabsTrigger>
              <TabsTrigger value="insurance">2. Seguro</TabsTrigger>
              <TabsTrigger value="taxes">3. Impostos</TabsTrigger>
              <TabsTrigger value="expenses">4. Despesas</TabsTrigger>
              <TabsTrigger value="products">5. Produtos</TabsTrigger>
              <TabsContent value="results">6. Resultados</TabsContent>
              <TabsTrigger value="total">7. Total</TabsTrigger>
            </TabsList>

            {/* Seção 1: Informações Iniciais */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Iniciais</CardTitle>
                  <CardDescription>
                    Configure os dados básicos da importação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OptimizedInput
                      label="Nome da Simulação"
                      value={simulation.nome || ""}
                      onChange={(value) => updateSimulation({ nome: String(value) })}
                    />
                    <OptimizedInput
                      label="Fornecedor"
                      value={simulation.fornecedor || ""}
                      onChange={(value) => updateSimulation({ fornecedor: String(value) })}
                    />
                    <OptimizedInput
                      label="Despachante"
                      value={simulation.despachante || ""}
                      onChange={(value) => updateSimulation({ despachante: String(value) })}
                    />
                    <OptimizedInput
                      label="Agente de Cargas"
                      value={simulation.agenteCargas || ""}
                      onChange={(value) => updateSimulation({ agenteCargas: String(value) })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OptimizedInput
                      label="Taxa do Dólar (R$)"
                      value={simulation.taxaDolar}
                      onChange={(value) => updateSimulation({ taxaDolar: Number(value) })}
                      type="number"
                      placeholder="Ex: 5.50"
                    />
                    <OptimizedInput
                      label="Valor FOB (USD)"
                      value={simulation.valorFobDolar}
                      onChange={(value) => updateSimulation({ valorFobDolar: Number(value) })}
                      type="number"
                      placeholder="Ex: 1000.00"
                    />
                    <OptimizedInput
                      label="Valor Frete (USD)"
                      value={simulation.valorFreteDolar}
                      onChange={(value) => updateSimulation({ valorFreteDolar: Number(value) })}
                      type="number"
                      placeholder="Ex: 500.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 5: Produtos */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>
                    Configure os produtos com dimensões para cálculo do CBM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(simulation.produtos || []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto configurado. Os produtos serão adicionados automaticamente quando você calcular a simulação.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>NCM</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Valor Unit. USD</TableHead>
                            <TableHead>Comp.(cm)</TableHead>
                            <TableHead>Larg.(cm)</TableHead>
                            <TableHead>Alt.(cm)</TableHead>
                            <TableHead className="bg-blue-100">CBM Unit.</TableHead>
                            <TableHead className="bg-green-100">CBM Total</TableHead>
                            <TableHead className="bg-yellow-100">% Container</TableHead>
                            <TableHead>Custo Unitário</TableHead>
                            <TableHead>Custo Total</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(simulation.produtos || []).map((produto, index) => (
                            <ProductRow
                              key={produto.id || index}
                              product={produto}
                              index={index}
                              onUpdate={updateProduct}
                              onRemove={removeProduct}
                            />
                          ))}
                        </TableBody>
                      </Table>

                      {/* Botão para adicionar produto */}
                      <div className="mt-4 flex justify-between items-center">
                        <Button onClick={addProduct}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Produto
                        </Button>
                        
                        {/* Resumo totais */}
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">CBM Total</div>
                            <div className="font-bold">
                              {formatCBM(totalCBM)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Custo Total</div>
                            <div className="font-bold text-blue-600">
                              {formatCurrency(totalCost)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Navigation and Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["info", "insurance", "taxes", "expenses", "products", "results", "total"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "info"}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {/* Central Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!totalCost}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>

              <Button
                onClick={() => {
                  const tabs = ["info", "insurance", "taxes", "expenses", "products", "results", "total"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                disabled={activeTab === "total"}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}); 