import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumoSimulacao as ResumoType } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

interface ResumoSimulacaoProps {
  resumo: ResumoType;
}

export const ResumoSimulacao = ({ resumo }: ResumoSimulacaoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Simulação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {resumo.totalMeses}
            </div>
            <div className="text-sm text-muted-foreground">Meses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(resumo.ultimoRBT12)}
            </div>
            <div className="text-sm text-muted-foreground">RBT12 Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(resumo.totalImpostos)}
            </div>
            <div className="text-sm text-muted-foreground">Total Impostos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(resumo.aliquotaMedia)}
            </div>
            <div className="text-sm text-muted-foreground">Alíquota Média</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className={`text-xl font-bold ${resumo.disponivelAnual > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(resumo.disponivelAnual)}
            </div>
            <div className="text-sm text-muted-foreground">Disponível Anual</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${resumo.disponivelMedia > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(resumo.disponivelMedia)}
            </div>
            <div className="text-sm text-muted-foreground">Disponível Média</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};