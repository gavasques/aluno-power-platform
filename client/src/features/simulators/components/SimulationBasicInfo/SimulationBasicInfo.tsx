/**
 * COMPONENTE: SimulationBasicInfo
 * Informações básicas da simulação de importação
 * Extraído de FormalImportSimulatorFixed.tsx para modularização
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormalImportSimulation, SIMULATION_STATUS } from '../../types';

interface SimulationBasicInfoProps {
  simulation: FormalImportSimulation;
  onUpdate: (data: Partial<FormalImportSimulation>) => void;
  isLoading: boolean;
}

export const SimulationBasicInfo = ({
  simulation,
  onUpdate,
  isLoading
}: SimulationBasicInfoProps) => {
  const handleChange = (field: keyof FormalImportSimulation, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas da Simulação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Simulação</Label>
            <Input
              id="nome"
              value={simulation.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Importação Eletrônicos Q1"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={simulation.status}
              onValueChange={(value) => handleChange('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {SIMULATION_STATUS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              value={simulation.fornecedor}
              onChange={(e) => handleChange('fornecedor', e.target.value)}
              placeholder="Ex: ABC Electronics Ltd"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="despachante">Despachante</Label>
            <Input
              id="despachante"
              value={simulation.despachante}
              onChange={(e) => handleChange('despachante', e.target.value)}
              placeholder="Ex: XYZ Despachante"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenteCargas">Agente de Cargas</Label>
            <Input
              id="agenteCargas"
              value={simulation.agenteCargas}
              onChange={(e) => handleChange('agenteCargas', e.target.value)}
              placeholder="Ex: Global Cargo"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxaDolar">Taxa do Dólar (R$)</Label>
            <Input
              id="taxaDolar"
              type="number"
              step="0.01"
              value={simulation.taxaDolar}
              onChange={(e) => handleChange('taxaDolar', parseFloat(e.target.value) || 0)}
              placeholder="5.50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
            <Input
              id="valorFobDolar"
              type="number"
              step="0.01"
              value={simulation.valorFobDolar}
              onChange={(e) => handleChange('valorFobDolar', parseFloat(e.target.value) || 0)}
              placeholder="10000.00"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorFreteDolar">Valor do Frete (USD)</Label>
            <Input
              id="valorFreteDolar"
              type="number"
              step="0.01"
              value={simulation.valorFreteDolar}
              onChange={(e) => handleChange('valorFreteDolar', parseFloat(e.target.value) || 0)}
              placeholder="2000.00"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentualSeguro">Percentual do Seguro (%)</Label>
            <Input
              id="percentualSeguro"
              type="number"
              step="0.01"
              value={simulation.percentualSeguro}
              onChange={(e) => handleChange('percentualSeguro', parseFloat(e.target.value) || 0)}
              placeholder="0.2"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={simulation.observacoes || ''}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Observações adicionais sobre a simulação..."
            rows={3}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};