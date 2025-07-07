import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  Trash2, 
  FileDown, 
  Calculator,
  Building2,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
interface MesSimulacao {
  id?: number;
  competencia: number;
  ano: number;
  faturamento: string;
  anexo: string;
  soma12Meses?: string;
  media12Meses?: string;
  disponivelMedia?: string;
  disponivelAnual?: string;
  aliquotaEfetiva?: string;
  valorImposto?: string;
}

interface SimplesSimulation {
  id?: number;
  nomeSimulacao: string;
  dataCreated?: string;
  dataLastModified?: string;
  meses?: MesSimulacao[];
}

interface FaixaAliquota {
  id: number;
  anexo: string;
  faixaInicial: string;
  faixaFinal: string;
  aliquotaNominal: string;
  valorDeduzir: string;
}

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

export default function SimplesNacional() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States
  const [activeSimulation, setActiveSimulation] = useState<SimplesSimulation>({
    nomeSimulacao: 'Nova Simulação Simples Nacional',
    meses: []
  });
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [newMes, setNewMes] = useState<Omit<MesSimulacao, 'id'>>({
    competencia: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    faturamento: '',
    anexo: 'Anexo I'
  });
  const [activeTab, setActiveTab] = useState('simulation');
  const [isEditingName, setIsEditingName] = useState(false);

  // API Queries
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['/api/simulations/simples'],
    enabled: true,
  });

  const { data: faixasAnexo1 = [] } = useQuery<FaixaAliquota[]>({
    queryKey: ['/api/simulations/simples/faixas/Anexo I'],
    enabled: true,
  });

  const { data: faixasAnexo2 = [] } = useQuery<FaixaAliquota[]>({
    queryKey: ['/api/simulations/simples/faixas/Anexo II'],
    enabled: true,
  });

  // Mutations
  const createSimulationMutation = useMutation({
    mutationFn: (data: { nomeSimulacao: string }) =>
      apiRequest('/api/simulations/simples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSelectedSimulationId(data.id);
      setActiveSimulation({ ...activeSimulation, ...data });
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
      toast({ title: 'Simulação criada com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar simulação', variant: 'destructive' });
    },
  });

  const updateSimulationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nomeSimulacao: string } }) =>
      apiRequest(`/api/simulations/simples/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
      toast({ title: 'Simulação atualizada com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar simulação', variant: 'destructive' });
    },
  });

  const addMesMutation = useMutation({
    mutationFn: ({ simulationId, data }: { simulationId: number; data: Omit<MesSimulacao, 'id'> }) =>
      apiRequest(`/api/simulations/simples/${simulationId}/mes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setActiveSimulation(prev => ({
        ...prev,
        meses: [...(prev.meses || []), data]
      }));
      setNewMes({
        competencia: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        faturamento: '',
        anexo: 'Anexo I'
      });
      toast({ title: 'Mês adicionado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao adicionar mês', variant: 'destructive' });
    },
  });

  const deleteMesMutation = useMutation({
    mutationFn: ({ simulationId, mesId }: { simulationId: number; mesId: number }) =>
      apiRequest(`/api/simulations/simples/${simulationId}/mes/${mesId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { mesId }) => {
      setActiveSimulation(prev => ({
        ...prev,
        meses: prev.meses?.filter(mes => mes.id !== mesId) || []
      }));
      toast({ title: 'Mês excluído com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir mês', variant: 'destructive' });
    },
  });

  const deleteSimulationMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/simulations/simples/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
      toast({ title: 'Simulação excluída com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir simulação', variant: 'destructive' });
    },
  });

  // Load simulation
  const loadSimulation = async (simulation: SimplesSimulation) => {
    if (!simulation.id) return;

    try {
      const response = await apiRequest(`/api/simulations/simples/${simulation.id}`);
      setActiveSimulation(response);
      setSelectedSimulationId(simulation.id);
      setActiveTab('simulation');
      toast({ title: 'Simulação carregada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao carregar simulação', variant: 'destructive' });
    }
  };

  // Save simulation
  const saveSimulation = () => {
    if (selectedSimulationId) {
      updateSimulationMutation.mutate({
        id: selectedSimulationId,
        data: { nomeSimulacao: activeSimulation.nomeSimulacao }
      });
    } else {
      createSimulationMutation.mutate({
        nomeSimulacao: activeSimulation.nomeSimulacao
      });
    }
  };

  // Add month
  const addMes = () => {
    if (!selectedSimulationId) {
      toast({ title: 'Salve a simulação primeiro', variant: 'destructive' });
      return;
    }

    if (!newMes.faturamento || parseFloat(newMes.faturamento) <= 0) {
      toast({ title: 'Informe o faturamento', variant: 'destructive' });
      return;
    }

    addMesMutation.mutate({
      simulationId: selectedSimulationId,
      data: newMes
    });
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num || 0);
  };

  // Format percentage
  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${(num * 100).toFixed(2)}%`;
  };

  // Calculate totals
  const totalFaturamento = activeSimulation.meses?.reduce(
    (acc, mes) => acc + parseFloat(mes.faturamento || '0'), 0
  ) || 0;

  const totalImposto = activeSimulation.meses?.reduce(
    (acc, mes) => acc + parseFloat(mes.valorImposto || '0'), 0
  ) || 0;

  const aliquotaMedia = totalFaturamento > 0 
    ? (totalImposto / totalFaturamento) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Simulador Simples Nacional</h1>
        <p className="text-muted-foreground">
          Calcule impostos e taxas do regime tributário Simples Nacional para Anexos I e II
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulation">Simulação Ativa</TabsTrigger>
          <TabsTrigger value="saved">Simulações Salvas</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6">
          {/* Simulation Name and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <Input
                    value={activeSimulation.nomeSimulacao}
                    onChange={(e) => setActiveSimulation(prev => ({ ...prev, nomeSimulacao: e.target.value }))}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-xl font-semibold max-w-md"
                    autoFocus
                  />
                ) : (
                  <CardTitle 
                    className="text-xl cursor-pointer hover:text-primary"
                    onClick={() => setIsEditingName(true)}
                  >
                    {activeSimulation.nomeSimulacao}
                  </CardTitle>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={selectedSimulationId ? "default" : "secondary"}>
                    {selectedSimulationId ? "Salva" : "Não Salva"}
                  </Badge>
                  <Button onClick={saveSimulation} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalFaturamento)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeSimulation.meses?.length || 0} meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Imposto Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalImposto)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(aliquotaMedia)} média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Limite Anual</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(3600000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Simples Nacional
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponível</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(3600000 - totalFaturamento)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((3600000 - totalFaturamento) / 3600000)} restante
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add Month Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select
                    value={newMes.competencia.toString()}
                    onValueChange={(value) => setNewMes(prev => ({ ...prev, competencia: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value.toString()}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select
                    value={newMes.ano.toString()}
                    onValueChange={(value) => setNewMes(prev => ({ ...prev, ano: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Faturamento</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={newMes.faturamento}
                    onChange={(e) => setNewMes(prev => ({ ...prev, faturamento: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anexo</Label>
                  <Select
                    value={newMes.anexo}
                    onValueChange={(value) => setNewMes(prev => ({ ...prev, anexo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anexo I">Anexo I</SelectItem>
                      <SelectItem value="Anexo II">Anexo II</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={addMes} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dados Mensais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSimulation.meses && activeSimulation.meses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Anexo</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right">RBT12</TableHead>
                        <TableHead className="text-right">Alíquota Efetiva</TableHead>
                        <TableHead className="text-right">Imposto</TableHead>
                        <TableHead className="text-right">Disponível Anual</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSimulation.meses.map((mes) => (
                        <TableRow key={mes.id}>
                          <TableCell className="font-medium">
                            {meses.find(m => m.value === mes.competencia)?.label} {mes.ano}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mes.anexo === 'Anexo I' ? 'default' : 'secondary'}>
                              {mes.anexo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(mes.faturamento)}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {formatCurrency(mes.soma12Meses || '0')}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatPercentage(mes.aliquotaEfetiva || '0')}
                          </TableCell>
                          <TableCell className="text-right font-bold text-orange-600">
                            {formatCurrency(mes.valorImposto || '0')}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(mes.disponivelAnual || '0')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => mes.id && selectedSimulationId && deleteMesMutation.mutate({
                                simulationId: selectedSimulationId,
                                mesId: mes.id
                              })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum mês adicionado ainda.</p>
                  <p className="text-sm">Adicione o primeiro mês para começar a simulação.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Brackets Table */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Anexo I - Faixas de Alíquotas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa de Receita</TableHead>
                      <TableHead className="text-right">Alíquota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faixasAnexo1.map((faixa) => (
                      <TableRow key={faixa.id}>
                        <TableCell>
                          {formatCurrency(faixa.faixaInicial)} - {formatCurrency(faixa.faixaFinal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(faixa.aliquotaNominal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anexo II - Faixas de Alíquotas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa de Receita</TableHead>
                      <TableHead className="text-right">Alíquota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faixasAnexo2.map((faixa) => (
                      <TableRow key={faixa.id}>
                        <TableCell>
                          {formatCurrency(faixa.faixaInicial)} - {formatCurrency(faixa.faixaFinal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(faixa.aliquotaNominal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulações Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando simulações...</div>
              ) : simulations.length > 0 ? (
                <div className="space-y-4">
                  {simulations.map((simulation: SimplesSimulation) => (
                    <div
                      key={simulation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <h3 className="font-semibold">{simulation.nomeSimulacao}</h3>
                        <p className="text-sm text-muted-foreground">
                          Criada em {new Date(simulation.dataCreated!).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSimulation(simulation)}
                        >
                          Carregar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => simulation.id && deleteSimulationMutation.mutate(simulation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma simulação salva ainda.</p>
                  <p className="text-sm">Crie sua primeira simulação na aba "Simulação Ativa".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}