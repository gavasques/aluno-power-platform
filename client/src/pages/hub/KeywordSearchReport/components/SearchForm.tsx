import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { CountrySelector } from '@/components/common/CountrySelector';
import { CreditCostButton } from '@/components/CreditCostButton';
import type { SearchParams } from '../types';
import { SORT_OPTIONS, DEALS_OPTIONS } from '../types';

interface SearchFormProps {
  searchParams: SearchParams;
  isSearching: boolean;
  userBalance: string;
  onParamChange: (key: string, value: any) => void;
  onStartSearch: () => void;
  onStopSearch: () => void;
}

export const SearchForm = memo<SearchFormProps>(({
  searchParams,
  isSearching,
  userBalance,
  onParamChange,
  onStartSearch,
  onStopSearch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Parâmetros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Palavra-chave obrigatória */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="query">Palavra-chave *</Label>
            <Input
              id="query"
              placeholder="Digite a palavra-chave para buscar..."
              value={searchParams.query}
              onChange={(e) => onParamChange('query', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País *</Label>
            <CountrySelector
              value={searchParams.country}
              onValueChange={(value) => onParamChange('country', value)}
              placeholder="Selecione o país"
            />
          </div>
        </div>

        {/* Ordenação e Preços */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sort_by">Ordenar por *</Label>
            <Select value={searchParams.sort_by} onValueChange={(value) => onParamChange('sort_by', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_price">Preço Mínimo</Label>
            <Input
              id="min_price"
              type="number"
              placeholder="Ex: 10"
              value={searchParams.min_price}
              onChange={(e) => onParamChange('min_price', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_price">Preço Máximo</Label>
            <Input
              id="max_price"
              type="number"
              placeholder="Ex: 100"
              value={searchParams.max_price}
              onChange={(e) => onParamChange('max_price', e.target.value)}
            />
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              placeholder="Ex: Samsung, Apple..."
              value={searchParams.brand}
              onChange={(e) => onParamChange('brand', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller_id">ID do Vendedor</Label>
            <Input
              id="seller_id"
              placeholder="ID do vendedor (opcional)"
              value={searchParams.seller_id}
              onChange={(e) => onParamChange('seller_id', e.target.value)}
            />
          </div>
        </div>

        {/* Ofertas */}
        <div className="space-y-2">
          <Label htmlFor="deals">Ofertas e Descontos</Label>
          <Select value={searchParams.deals_and_discounts} onValueChange={(value) => onParamChange('deals_and_discounts', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEALS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão de Busca */}
        <div className="flex gap-3">
          <CreditCostButton
            featureName="tools.keyword_report"
            userBalance={Number(userBalance)}
            onProcess={onStartSearch}
            disabled={isSearching || !searchParams.query.trim()}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Buscando...' : 'Iniciar Busca (7 páginas)'}
          </CreditCostButton>
          
          {isSearching && (
            <Button variant="outline" onClick={onStopSearch}>
              Parar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});