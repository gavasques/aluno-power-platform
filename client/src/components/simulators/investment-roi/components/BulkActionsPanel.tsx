import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Settings, Zap } from 'lucide-react';
import { DEFAULT_BULK_VALUES } from '../types';
import { formatPercentage, sanitizeNumericInput } from '../utils';

interface BulkActionsPanelProps {
  bulkROI: number;
  bulkAporte: number;
  bulkRetirada: number;
  onBulkROIChange: (value: number) => void;
  onBulkAporteChange: (value: number) => void;
  onBulkRetiradaChange: (value: number) => void;
  onApplyBulkROI: () => void;
  onApplyBulkAporte: () => void;
  onApplyBulkRetirada: () => void;
}

export function BulkActionsPanel({
  bulkROI,
  bulkAporte,
  bulkRetirada,
  onBulkROIChange,
  onBulkAporteChange,
  onBulkRetiradaChange,
  onApplyBulkROI,
  onApplyBulkAporte,
  onApplyBulkRetirada
}: BulkActionsPanelProps) {
  const handlePercentageChange = (
    value: string,
    onChange: (value: number) => void
  ) => {
    const numericValue = sanitizeNumericInput(value);
    onChange(numericValue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Aplicação em Lote
        </CardTitle>
        <CardDescription>
          Aplique valores para todos os giros de uma vez
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bulk ROI */}
          <div className="space-y-2">
            <Label htmlFor="bulk-roi">ROI por Giro (%)</Label>
            <div className="flex gap-2">
              <Input
                id="bulk-roi"
                type="text"
                value={bulkROI.toString()}
                onChange={(e) => handlePercentageChange(e.target.value, onBulkROIChange)}
                placeholder="Ex: 20"
                className="flex-1"
              />
              <Button 
                onClick={onApplyBulkROI}
                size="sm"
                className="px-3"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(bulkROI)}
            </p>
          </div>

          {/* Bulk Aporte */}
          <div className="space-y-2">
            <Label htmlFor="bulk-aporte">Aporte por Giro</Label>
            <div className="flex gap-2">
              <CurrencyInput
                value={bulkAporte}
                onChange={onBulkAporteChange}
                placeholder="Ex: R$ 1.000"
                className="flex-1"
              />
              <Button 
                onClick={onApplyBulkAporte}
                size="sm"
                className="px-3"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Retirada */}
          <div className="space-y-2">
            <Label htmlFor="bulk-retirada">Retirada por Giro</Label>
            <div className="flex gap-2">
              <CurrencyInput
                value={bulkRetirada}
                onChange={onBulkRetiradaChange}
                placeholder="Ex: R$ 500"
                className="flex-1"
              />
              <Button 
                onClick={onApplyBulkRetirada}
                size="sm"
                className="px-3"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}