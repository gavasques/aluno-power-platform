import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Trash2, Calendar, DollarSign } from 'lucide-react';
import { InvestmentSimulation } from '../types';
import { formatCurrency } from '../utils';

interface SimulationSelectorProps {
  simulations: InvestmentSimulation[];
  isLoadingSimulations: boolean;
  onLoadSimulation: (simulation: InvestmentSimulation) => void;
  onDeleteSimulation: (id: number) => void;
  isDeleting: boolean;
}

export function SimulationSelector({
  simulations,
  isLoadingSimulations,
  onLoadSimulation,
  onDeleteSimulation,
  isDeleting
}: SimulationSelectorProps) {
  if (isLoadingSimulations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Carregando simulações...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (simulations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Simulações Salvas
          </CardTitle>
          <CardDescription>
            Nenhuma simulação encontrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Quando você salvar uma simulação, ela aparecerá aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Simulações Salvas ({simulations.length})
        </CardTitle>
        <CardDescription>
          Carregue ou exclua simulações anteriores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {simulations.map((simulation) => (
            <div
              key={simulation.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Simulation Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{simulation.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {simulation.numberOfCycles} giros
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(simulation.initialInvestment)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {simulation.cycleDuration} {simulation.cycleUnit.toLowerCase()}
                  </div>
                  {simulation.createdAt && (
                    <span>
                      {new Date(simulation.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => onLoadSimulation(simulation)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <FolderOpen className="h-3 w-3" />
                  Carregar
                </Button>
                {simulation.id && (
                  <Button
                    onClick={() => onDeleteSimulation(simulation.id!)}
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    {isDeleting ? '...' : 'Excluir'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}