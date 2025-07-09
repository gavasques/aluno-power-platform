import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfiguracoesGerais } from '../types';
import { BrazilianNumberInput } from './BrazilianNumberInput';

interface ConfigurationPanelProps {
  config: ConfiguracoesGerais;
  onConfigChange: (field: keyof ConfiguracoesGerais, value: any) => void;
}

/**
 * Configuration panel component
 * Handles general simulation settings
 */
export const ConfigurationPanel = ({ config, onConfigChange }: ConfigurationPanelProps) => {
  // Safety check for config object
  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="taxa_cambio">Taxa de Câmbio USD/BRL</Label>
          <BrazilianNumberInput
            id="taxa_cambio"
            value={config.taxa_cambio_usd_brl || 0}
            onChange={(value) => onConfigChange('taxa_cambio_usd_brl', value)}
            decimals={4}
            min={0}
            placeholder="Ex: 5,20"
          />
        </div>
        
        <div>
          <Label htmlFor="aliquota_ii">Alíquota II (%)</Label>
          <BrazilianNumberInput
            id="aliquota_ii"
            value={(config.aliquota_ii_percentual || 0) * 100}
            onChange={(value) => onConfigChange('aliquota_ii_percentual', value / 100)}
            decimals={2}
            min={0}
            max={100}
            placeholder="Ex: 60,00"
          />
        </div>

        <div>
          <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
          <BrazilianNumberInput
            id="aliquota_icms"
            value={(config.aliquota_icms_percentual || 0) * 100}
            onChange={(value) => onConfigChange('aliquota_icms_percentual', value / 100)}
            decimals={2}
            min={0}
            max={100}
            placeholder="Ex: 17,00"
          />
        </div>

        <div>
          <Label htmlFor="frete_total">Custo Frete Internacional Total</Label>
          <BrazilianNumberInput
            id="frete_total"
            value={config.custo_frete_internacional_total_moeda_original || 0}
            onChange={(value) => onConfigChange('custo_frete_internacional_total_moeda_original', value)}
            decimals={2}
            min={0}
            placeholder="Ex: 1.500,00"
          />
        </div>

        <div>
          <Label htmlFor="moeda_frete">Moeda do Frete</Label>
          <Select 
            value={config.moeda_frete_internacional || "USD"}
            onValueChange={(value: "USD" | "BRL") => onConfigChange('moeda_frete_internacional', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="BRL">BRL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="outras_despesas">Outras Despesas Aduaneiras (BRL)</Label>
          <BrazilianNumberInput
            id="outras_despesas"
            value={config.outras_despesas_aduaneiras_total_brl || 0}
            onChange={(value) => onConfigChange('outras_despesas_aduaneiras_total_brl', value)}
            decimals={2}
            min={0}
            placeholder="Ex: 250,00"
          />
        </div>

        <div>
          <Label htmlFor="metodo_frete">Método Rateio Frete</Label>
          <Select 
            value={config.metodo_rateio_frete || "peso"}
            onValueChange={(value: "peso" | "valor_fob" | "quantidade") => onConfigChange('metodo_rateio_frete', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peso">Por Peso</SelectItem>
              <SelectItem value="valor_fob">Por Valor FOB</SelectItem>
              <SelectItem value="quantidade">Por Quantidade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="metodo_outras">Método Rateio Outras Despesas</Label>
          <Select 
            value={config.metodo_rateio_outras_despesas || "peso"}
            onValueChange={(value: "peso" | "valor_fob" | "quantidade") => onConfigChange('metodo_rateio_outras_despesas', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peso">Por Peso</SelectItem>
              <SelectItem value="valor_fob">Por Valor FOB</SelectItem>
              <SelectItem value="quantidade">Por Quantidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};