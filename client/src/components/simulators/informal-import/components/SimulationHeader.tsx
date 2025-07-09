import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileDown, FolderOpen } from "lucide-react";
import { SimulacaoCompleta } from '../types';

interface SimulationHeaderProps {
  simulation: SimulacaoCompleta;
  selectedSimulationId: number | null;
  onSimulationChange: (updates: Partial<SimulacaoCompleta>) => void;
  onSave: () => void;
  onLoad: () => void;
  onNewSimulation: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

/**
 * Simulation header component
 * Handles simulation metadata and actions
 */
export const SimulationHeader = ({
  simulation,
  selectedSimulationId,
  onSimulationChange,
  onSave,
  onLoad,
  onNewSimulation,
  onExportPDF,
  onExportCSV
}: SimulationHeaderProps) => {
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <>
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulador de Custo de Importação Simplificada</h1>
          <p className="text-muted-foreground mt-2">
            Calcule custos de importação com precisão incluindo II, ICMS e despesas aduaneiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onNewSimulation} variant="outline">
            Nova Simulação
          </Button>
          <Button onClick={onLoad} variant="outline">
            <FolderOpen className="w-4 h-4 mr-2" />
            Carregar
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Simulation Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <Input
                value={simulation.nomeSimulacao}
                onChange={(e) => onSimulationChange({ nomeSimulacao: e.target.value })}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-xl font-semibold"
                autoFocus
              />
            ) : (
              <div className="flex flex-col">
                <CardTitle 
                  className="text-xl cursor-pointer hover:text-primary"
                  onClick={() => setIsEditingName(true)}
                >
                  {simulation.nomeSimulacao}
                </CardTitle>
                {simulation.codigoSimulacao && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Código: {simulation.codigoSimulacao}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Badge variant="secondary">
                {selectedSimulationId ? "Salva" : "Não Salva"}
              </Badge>
              <Button onClick={onExportCSV} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={onExportPDF} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeFornecedor">Nome do Fornecedor</Label>
              <Input
                id="nomeFornecedor"
                value={simulation.nomeFornecedor || ""}
                onChange={(e) => onSimulationChange({ nomeFornecedor: e.target.value })}
                placeholder="Digite o nome do fornecedor"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={simulation.observacoes || ""}
              onChange={(e) => onSimulationChange({ observacoes: e.target.value })}
              placeholder="Digite observações sobre esta simulação..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};