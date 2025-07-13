import React, { useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Filter } from 'lucide-react';
import { ValidationError, ValidationStats } from '../utils/types';
import { AmazonAdsValidator } from '../utils/validation';

interface ValidationPanelProps {
  errors: ValidationError[];
  isVisible: boolean;
  onClose: () => void;
  onFilterByError?: (error: ValidationError) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  errors,
  isVisible,
  onClose,
  onFilterByError
}) => {
  const stats = useMemo(() => AmazonAdsValidator.getValidationStats(errors), [errors]);
  const canExport = useMemo(() => AmazonAdsValidator.canExport(errors), [errors]);

  const groupedErrors = useMemo(() => {
    const groups: { [key: string]: ValidationError[] } = {};
    errors.forEach(error => {
      if (!groups[error.category]) {
        groups[error.category] = [];
      }
      groups[error.category].push(error);
    });
    return groups;
  }, [errors]);

  const getErrorIcon = (type: ValidationError['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getErrorBgColor = (type: ValidationError['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Validação</h2>
            <p className="text-sm text-gray-600 mt-1">
              {errors.length === 0 ? 'Nenhum problema encontrado' : `${errors.length} item(ns) encontrado(s)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-gray-600">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.errors}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
              <div className="text-sm text-gray-600">Avisos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.suggestions}</div>
              <div className="text-sm text-gray-600">Sugestões</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${canExport ? 'text-green-600' : 'text-red-600'}`}>
                {canExport ? <CheckCircle className="h-8 w-8 mx-auto" /> : <X className="h-8 w-8 mx-auto" />}
              </div>
              <div className="text-sm text-gray-600">
                {canExport ? 'Export Liberado' : 'Export Bloqueado'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {errors.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tudo certo!
              </h3>
              <p className="text-gray-600">
                Nenhum problema de validação foi encontrado nos dados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedErrors).map(([category, categoryErrors]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                    {category} ({categoryErrors.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryErrors.map((error, index) => (
                      <div
                        key={`${category}-${index}`}
                        className={`p-3 rounded-lg border ${getErrorBgColor(error.type)} ${
                          onFilterByError ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                        }`}
                        onClick={() => onFilterByError?.(error)}
                      >
                        <div className="flex items-start space-x-3">
                          {getErrorIcon(error.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {error.field}
                              </span>
                              <span className="text-xs bg-white px-2 py-1 rounded border">
                                Severidade: {error.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{error.message}</p>
                            {onFilterByError && (
                              <div className="mt-2 flex items-center text-xs text-blue-600">
                                <Filter className="h-3 w-3 mr-1" />
                                Clique para filtrar
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {canExport ? (
                <span className="text-green-600 font-medium">
                  ✓ Pronto para export
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  ⚠ Corrija os erros críticos antes de exportar
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};