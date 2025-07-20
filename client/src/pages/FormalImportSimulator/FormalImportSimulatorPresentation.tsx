import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Plus, Trash2, Copy, Save, Download, ArrowLeft, ArrowRight, X, History, Check, FileText } from 'lucide-react';
import { FormalImportSimulatorPresentationProps } from './types';

export const FormalImportSimulatorPresentation = ({
  // Estado
  simulation,
  activeTab,
  showAddTaxDialog,
  showAddExpenseDialog,
  newTax,
  newExpense,
  isLoading,
  isCalculating,
  isSaving,
  isDeleting,
  
  // Cálculos
  totalCBM,
  totalUSD,
  totalTaxes,
  totalExpenses,
  
  // Funções de formatação
  formatCurrency,
  formatUSD,
  formatPercentage,
  
  // Handlers de estado
  setActiveTab,
  setShowAddTaxDialog,
  setShowAddExpenseDialog,
  setNewTax,
  setNewExpense,
  
  // Handlers de operações
  handleSimulationUpdate,
  handleCalculateClick,
  handleSaveClick,
  handleDeleteClick,
  handleAddTaxClick,
  handleAddExpenseClick,
  
  // Operações de produtos
  addProduct,
  updateProduct,
  removeProduct,
  
  // Operações de impostos e despesas
  calculateTaxEstimate,
  removeCustomTax,
  updateTax,
  removeExpense,
  updateExpense,
  handleExpenseUSDChange,
  handleExpenseRealChange,
  
  // Constantes
  defaultTaxNames
}: FormalImportSimulatorPresentationProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Carregando simulação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Simulador de Importação Formal</h1>
          <p className="text-muted-foreground">Calcule custos de importação com precisão</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCalculateClick}
            disabled={isCalculating}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculando...' : 'Calcular'}
          </Button>
          
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        {/* Informações Básicas */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Simulação</CardTitle>
              <CardDescription>Configure os dados básicos da importação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Simulação</Label>
                  <Input
                    id="nome"
                    value={simulation.nome}
                    onChange={(e) => handleSimulationUpdate('nome', e.target.value)}
                    placeholder="Digite o nome da simulação"
                  />
                </div>
                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={simulation.fornecedor}
                    onChange={(e) => handleSimulationUpdate('fornecedor', e.target.value)}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxaDolar">Taxa do Dólar</Label>
                  <Input
                    id="taxaDolar"
                    type="number"
                    step="0.01"
                    value={simulation.taxaDolar}
                    onChange={(e) => handleSimulationUpdate('taxaDolar', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
                  <Input
                    id="valorFobDolar"
                    type="number"
                    step="0.01"
                    value={simulation.valorFobDolar}
                    onChange={(e) => handleSimulationUpdate('valorFobDolar', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="valorFreteDolar">Frete (USD)</Label>
                  <Input
                    id="valorFreteDolar"
                    type="number"
                    step="0.01"
                    value={simulation.valorFreteDolar}
                    onChange={(e) => handleSimulationUpdate('valorFreteDolar', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Gerencie os produtos da importação</CardDescription>
                </div>
                <Button onClick={addProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulation.produtos.map((produto, index) => (
                  <Card key={produto.id || index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={produto.nome}
                            onChange={(e) => updateProduct(index, 'nome', e.target.value)}
                            placeholder="Nome do produto"
                          />
                        </div>
                        <div>
                          <Label>NCM</Label>
                          <Input
                            value={produto.ncm}
                            onChange={(e) => updateProduct(index, 'ncm', e.target.value)}
                            placeholder="Código NCM"
                          />
                        </div>
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={produto.quantidade}
                            onChange={(e) => updateProduct(index, 'quantidade', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Valor Unit. (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={produto.valorUnitarioUsd}
                            onChange={(e) => updateProduct(index, 'valorUnitarioUsd', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Comprimento (cm)</Label>
                          <Input
                            type="number"
                            value={produto.comprimento}
                            onChange={(e) => updateProduct(index, 'comprimento', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Largura (cm)</Label>
                          <Input
                            type="number"
                            value={produto.largura}
                            onChange={(e) => updateProduct(index, 'largura', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Altura (cm)</Label>
                          <Input
                            type="number"
                            value={produto.altura}
                            onChange={(e) => updateProduct(index, 'altura', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          CBM: {produto.cbmTotal?.toFixed(6) || 0} m³ | 
                          Total: {formatUSD(produto.valorTotalUSD || 0)}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total CBM:</span> {totalCBM.toFixed(6)} m³
                  </div>
                  <div>
                    <span className="font-medium">Total USD:</span> {formatUSD(totalUSD)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impostos */}
        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Impostos</CardTitle>
                  <CardDescription>Configure os impostos aplicáveis</CardDescription>
                </div>
                <Button onClick={() => setShowAddTaxDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Imposto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imposto</TableHead>
                    <TableHead>Alíquota (%)</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.impostos.map((tax, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={tax.nome}
                          onChange={(e) => updateTax(index, 'nome', e.target.value)}
                          disabled={defaultTaxNames.includes(tax.nome)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={tax.aliquota}
                          onChange={(e) => updateTax(index, 'aliquota', parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(calculateTaxEstimate(tax))}
                      </TableCell>
                      <TableCell>
                        {!defaultTaxNames.includes(tax.nome) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCustomTax(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Total Impostos:</span> {formatCurrency(totalTaxes)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Despesas */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Despesas Adicionais</CardTitle>
                  <CardDescription>Configure as despesas extras</CardDescription>
                </div>
                <Button onClick={() => setShowAddExpenseDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Despesa</TableHead>
                    <TableHead>Valor (USD)</TableHead>
                    <TableHead>Valor (BRL)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.despesasAdicionais.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={expense.nome}
                          onChange={(e) => updateExpense(index, 'nome', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={expense.valorDolar}
                          onChange={(e) => handleExpenseUSDChange(index, parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={expense.valorReal}
                          onChange={(e) => handleExpenseRealChange(index, parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeExpense(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Total Despesas:</span> {formatCurrency(totalExpenses)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <Dialog open={showAddTaxDialog} onOpenChange={setShowAddTaxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Imposto Personalizado</DialogTitle>
            <DialogDescription>
              Configure um novo imposto para a simulação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Imposto</Label>
              <Input
                value={newTax.nome}
                onChange={(e) => setNewTax({ ...newTax, nome: e.target.value })}
                placeholder="Nome do imposto"
              />
            </div>
            <div>
              <Label>Alíquota (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={newTax.aliquota}
                onChange={(e) => setNewTax({ ...newTax, aliquota: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaxDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTaxClick}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Despesa Personalizada</DialogTitle>
            <DialogDescription>
              Configure uma nova despesa para a simulação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Despesa</Label>
              <Input
                value={newExpense.nome}
                onChange={(e) => setNewExpense({ ...newExpense, nome: e.target.value })}
                placeholder="Nome da despesa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newExpense.valorDolar}
                  onChange={(e) => setNewExpense({ ...newExpense, valorDolar: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Valor (BRL)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newExpense.valorReal}
                  onChange={(e) => setNewExpense({ ...newExpense, valorReal: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExpenseClick}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 