/**
 * COMPONENTE: AsinInput
 * Campo de entrada para ASIN com validação
 * Extraído de CompararListings.tsx para modularização
 */
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AsinInputProps } from '../../types';

export const AsinInput = ({
  value,
  index,
  error,
  canRemove,
  onChange,
  onRemove
}: AsinInputProps) => {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <div className="relative">
          <Input
            type="text"
            placeholder={`ASIN ${index + 1} (ex: B08N5WRWNW)`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`uppercase ${error ? 'border-red-500 focus:border-red-500' : ''}`}
            maxLength={10}
          />
          {value && value.length === 10 && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
      
      {canRemove && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 border-red-200 hover:bg-red-50 mt-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};