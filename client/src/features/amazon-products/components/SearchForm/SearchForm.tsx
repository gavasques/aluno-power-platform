/**
 * COMPONENTE: SearchForm
 * Formulário de busca para produtos Amazon
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package } from "lucide-react";
import { CreditCostButton } from '@/components/CreditCostButton';
import { CountrySelector } from '@/components/common/CountrySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SearchFormProps, CREDIT_COSTS } from '../../types';

export const SearchForm = ({
  asin,
  country,
  onAsinChange,
  onCountryChange,
  onSearch,
  isLoading,
  userBalance
}: SearchFormProps) => {
  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Detalhes do Produto Amazon
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 max-w-2xl mx-auto">
          Obtenha informações detalhadas de qualquer produto da Amazon usando o ASIN.
          Inclui preços, avaliações, especificações e muito mais.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ASIN Input */}
          <div className="space-y-2">
            <Label htmlFor="asin" className="text-sm font-medium text-gray-700">
              ASIN do Produto
            </Label>
            <Input
              id="asin"
              type="text"
              placeholder="Ex: B08N5WRWNW"
              value={asin}
              onChange={(e) => onAsinChange(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              O ASIN é encontrado na página do produto Amazon (código de 10 caracteres)
            </p>
          </div>

          {/* Country Selector */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              País/Região
            </Label>
            <CountrySelector
              value={country}
              onChange={onCountryChange}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Selecione o país da Amazon onde o produto está listado
            </p>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <CreditCostButton
            cost={CREDIT_COSTS.SEARCH_PRODUCT}
            userBalance={userBalance}
            onClick={onSearch}
            disabled={!asin.trim() || isLoading}
            className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Buscando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Buscar Produto</span>
              </div>
            )}
          </CreditCostButton>
          
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              Saldo: <span className="font-semibold">{userBalance} créditos</span>
            </p>
            <p className="text-xs text-gray-500">
              Esta busca custará {CREDIT_COSTS.SEARCH_PRODUCT} créditos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};