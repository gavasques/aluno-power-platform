import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  Calculator,
  History,
  Percent,
  FileText,
  TrendingUp,
  Info
} from "lucide-react";
import { formatBRL, formatPercent } from "@/utils/pricingCalculations";

interface ProductCostsTabProps {
  form: UseFormReturn<any>;
}

export default function ProductCostsTab({ form }: ProductCostsTabProps) {
  const productCost = form.watch("costs.currentCost") || 0;
  const taxPercent = form.watch("costs.taxPercent") || 0;
  
  // Calculate total cost
  const taxAmount = productCost * (taxPercent / 100);
  const totalCost = productCost + taxAmount;

  return (
    <div className="space-y-6">
      {/* Cost Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuração de Custos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="costs.currentCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Custo do Produto (R$) *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01"
                      placeholder="0,00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costs.taxPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Impostos (%) *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.1"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="costs.observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações sobre Custos
                </FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Ex: Custo inclui frete do fornecedor, embalagem especial, etc."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Resumo de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Custo do Produto</p>
                <p className="text-2xl font-bold">{formatBRL(productCost)}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Impostos ({formatPercent(taxPercent, 1)})</p>
                <p className="text-2xl font-bold">{formatBRL(taxAmount)}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg space-y-1">
                <p className="text-sm text-blue-700 font-semibold">Custo Total</p>
                <p className="text-2xl font-bold text-blue-900">{formatBRL(totalCost)}</p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O custo total será usado como base para cálculo de preços e margens em todos os canais de venda.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Cost History (placeholder for future implementation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Histórico será exibido após o primeiro salvamento</p>
            <p className="text-sm mt-2">
              Acompanhe a evolução dos custos ao longo do tempo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cost Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <TrendingUp className="h-5 w-5" />
            Dicas para Gestão de Custos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <p>
              <strong>Custo completo:</strong> Inclua todos os custos diretos como produto, embalagem, 
              etiquetas e preparação.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <p>
              <strong>Impostos:</strong> Considere ICMS, PIS, COFINS e outros impostos aplicáveis 
              ao seu regime tributário.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <p>
              <strong>Atualização regular:</strong> Revise os custos mensalmente ou sempre que 
              houver mudança significativa.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <p>
              <strong>Negociação:</strong> Busque melhores condições com fornecedores para 
              reduzir o custo unitário.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}