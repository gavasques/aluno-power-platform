import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimulationTotals } from '../types';
import { formatCurrency, formatBrazilianNumber } from '../utils';

interface SummaryPanelProps {
  totals: SimulationTotals;
}

/**
 * Summary panel component
 * Displays calculation results and metrics
 */
export const SummaryPanel = ({ totals }: SummaryPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Simulação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Key Metrics Row */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatBrazilianNumber(totals.peso_total_kg, 2)} kg
            </div>
            <div className="text-sm text-muted-foreground">Peso Total</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${formatBrazilianNumber(totals.preco_por_kg_usd, 2)}
            </div>
            <div className="text-sm text-muted-foreground">Preço por Kg (USD)</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatBrazilianNumber(totals.multiplicador_importacao, 2)}x
            </div>
            <div className="text-sm text-muted-foreground">Multiplicador de Importação</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.custo_total_importacao_brl)}
            </div>
            <div className="text-sm text-muted-foreground">Custo Total</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Qtd. Itens:</span>
              <Badge variant="outline">{totals.total_sim_quantidade_itens}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Custo Produto:</span>
              <span className="text-sm font-medium">{formatCurrency(totals.total_sim_custo_produto_brl)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Produto + Frete:</span>
              <span className="text-sm font-medium">{formatCurrency(totals.total_sim_produto_mais_frete_brl)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Valor FOB Total:</span>
              <span className="text-sm font-medium">${formatBrazilianNumber(totals.valor_fob_total_usd)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">II Total:</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(totals.total_sim_valor_ii_brl)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ICMS Total:</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(totals.total_sim_valor_icms_brl)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Outras Despesas:</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(totals.total_sim_outras_despesas_aduaneiras_brl)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-bold">TOTAL GERAL:</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(totals.custo_total_importacao_brl)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};