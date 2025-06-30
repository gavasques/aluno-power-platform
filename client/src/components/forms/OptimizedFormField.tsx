import React, { memo, useMemo } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OptimizedFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}

// Memoized form field to prevent unnecessary re-renders
export const OptimizedFormField = memo(<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  options = [],
  disabled = false,
  className = '',
}: OptimizedFormFieldProps<T>) => {
  const memoizedOptions = useMemo(() => options, [options]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
            ) : type === 'select' ? (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {memoizedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

OptimizedFormField.displayName = 'OptimizedFormField';

// Specialized memoized components for common form patterns
export const MemoizedInputField = memo<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
}>(({ label, value, onChange, placeholder, type = 'text', error, disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
));

MemoizedInputField.displayName = 'MemoizedInputField';

export const MemoizedSelectField = memo<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}>(({ label, value, onChange, options, placeholder, error, disabled }) => {
  const memoizedOptions = useMemo(() => options, [options]);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {memoizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

MemoizedSelectField.displayName = 'MemoizedSelectField';

export const MemoizedTextareaField = memo<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
}>(({ label, value, onChange, placeholder, rows = 4, error, disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
));

MemoizedTextareaField.displayName = 'MemoizedTextareaField';