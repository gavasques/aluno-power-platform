import React from 'react';
import { Input } from './input';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, ...props }) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    // Format as + XX XX XXXXXXXXX
    const numbers = cleaned.substring(1); // Remove the +
    
    if (numbers.length <= 2) {
      return '+' + numbers;
    } else if (numbers.length <= 4) {
      return '+' + numbers.substring(0, 2) + ' ' + numbers.substring(2);
    } else {
      return '+' + numbers.substring(0, 2) + ' ' + numbers.substring(2, 4) + ' ' + numbers.substring(4, 13);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      placeholder="+ XX XX XXXXXXXXX"
      maxLength={17} // + XX XX XXXXXXXXX = 17 characters max
    />
  );
};