import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Save, RotateCcw, Copy, FileText } from 'lucide-react';
import { ConfiguracaoSimulacao, GiroEditavel, GiroCalculado, SimulationTotals } from '../types';

interface ActionsPanelProps {
  simulationName: string;
  onSimulationNameChange: (name: string) => void;
  onSave: () => void;
  onReset: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  giros: GiroCalculado[];
  totals: SimulationTotals;
  isSaving: boolean;
}

export function ActionsPanel({
  simulationName,
  onSimulationNameChange,
  onSave,
  onReset,
  onExportCSV,
  onExportPDF,
  giros,
  totals,
  isSaving
}: ActionsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ações da Simulação
        </CardTitle>
        <CardDescription>
          Salve, exporte ou reset sua simulação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulation Name */}
        <div className="space-y-2">
          <Label htmlFor="simulation-name">Nome da Simulação</Label>
          <Input
            id="simulation-name"
            value={simulationName}
            onChange={(e) => onSimulationNameChange(e.target.value)}
            placeholder="Digite o nome da simulação"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Save */}
          <Button 
            onClick={onSave}
            disabled={isSaving || !simulationName.trim()}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>

          {/* Export CSV */}
          <Button
            onClick={onExportCSV}
            variant="outline"
            size="sm"
            disabled={giros.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>

          {/* Export PDF */}
          <Button
            onClick={onExportPDF}
            variant="outline"
            size="sm"
            disabled={giros.length === 0}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>

          {/* Reset */}
          <Button
            onClick={onReset}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Summary Stats */}
        {giros.length > 0 && (
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Giros simulados:</span>
                <span className="ml-2 font-medium">{giros.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ROI Total:</span>
                <span className="ml-2 font-medium text-green-600">
                  {totals.roiTotal.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}