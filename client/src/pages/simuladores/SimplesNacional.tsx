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
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Calculator,
  Building2,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
interface MesSimulacao {
  id?: number;
  competencia: number;
  ano: number;
  faturamento: string;
  anexo: string;
  rbt12: string;
  aliquotaEfetiva: string;
  impostoDevido: string;
  disponivelAnual: string;
}

interface FaixaAliquota {
  id: number;
  anexo: string;
  faixaInicial: string;
  faixaFinal: string;
  aliquotaNominal: string;
  valorDeduzir: string;
}

interface SimulationData {
  id?: number;
  nomeSimulacao: string;
  meses: MesSimulacao[];
}

const MESES = [
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

const ANOS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue || 0);
};

const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((numValue || 0) / 100);
};

export default function SimplesNacional() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado da simulação única
  const [simulationData, setSimulationData] = useState<SimulationData>({
    nomeSimulacao: 'Simulação Simples Nacional',
    meses: []
  });
  
  // Formulário para adicionar mês
  const [formData, setFormData] = useState({
    competencia: '',
    ano: '',
    faturamento: '',
    anexo: 'Anexo I'
  });

  // Carregar simulação existente do usuário
  const { data: existingSimulation, isLoading } = useQuery({
    queryKey: ['/api/simulations/simples'],
    select: (data: any[]) => data[0] || null // Pega apenas a primeira simulação
  });

  // Carregar faixas de alíquotas
  const { data: faixasAnexoI = [] } = useQuery<FaixaAliquota[]>({
    queryKey: ['/api/simulations/simples/faixas/Anexo I']
  });

  const { data: faixasAnexoII = [] } = useQuery<FaixaAliquota[]>({
    queryKey: ['/api/simulations/simples/faixas/Anexo II']
  });

  // Carregar dados na primeira vez
  useEffect(() => {
    if (existingSimulation) {
      setSimulationData(existingSimulation);
    }
  }, [existingSimulation]);

  // Criar ou atualizar simulação
  const saveSimulationMutation = useMutation({
    mutationFn: async (data: SimulationData) => {
      if (data.id) {
        return await apiRequest(`/api/simulations/simples/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify({ nomeSimulacao: data.nomeSimulacao })
        });
      } else {
        return await apiRequest('/api/simulations/simples', {
          method: 'POST',
          body: JSON.stringify({ nomeSimulacao: data.nomeSimulacao })
        });
      }
    },
    onSuccess: (result) => {
      setSimulationData(prev => ({ ...prev, id: result.id }));
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
    }
  });

  // Adicionar mês
  const addMonthMutation = useMutation({
    mutationFn: async (monthData: Omit<MesSimulacao, 'id'>) => {
      // Garantir que temos uma simulação salva primeiro
      let simulationId = simulationData.id;
      if (!simulationId) {
        const newSimulation = await saveSimulationMutation.mutateAsync(simulationData);
        simulationId = newSimulation.id;
      }
      
      return await apiRequest(`/api/simulations/simples/${simulationId}/meses`, {
        method: 'POST',
        body: JSON.stringify({
          competencia: parseInt(monthData.competencia.toString()),
          ano: parseInt(monthData.ano.toString()),
          faturamento: parseFloat(monthData.faturamento.replace(/[^\d,]/g, '').replace(',', '.')),
          anexo: monthData.anexo
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
      setFormData({ competencia: '', ano: '', faturamento: '', anexo: 'Anexo I' });
      toast({
        title: 'Mês adicionado',
        description: 'Dados do mês foram salvos com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao adicionar mês.',
        variant: 'destructive'
      });
    }
  });

  // Remover mês
  const removeMonthMutation = useMutation({
    mutationFn: async (monthId: number) => {
      return await apiRequest(`/api/simulations/simples/${simulationData.id}/meses/${monthId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples'] });
      toast({
        title: 'Mês removido',
        description: 'Dados do mês foram removidos com sucesso.',
      });
    }
  });

  const handleAddMonth = () => {
    if (!formData.competencia || !formData.ano || !formData.faturamento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para adicionar um mês.',
        variant: 'destructive'
      });
      return;
    }

    addMonthMutation.mutate({
      competencia: parseInt(formData.competencia),
      ano: parseInt(formData.ano),
      faturamento: formData.faturamento,
      anexo: formData.anexo,
      rbt12: '0',
      aliquotaEfetiva: '0',
      impostoDevido: '0',
      disponivelAnual: '0'
    });
  };

  const handleRemoveMonth = (monthId: number) => {
    if (!monthId) return;
    removeMonthMutation.mutate(monthId);
  };

  // Calcular totais
  const faturamentoTotal = simulationData.meses.reduce((total, mes) => 
    total + parseFloat(mes.faturamento || '0'), 0
  );

  const impostoTotal = simulationData.meses.reduce((total, mes) => 
    total + parseFloat(mes.impostoDevido || '0'), 0
  );

  const limiteAnual = 3600000; // R$ 3.600.000 limite do Simples Nacional
  const disponivel = limiteAnual - faturamentoTotal;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Simulador Simples Nacional</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Calcule impostos e taxas do regime tributário Simples Nacional para Anexos I e II
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Não Salva
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(faturamentoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {simulationData.meses.length} meses
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
              {formatCurrency(impostoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {impostoTotal > 0 ? formatPercentage((impostoTotal / faturamentoTotal) * 100) : '0,00%'} média
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
              {formatCurrency(limiteAnual)}
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
            <div className={`text-2xl font-bold ${disponivel > 0 ? 'text-orange-600' : 'text-red-600'}`}>
              {formatCurrency(disponivel)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((disponivel / limiteAnual) * 100)} restante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário para Adicionar Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Adicionar Mês</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="mes">Mês</Label>
              <Select value={formData.competencia} onValueChange={(value) => setFormData(prev => ({ ...prev, competencia: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map(mes => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano">Ano</Label>
              <Select value={formData.ano} onValueChange={(value) => setFormData(prev => ({ ...prev, ano: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="faturamento">Faturamento</Label>
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={formData.faturamento}
                onChange={(e) => setFormData(prev => ({ ...prev, faturamento: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="anexo">Anexo</Label>
              <Select value={formData.anexo} onValueChange={(value) => setFormData(prev => ({ ...prev, anexo: value }))}>
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
              <Button 
                onClick={handleAddMonth} 
                disabled={addMonthMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados Mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Dados Mensais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {simulationData.meses.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Nenhum mês adicionado ainda.</p>
              <p className="text-sm text-muted-foreground">
                Adicione o primeiro mês para começar a simulação.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Anexo</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>RBT12</TableHead>
                  <TableHead>Alíquota Efetiva</TableHead>
                  <TableHead>Imposto</TableHead>
                  <TableHead>Disponível Anual</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulationData.meses.map((mes) => (
                  <TableRow key={`${mes.competencia}-${mes.ano}`}>
                    <TableCell>
                      {MESES.find(m => m.value === mes.competencia)?.label}/{mes.ano}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mes.anexo}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(mes.faturamento)}</TableCell>
                    <TableCell>{formatCurrency(mes.rbt12)}</TableCell>
                    <TableCell>{formatPercentage(mes.aliquotaEfetiva)}</TableCell>
                    <TableCell>{formatCurrency(mes.impostoDevido)}</TableCell>
                    <TableCell>{formatCurrency(mes.disponivelAnual)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMonth(mes.id!)}
                        disabled={removeMonthMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Faixas de Alíquotas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Anexo I - Faixas de Alíquotas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faixa de Receita</TableHead>
                  <TableHead>Alíquota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faixasAnexoI.map((faixa) => (
                  <TableRow key={faixa.id}>
                    <TableCell>
                      {formatCurrency(faixa.faixaInicial)} - {formatCurrency(faixa.faixaFinal)}
                    </TableCell>
                    <TableCell>{formatPercentage(faixa.aliquotaNominal)}</TableCell>
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
                  <TableHead>Alíquota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faixasAnexoII.map((faixa) => (
                  <TableRow key={faixa.id}>
                    <TableCell>
                      {formatCurrency(faixa.faixaInicial)} - {formatCurrency(faixa.faixaFinal)}
                    </TableCell>
                    <TableCell>{formatPercentage(faixa.aliquotaNominal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}