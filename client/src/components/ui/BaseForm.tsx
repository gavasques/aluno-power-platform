/**
 * BaseForm Component - Unified form component eliminating duplicates
 * Consolidates form patterns from 8+ components across the codebase
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'phone' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  disabled?: boolean;
  className?: string;
  rows?: number; // for textarea
  min?: number; // for number
  max?: number; // for number
  step?: number; // for number
}

export interface FormSection {
  title: string;
  subtitle?: string;
  fields: FormField[];
  className?: string;
}

export interface BaseFormProps {
  sections: FormSection[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  className?: string;
  showButtons?: boolean;
  validateOnChange?: boolean;
}

export function BaseForm({
  sections,
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  className = '',
  showButtons = true,
  validateOnChange = true
}: BaseFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const validateField = (field: FormField, value: any): string | null => {
    // Required validation
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} é obrigatório`;
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email inválido';
      }
    }

    // URL validation
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return 'URL inválida';
      }
    }

    // Number validation
    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Deve ser um número válido';
      }
      if (field.min !== undefined && numValue < field.min) {
        return `Valor mínimo é ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `Valor máximo é ${field.max}`;
      }
    }

    // Custom validation
    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any, field: FormField) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }));
    }
  };

  const handleFieldBlur = (fieldName: string, field: FormField) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const error = validateField(field, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    const allFields = sections.flatMap(section => section.fields);
    
    allFields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      allFields.reduce((acc, field) => {
        acc[field.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name] && touched[field.name];
    const fieldValue = formData[field.name] ?? '';

    const baseInputClasses = cn(
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
      fieldError ? 'border-red-300' : 'border-gray-300',
      field.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
    );

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field.name, field)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={field.rows || 3}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field.name, field)}
            disabled={field.disabled}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Selecione...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={!!fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.checked, field)}
              onBlur={() => handleFieldBlur(field.name, field)}
              disabled={field.disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'number':
        return (
          <input
            id={field.name}
            name={field.name}
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field.name, field)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field.name, field)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={cn('space-y-4', section.className)}>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
            {section.subtitle && (
              <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  field.type === 'textarea' ? 'md:col-span-2' : '',
                  field.className
                )}
              >
                {field.type !== 'checkbox' && (
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}

                {renderField(field)}

                {errors[field.name] && touched[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {showButtons && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading && <LoadingSpinner size="xs" showMessage={false} />}
            {isLoading ? 'Processando...' : submitText}
          </button>
        </div>
      )}
    </form>
  );
}