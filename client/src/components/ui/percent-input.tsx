import * as React from "react";
import { Input } from "./input";

interface PercentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

const formatPercent = (num: number): string => {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  });
};

const parsePercent = (str: string | number): number => {
  if (!str) return 0;
  // Converte para string se for número
  const stringValue = typeof str === 'number' ? str.toString() : str;
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = stringValue.replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
};

export function PercentInput({ value, onChange, ...props }: PercentInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => {
    if (value === undefined || value === null || value === 0) return '';
    return formatPercent(value);
  });
  const [isUserInput, setIsUserInput] = React.useState(false);

  React.useEffect(() => {
    // Só atualiza se não for input do usuário
    if (!isUserInput) {
      if (value === undefined || value === null || value === 0) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatPercent(value));
      }
    }
  }, [value, isUserInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setIsUserInput(true);
    
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
    const numericValue = parsePercent(cleaned);
    if (!isNaN(numericValue)) {
      onChange?.(numericValue);
    }
  };

  const handleBlur = () => {
    setIsUserInput(false);
    if (displayValue) {
      const numericValue = parsePercent(displayValue);
      if (!isNaN(numericValue) && numericValue >= 0) {
        setDisplayValue(formatPercent(numericValue));
      }
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="pr-8"
        placeholder="0,0"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  );
}