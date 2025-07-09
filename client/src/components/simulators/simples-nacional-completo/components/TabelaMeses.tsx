import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Trash2 } from 'lucide-react';
import { MesSimulacao } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

interface TabelaMesesProps {
  meses: MesSimulacao[];
  onRemover: (id: string) => void;
  onExportarCSV: () => void;
}

export const TabelaMeses = ({ meses, onRemover, onExportarCSV }: TabelaMesesProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Meses Adicionados</CardTitle>
          <div className="flex gap-2">
            <Button onClick={onExportarCSV} variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Mês/Ano</th>
                <th className="border border-gray-300 p-2 text-right">Fat. sem ST</th>
                <th className="border border-gray-300 p-2 text-right">Fat. com ST</th>
                <th className="border border-gray-300 p-2 text-center">Anexo</th>
                <th className="border border-gray-300 p-2 text-right">Fat. Total</th>
                <th className="border border-gray-300 p-2 text-right">RBT12</th>
                <th className="border border-gray-300 p-2 text-right">Alíq. Efetiva</th>
                <th className="border border-gray-300 p-2 text-right">Valor Total</th>
                <th className="border border-gray-300 p-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((mes) => (
                <tr key={mes.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-medium">{mes.mesAno}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(mes.faturamentoSemST)}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(mes.faturamentoComST)}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Badge variant={mes.anexo === 'Anexo I' ? 'default' : 'secondary'}>
                      {mes.anexo}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-medium">{formatCurrency(mes.faturamentoTotal)}</td>
                  <td className="border border-gray-300 p-2 text-right text-blue-600">{formatCurrency(mes.rbt12)}</td>
                  <td className="border border-gray-300 p-2 text-right text-green-600">{formatPercentage(mes.aliquotaEfetiva)}</td>
                  <td className="border border-gray-300 p-2 text-right font-bold text-orange-600">{formatCurrency(mes.valorTotal)}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Button 
                      onClick={() => onRemover(mes.id)} 
                      variant="destructive" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};