import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { GiroCalculado, GiroEditavel } from '../types';
import { formatCurrency, formatPercentage, sanitizeNumericInput } from '../utils';

interface SimulationTableProps {
  giros: GiroCalculado[];
  girosData: { [key: number]: GiroEditavel };
  onGiroDataChange: (giroNumber: number, field: keyof GiroEditavel, value: number) => void;
}

export function SimulationTable({ giros, girosData, onGiroDataChange }: SimulationTableProps) {
  const handleInputChange = (
    giroNumber: number,
    field: keyof GiroEditavel,
    value: string
  ) => {
    const numericValue = sanitizeNumericInput(value);
    onGiroDataChange(giroNumber, field, numericValue);
  };

  const getRowColor = (roiGiro: number) => {
    if (roiGiro >= 30) return 'bg-green-50 dark:bg-green-900/20';
    if (roiGiro >= 20) return 'bg-blue-50 dark:bg-blue-900/20';
    if (roiGiro >= 10) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Simulação por Giros
        </CardTitle>
        <CardDescription>
          Edite diretamente na tabela os valores de cada giro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Giro</TableHead>
                <TableHead>Investimento</TableHead>
                <TableHead className="w-24">ROI%</TableHead>
                <TableHead>Retorno</TableHead>
                <TableHead className="w-24">Aporte</TableHead>
                <TableHead className="w-24">Retirada</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead className="w-20">Tempo (dias)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {giros.map((giro) => {
                const giroData = girosData[giro.numero] || { aporte: 0, retirada: 0, roiGiro: 20 };
                
                return (
                  <TableRow key={giro.numero} className={getRowColor(giro.roiGiro)}>
                    {/* Giro Number */}
                    <TableCell className="font-medium text-center">
                      {giro.numero}
                    </TableCell>

                    {/* Investimento */}
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(giro.investimento)}
                      </span>
                    </TableCell>

                    {/* ROI% - Editable */}
                    <TableCell>
                      <Input
                        type="text"
                        value={giroData.roiGiro.toString()}
                        onChange={(e) => handleInputChange(giro.numero, 'roiGiro', e.target.value)}
                        className="w-20 text-center text-sm"
                        placeholder="20"
                      />
                    </TableCell>

                    {/* Retorno */}
                    <TableCell>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(giro.retorno)}
                      </span>
                    </TableCell>

                    {/* Aporte - Editable */}
                    <TableCell>
                      <Input
                        type="text"
                        value={giroData.aporte.toString()}
                        onChange={(e) => handleInputChange(giro.numero, 'aporte', e.target.value)}
                        className="w-24 text-sm"
                        placeholder="0"
                      />
                    </TableCell>

                    {/* Retirada - Editable */}
                    <TableCell>
                      <Input
                        type="text"
                        value={giroData.retirada.toString()}
                        onChange={(e) => handleInputChange(giro.numero, 'retirada', e.target.value)}
                        className="w-24 text-sm"
                        placeholder="0"
                      />
                    </TableCell>

                    {/* Saldo */}
                    <TableCell>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(giro.saldo)}
                      </span>
                    </TableCell>

                    {/* Tempo Decorrido */}
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {giro.tempoDecorrido}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}