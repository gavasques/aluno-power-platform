/**
 * COMPONENTE: CountrySelect
 * Seletor de país para busca Amazon
 * Extraído de CompararListings.tsx para modularização
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelectProps, SUPPORTED_COUNTRIES } from '../../types';

export const CountrySelect = ({ value, onChange }: CountrySelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o país" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};