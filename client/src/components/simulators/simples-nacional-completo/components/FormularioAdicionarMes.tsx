import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { NovoMesForm } from '../types';

interface FormularioAdicionarMesProps {
  novoMes: NovoMesForm;
  onUpdate: (field: keyof NovoMesForm, value: any) => void;
  onAdicionar: () => void;
}

export const FormularioAdicionarMes = ({ novoMes, onUpdate, onAdicionar }: FormularioAdicionarMesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Novo Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="mesAno">Mês/Ano</Label>
            <Input
              id="mesAno"
              placeholder="01/2025"
              value={novoMes.mesAno}
              onChange={(e) => onUpdate('mesAno', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fatSemST">Faturamento sem ST</Label>
            <Input
              id="fatSemST"
              type="number"
              placeholder="0"
              value={novoMes.faturamentoSemST || ''}
              onChange={(e) => onUpdate('faturamentoSemST', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="fatComST">Faturamento com ST</Label>
            <Input
              id="fatComST"
              type="number"
              placeholder="0"
              value={novoMes.faturamentoComST || ''}
              onChange={(e) => onUpdate('faturamentoComST', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="anexo">Anexo</Label>
            <Select 
              value={novoMes.anexo} 
              onValueChange={(value: 'Anexo I' | 'Anexo II') => onUpdate('anexo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anexo I">Anexo I (Comércio)</SelectItem>
                <SelectItem value="Anexo II">Anexo II (Indústria)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={onAdicionar} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};