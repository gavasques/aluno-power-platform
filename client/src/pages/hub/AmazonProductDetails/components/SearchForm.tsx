import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { CountrySelector } from '@/components/common/CountrySelector';
import { CreditCostButton } from '@/components/CreditCostButton';
import type { UseAmazonProductSearchReturn } from '../types';

interface SearchFormProps {
  searchHook: UseAmazonProductSearchReturn;
}

/**
 * SEARCH FORM COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para formulário de busca
 * Responsabilidade única: Interface de busca de produtos Amazon
 */
export function SearchForm({ searchHook }: SearchFormProps) {
  const { searchState, updateSearchState, handleSearch, isLoading } = searchHook;

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900">
          <Search className="h-5 w-5 text-blue-600" />
          Consulta Detalhada de Produtos Amazon
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Digite o ASIN do produto para obter informações detalhadas diretamente da Amazon
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4">
          {/* ASIN Input */}
          <div className="space-y-2">
            <Label htmlFor="asin" className="text-sm font-medium text-gray-700">
              ASIN do Produto
            </Label>
            <Input
              id="asin"
              type="text"
              placeholder="Ex: B08N5WRWNW"
              value={searchState.asin}
              onChange={(e) => updateSearchState('asin', e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              O ASIN é o código único de identificação do produto na Amazon
            </p>
          </div>

          {/* Country Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              País da Amazon
            </Label>
            <CountrySelector
              value={searchState.country}
              onChange={(country) => updateSearchState('country', country)}
              disabled={isLoading}
            />
          </div>

          {/* Search Button */}
          <div className="pt-2">
            <CreditCostButton
              onClick={handleSearch}
              disabled={isLoading || !searchState.asin.trim()}
              isLoading={isLoading}
              featureCode="tools.product_details"
              requiredCredits={1}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Buscando...' : 'Buscar Produto'}
            </CreditCostButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}