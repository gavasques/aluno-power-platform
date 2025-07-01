import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'AE', name: 'Emirados Árabes', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
];

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CountrySelector({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o país",
  className 
}: CountrySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}