import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Calculator, Plus, Trash2 } from 'lucide-react';

interface Simulation {
  id?: number;
  nome: string;
  dataCriacao?: string;
  dataModificacao?: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  dados?: any;
}

export default function FormalImportSimulatorFixed() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/simuladores/importacao-formal-direta/editar/:id');
  const isEdit = !!match;
  const simulationId = params?.id;

  const [simulation, setSimulation] = useState<Simulation>({
    nome: '',
    fornecedor: '',
    despachante: '',
    agenteCargas: '',
    status: 'Em andamento',
    taxaDolar: 5.5,
    valorFobDolar: 0,
    valorFreteDolar: 0,
    percentualSeguro: 0.18
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && simulationId) {
      fetchSimulation(simulationId);
    }
  }, [isEdit, simulationId]);

  const fetchSimulation = async (id: string) => {
    try {
      console.log('🚀 SIMULATOR: Loading simulation', id);
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/simulators/formal-import/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ SIMULATOR: Data loaded:', data);
      setSimulation(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ SIMULATOR: Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const saveSimulation = async () => {
    try {
      console.log('💾 SIMULATOR: Saving simulation...');
      setIsSaving(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const url = isEdit 
        ? `/api/simulators/formal-import/${simulationId}`
        : '/api/simulators/formal-import';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(simulation),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const savedData = await response.json();
      console.log('✅ SIMULATOR: Saved successfully:', savedData);
      
      // Update local state with saved data
      setSimulation(savedData);
      setIsSaving(false);

      // Navigate back to list after a short delay
      setTimeout(() => {
        setLocation('/simuladores/importacao-formal-direta');
      }, 1000);

    } catch (err: any) {
      console.error('❌ SIMULATOR: Save error:', err);
      setError(err.message);
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Simulation, value: any) => {
    setSimulation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const calculateResults = () => {
    const fobReal = simulation.valorFobDolar * simulation.taxaDolar;
    const freteReal = simulation.valorFreteDolar * simulation.taxaDolar;
    const seguroReal = (simulation.valorFobDolar + simulation.valorFreteDolar) * (simulation.percentualSeguro / 100) * simulation.taxaDolar;
    const cfrReal = fobReal + freteReal + seguroReal;

    return {
      fobReal,
      freteReal,
      seguroReal,
      cfrReal
    };
  };

  const results = calculateResults();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando simulação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar simulação</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => setLocation('/simuladores/importacao-formal-direta')} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Voltar à Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Editar Simulação' : 'Nova Simulação'}
            </h1>
            <p className="text-gray-600 mt-2">Simulação de Importação Formal</p>
          </div>
        </div>
        <Button 
          onClick={saveSimulation}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Simulação *</Label>
                <Input
                  id="nome"
                  value={simulation.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: PO 4002"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={simulation.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={simulation.fornecedor}
                  onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                  placeholder="Ex: AKIO"
                />
              </div>
              <div>
                <Label htmlFor="despachante">Despachante</Label>
                <Input
                  id="despachante"
                  value={simulation.despachante}
                  onChange={(e) => handleInputChange('despachante', e.target.value)}
                  placeholder="Ex: 3S"
                />
              </div>
              <div>
                <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                <Input
                  id="agenteCargas"
                  value={simulation.agenteCargas}
                  onChange={(e) => handleInputChange('agenteCargas', e.target.value)}
                  placeholder="Ex: 3S"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Informações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="taxaDolar">Taxa do Dólar (R$)</Label>
                <Input
                  id="taxaDolar"
                  type="number"
                  step="0.0001"
                  value={simulation.taxaDolar}
                  onChange={(e) => handleInputChange('taxaDolar', parseFloat(e.target.value) || 0)}
                  placeholder="5.5000"
                />
              </div>
              <div>
                <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
                <Input
                  id="valorFobDolar"
                  type="number"
                  step="0.01"
                  value={simulation.valorFobDolar}
                  onChange={(e) => handleInputChange('valorFobDolar', parseFloat(e.target.value) || 0)}
                  placeholder="20940.00"
                />
              </div>
              <div>
                <Label htmlFor="valorFreteDolar">Valor Frete (USD)</Label>
                <Input
                  id="valorFreteDolar"
                  type="number"
                  step="0.01"
                  value={simulation.valorFreteDolar}
                  onChange={(e) => handleInputChange('valorFreteDolar', parseFloat(e.target.value) || 0)}
                  placeholder="3750.00"
                />
              </div>
              <div>
                <Label htmlFor="percentualSeguro">Seguro (%)</Label>
                <Input
                  id="percentualSeguro"
                  type="number"
                  step="0.01"
                  value={simulation.percentualSeguro}
                  onChange={(e) => handleInputChange('percentualSeguro', parseFloat(e.target.value) || 0)}
                  placeholder="0.18"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Cálculos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">FOB (BRL)</div>
                <div className="text-xl font-bold text-blue-800">{formatCurrency(results.fobReal)}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Frete (BRL)</div>
                <div className="text-xl font-bold text-green-800">{formatCurrency(results.freteReal)}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Seguro (BRL)</div>
                <div className="text-xl font-bold text-orange-800">{formatCurrency(results.seguroReal)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">CFR Total (BRL)</div>
                <div className="text-xl font-bold text-purple-800">{formatCurrency(results.cfrReal)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
          >
            Cancelar
          </Button>
          <Button 
            onClick={saveSimulation}
            disabled={isSaving || !simulation.nome}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : isEdit ? 'Atualizar Simulação' : 'Criar Simulação'}
          </Button>
        </div>
      </div>
    </div>
  );
}