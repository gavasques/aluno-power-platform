import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatBrazilianNumber, parseBrazilianNumber } from '../utils';

interface BrazilianNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  placeholder?: string;
}

/**
 * Reusable Brazilian number input component
 * Handles Brazilian number formatting automatically
 */
export const BrazilianNumberInput = ({ 
  value, 
  onChange, 
  decimals = 2, 
  min, 
  max, 
  className, 
  id, 
  placeholder 
}: BrazilianNumberInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : formatBrazilianNumber(value, decimals));
    }
  }, [value, decimals, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseBrazilianNumber(inputValue);
    
    // Apply min/max constraints
    let constrainedValue = numericValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    onChange(constrainedValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Re-format the display value on blur
    if (value !== 0) {
      setDisplayValue(formatBrazilianNumber(value, decimals));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <Input
      id={id}
      className={className}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};