import * as React from "react";
import { Input } from "./input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => {
    if (value === undefined || value === null || value === 0) return '';
    return formatCurrency(value);
  });

  React.useEffect(() => {
    if (value === undefined || value === null || value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);

  const formatCurrency = (num: number): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrency = (str: string): number => {
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = str.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Se estiver vazio, limpa o valor
    if (!inputValue) {
      setDisplayValue('');
      onChange?.(0);
      return;
    }

    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleaned = inputValue.replace(/[^\d,.-]/g, '');
    setDisplayValue(cleaned);

    // Parse do valor para número
    const numericValue = parseCurrency(cleaned);
    if (!isNaN(numericValue)) {
      onChange?.(numericValue);
    }
  };

  const handleBlur = () => {
    if (displayValue) {
      const numericValue = parseCurrency(displayValue);
      if (!isNaN(numericValue) && numericValue > 0) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        {...props}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="pl-10"
        placeholder="0,00"
      />
    </div>
  );
}