import React from 'react';
import { Input } from './input';
import { formatCurrency } from '@/lib/utils/unifiedFormatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  isEditable?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder, className, isEditable = true }: CurrencyInputProps) {
  const formatCurrency = (value: number): string => {
    return formatters.currency(value, { precision: 0 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    
    const rawValue = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(rawValue || '0', 10);
    onChange(numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode) ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey) ||
        (e.keyCode === 67 && e.ctrlKey) ||
        (e.keyCode === 86 && e.ctrlKey) ||
        (e.keyCode === 88 && e.ctrlKey)) {
      return;
    }
    // Only allow numbers
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <Input
      type="text"
      value={formatCurrency(value)}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      readOnly={!isEditable}
    />
  );
}