
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormattedInputProps {
  value: number;
  onChange: (value: number) => void;
  type: 'currency' | 'percentage';
  placeholder?: string;
  className?: string;
}

export const FormattedInput = ({ 
  value, 
  onChange, 
  type, 
  placeholder,
  className 
}: FormattedInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Formatar valor para exibição
  const formatDisplay = (num: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(num);
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num / 100);
    }
  };

  // Atualizar display quando value muda
  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatDisplay(value));
      }
    }
  }, [value, isFocused, type]);

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar apenas o número quando em foco
    setDisplayValue(value === 0 ? '' : value.toString().replace('.', ','));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Converter e formatar
    const numericValue = parseFloat(displayValue.replace(',', '.')) || 0;
    onChange(numericValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Permitir apenas números, vírgula e ponto
    const sanitized = inputValue.replace(/[^0-9,.-]/g, '');
    setDisplayValue(sanitized);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir Enter para confirmar
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn(className)}
    />
  );
};
