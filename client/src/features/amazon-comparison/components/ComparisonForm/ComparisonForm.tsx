/**
 * COMPONENTE: ComparisonForm
 * Formulário para entrada de dados de comparação
 * Extraído de CompararListings.tsx para modularização
 */
import { Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Import components
import { AsinInput } from '../AsinInput/AsinInput';
import { CountrySelect } from '../CountrySelect/CountrySelect';

// Import types
import { ComparisonFormProps, MAX_ASINS, MIN_ASINS } from '../../types';

export const ComparisonForm = ({
  asins,
  country,
  loading,
  errors,
  onAddAsin,
  onRemoveAsin,
  onAsinChange,
  onCountryChange,
  onCompare
}: ComparisonFormProps) => {

  const canAddMore = asins.length < MAX_ASINS;
  const canRemove = asins.length > MIN_ASINS;
  const validAsins = asins.filter(asin => asin.trim()).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Configurar Comparação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country-select">País de Busca</Label>
          <CountrySelect
            value={country}
            onChange={onCountryChange}
          />
          {errors.country && (
            <p className="text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* ASIN Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>ASINs dos Produtos ({validAsins}/{MAX_ASINS})</Label>
            {canAddMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddAsin}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar ASIN
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {asins.map((asin, index) => (
              <AsinInput
                key={index}
                value={asin}
                index={index}
                error={errors.asins?.[index]}
                canRemove={canRemove}
                onChange={(value) => onAsinChange(index, value)}
                onRemove={() => onRemoveAsin(index)}
              />
            ))}
          </div>

          {errors.asins && errors.asins.some(error => error) && (
            <div className="text-sm text-red-600">
              Corrija os ASINs inválidos antes de continuar
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={onCompare}
            disabled={loading || validAsins < MIN_ASINS}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Comparando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Comparar Produtos
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-500 flex items-center justify-center">
            Custo: 5 créditos
          </div>
        </div>

        {/* Validation Summary */}
        {validAsins > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{validAsins}</strong> ASIN{validAsins !== 1 ? 's' : ''} válido{validAsins !== 1 ? 's' : ''} 
              {validAsins >= MIN_ASINS ? (
                <span className="text-green-600 ml-2">✓ Pronto para comparar</span>
              ) : (
                <span className="text-orange-600 ml-2">
                  ⚠ Adicione mais {MIN_ASINS - validAsins} ASIN{MIN_ASINS - validAsins !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};