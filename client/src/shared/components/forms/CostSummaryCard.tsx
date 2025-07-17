import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { formatBRL } from "@/utils/pricingCalculations";
import { getFullCostCalculation } from "@/shared/utils/productCalculations";

interface CostSummaryCardProps {
  costItem: number;
  taxPercent: number;
  packCost: number;
}

/**
 * Reusable cost summary component with margin suggestions
 * Single Responsibility: Display cost breakdown and pricing suggestions
 */
export function CostSummaryCard({ costItem, taxPercent, packCost }: CostSummaryCardProps) {
  const calculation = getFullCostCalculation(costItem, taxPercent, packCost);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <DollarSign className="h-5 w-5" />
          Resumo de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Custo Base + Impostos</p>
            <p className="text-lg font-semibold text-blue-700">
              {formatBRL(calculation.baseWithTax)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Total</p>
            <p className="text-xl font-bold text-blue-800">
              {formatBRL(calculation.totalCost)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sugestões de Preço de Venda:</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              20%: {formatBRL(calculation.suggestedPrices.margin20)}
            </Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              30%: {formatBRL(calculation.suggestedPrices.margin30)}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              40%: {formatBRL(calculation.suggestedPrices.margin40)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}