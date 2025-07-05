import * as React from "react";
import { Input } from "./input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

const formatBRL = (value: number): string => {
  if (!value || value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseBRL = (value: string | number): number => {
  if (!value) return 0;
  // Converte para string se for número
  const stringValue = typeof value === 'number' ? value.toString() : value;
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = stringValue.replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto para parseFloat
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [lastValueProp, setLastValueProp] = React.useState<number | undefined>();

  // Atualiza o valor de exibição apenas quando o value prop mudar externamente
  // e o input não estiver focado
  React.useEffect(() => {
    // Só atualiza se:
    // 1. Input não está focado
    // 2. Value prop mudou de fato (não é o mesmo valor anterior)
    if (!isFocused && value !== lastValueProp) {
      const formattedValue = value ? formatBRL(value) : '';
      setInputValue(formattedValue);
      setLastValueProp(value);
    }
  }, [value, isFocused, lastValueProp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Chama onChange apenas com valores válidos
    const numericValue = parseBRL(newValue);
    onChange?.(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Formata o valor no blur se houver um valor válido
    const numericValue = parseBRL(inputValue);
    if (numericValue > 0) {
      setInputValue(formatBRL(numericValue));
    } else {
      setInputValue('');
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10">
        R$
      </span>
      <Input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`pl-12 ${className || ''}`}
        placeholder="0,00"
      />
    </div>
  );
}