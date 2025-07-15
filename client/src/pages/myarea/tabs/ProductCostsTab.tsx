import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PercentInput } from "@/components/ui/percent-input";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  History,
  Percent,
  FileText,
  Clock,
  ArrowRight,
  Save,
  Loader2
} from "lucide-react";
import { formatBRL, formatPercent } from "@/utils/pricingCalculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductCostsTabProps {
  form: UseFormReturn<any>;
  isEditing?: boolean;
  productId?: string;
}

export default function ProductCostsTab({ form, isEditing, productId }: ProductCostsTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const productCost = form.watch("costs.currentCost") || 0;
  const taxPercent = form.watch("costs.taxPercent") || 0;
  const formProductId = form.watch("id");
  const [costHistory, setCostHistory] = React.useState<any[]>([]);
  



  // Save costs function
  const saveCosts = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const costs = form.getValues("costs");
      

      
      // Convert Brazilian format (comma) to US format (dot) before sending
      const costsData = {
        costs: {
          currentCost: costs.currentCost ? String(costs.currentCost).replace(',', '.') : "0",
          taxPercent: costs.taxPercent ? String(costs.taxPercent).replace(',', '.') : "0",
          observations: costs.observations || ""
        }
      };
      


      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(costsData),
      });

      if (response.ok) {
        toast({
          title: "Custos salvos",
          description: "Os dados de custos foram salvos com sucesso.",
        });
        
        // Reload cost history to show the new entry
        if (productId) {
          fetch(`/api/products/${productId}/cost-history?limit=6`)
            .then(res => res.json())
            .then(data => {

              setCostHistory(data);
            })
            .catch(err => console.error('Error reloading cost history:', err));
        }
      } else {
        throw new Error("Erro ao salvar custos");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os custos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    // Use productId from props if available, otherwise use formProductId
    const idToUse = productId || formProductId;
    console.log('📊 [COST HISTORY] Using ID:', idToUse);
    
    if (idToUse) {
      fetch(`/api/products/${idToUse}/cost-history?limit=6`)
        .then(res => res.json())
        .then(data => {
          console.log('📊 [COST HISTORY] Loaded:', data);
          setCostHistory(data);
        })
        .catch(err => console.error('Error fetching cost history:', err));
    }
  }, [productId, formProductId]);

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
                    Custo Final do Produto (R$) *
                  </FormLabel>
                  <FormControl>
                    <CurrencyInput 
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    Custo total incluindo TUDO: produto, frete, impostos (PIS, COFINS, ICMS, IPI), 
                    diferencial de alíquota, embalagem, etc.
                  </div>
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
                    Impostos sobre Venda (%) *
                  </FormLabel>
                  <FormControl>
                    <PercentInput 
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    Percentual usado APENAS nos canais de venda, aplicado sobre o preço de venda
                  </div>
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

          {/* Save Button */}
          {isEditing && (
            <div className="pt-4 border-t">
              <Button 
                onClick={saveCosts}
                disabled={isSaving}
                className="w-full"
                variant="default"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Custos
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Cost History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Custos
            </span>
            {costHistory.length > 6 && (
              <span className="text-sm font-normal text-muted-foreground">
                Últimas 6 atualizações
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {costHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Histórico será exibido após o primeiro salvamento</p>
              <p className="text-sm mt-2">
                Acompanhe a evolução dos custos ao longo do tempo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {costHistory.slice(0, 6).map((history, index) => {
                const prevCost = parseFloat(history.previousCost);
                const newCost = parseFloat(history.newCost);
                const percentChange = ((newCost - prevCost) / prevCost * 100).toFixed(2);
                const isIncrease = newCost > prevCost;
                
                return (
                  <div key={history.id || index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(history.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {history.observations && (
                            <Badge variant="secondary" className="text-xs">
                              Com observação
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatBRL(prevCost)}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatBRL(newCost)}
                          </span>
                          <Badge 
                            variant={isIncrease ? "destructive" : "default"} 
                            className="ml-2"
                          >
                            {isIncrease ? '+' : ''}{percentChange}%
                          </Badge>
                        </div>
                        
                        {history.observations && (
                          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                            {history.observations}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}