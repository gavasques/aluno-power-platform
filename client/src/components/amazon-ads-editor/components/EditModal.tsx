import React, { useState, useCallback, useEffect } from 'react';
import { Save, AlertTriangle, Info } from 'lucide-react';
import { AmazonAdsRow, STATES, MATCH_TYPES, BIDDING_STRATEGIES } from '../utils/types';
import { formatCurrency } from '@/lib/utils/unifiedFormatters';
import { BaseModal } from '@/components/ui/BaseModal';

interface EditModalProps {
  row: AmazonAdsRow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<AmazonAdsRow>, reason?: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  row,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<AmazonAdsRow>>({});
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Inicializar form data quando row muda
  useEffect(() => {
    if (row) {
      setFormData({
        Estado: row.Estado,
        Lance: row.Lance,
        'Tipo de correspondência': row['Tipo de correspondência'],
        'Orçamento diário': row['Orçamento diário'],
        'Estratégia de lances': row['Estratégia de lances'],
        Porcentagem: row.Porcentagem
      });
    }
  }, [row]);

  // Validar formulário
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    // Validar lance
    if (formData.Lance !== undefined && formData.Lance !== null) {
      if (formData.Lance < 0.02) {
        newErrors.Lance = 'Lance deve ser no mínimo R$ 0,02';
      }
      if (formData.Lance > 100) {
        newErrors.Lance = 'Lance não pode exceder R$ 100,00';
      }
    }

    // Validar orçamento diário
    if (formData['Orçamento diário'] !== undefined && formData['Orçamento diário'] !== null) {
      if (formData['Orçamento diário'] < 1) {
        newErrors['Orçamento diário'] = 'Orçamento deve ser no mínimo R$ 1,00';
      }
      if (formData['Orçamento diário'] > 10000) {
        newErrors['Orçamento diário'] = 'Orçamento não pode exceder R$ 10.000,00';
      }
    }

    // Validar porcentagem
    if (formData.Porcentagem !== undefined && formData.Porcentagem !== null) {
      if (formData.Porcentagem < -90) {
        newErrors.Porcentagem = 'Porcentagem não pode ser menor que -90%';
      }
      if (formData.Porcentagem > 900) {
        newErrors.Porcentagem = 'Porcentagem não pode exceder 900%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // Filtrar apenas campos que foram alterados
    const changes: Partial<AmazonAdsRow> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (row[key as keyof AmazonAdsRow] !== value) {
        changes[key as keyof AmazonAdsRow] = value;
      }
    });

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    onSave(changes, reason || 'Edição manual');
    onClose();
  }, [formData, row, reason, validateForm, onSave, onClose]);

  const getFieldRelevance = (field: string) => {
    switch (field) {
      case 'Lance':
        return row.Entidade === 'Palavra-chave' ? 'required' : 'na';
      case 'Orçamento diário':
        return row.Entidade === 'Campanha' ? 'required' : 'na';
      case 'Tipo de correspondência':
        return row.Entidade === 'Palavra-chave' || row.Entidade === 'Palavra-chave negativa' ? 'required' : 'na';
      case 'Estratégia de lances':
        return row.Entidade === 'Campanha' ? 'optional' : 'na';
      case 'Porcentagem':
        return row.Entidade === 'Grupo de anúncios' ? 'optional' : 'na';
      default:
        return 'optional';
    }
  };

  const title = `Editar: ${row.Entidade}`;
  const subtitle = `${row['Nome da campanha']}${row['Texto de palavras-chave'] ? ` - ${row['Texto de palavras-chave']}` : ''}`;
  
  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={handleSave}
        disabled={Object.keys(errors).length > 0}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          Object.keys(errors).length === 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Save className="h-4 w-4" />
        <span>Salvar Alterações</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Subtitle */}
        <p className="text-sm text-gray-600 -mt-2">{subtitle}</p>
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={formData.Estado || ''}
              onChange={(e) => handleInputChange('Estado', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o estado</option>
              {Object.values(STATES).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Lance */}
          {getFieldRelevance('Lance') !== 'na' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lance {getFieldRelevance('Lance') === 'required' && '*'}
                <span className="text-xs text-gray-500 ml-1">
                  (R$ 0,02 - R$ 100,00)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.02"
                max="100"
                value={formData.Lance || ''}
                onChange={(e) => handleInputChange('Lance', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.Lance ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 2.50"
              />
              {errors.Lance && (
                <p className="mt-1 text-sm text-red-600">{errors.Lance}</p>
              )}
            </div>
          )}

          {/* Tipo de correspondência */}
          {getFieldRelevance('Tipo de correspondência') !== 'na' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de correspondência *
              </label>
              <select
                value={formData['Tipo de correspondência'] || ''}
                onChange={(e) => handleInputChange('Tipo de correspondência', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o tipo</option>
                {Object.values(MATCH_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {/* Orçamento diário */}
          {getFieldRelevance('Orçamento diário') !== 'na' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento diário {getFieldRelevance('Orçamento diário') === 'required' && '*'}
                <span className="text-xs text-gray-500 ml-1">
                  (R$ 1,00 - R$ 10.000,00)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="10000"
                value={formData['Orçamento diário'] || ''}
                onChange={(e) => handleInputChange('Orçamento diário', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors['Orçamento diário'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 100.00"
              />
              {errors['Orçamento diário'] && (
                <p className="mt-1 text-sm text-red-600">{errors['Orçamento diário']}</p>
              )}
            </div>
          )}

          {/* Estratégia de lances */}
          {getFieldRelevance('Estratégia de lances') !== 'na' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estratégia de lances
              </label>
              <select
                value={formData['Estratégia de lances'] || ''}
                onChange={(e) => handleInputChange('Estratégia de lances', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a estratégia</option>
                {Object.values(BIDDING_STRATEGIES).map(strategy => (
                  <option key={strategy} value={strategy}>{strategy}</option>
                ))}
              </select>
            </div>
          )}

          {/* Porcentagem */}
          {getFieldRelevance('Porcentagem') !== 'na' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentagem
                <span className="text-xs text-gray-500 ml-1">
                  (-90% a 900%)
                </span>
              </label>
              <input
                type="number"
                step="1"
                min="-90"
                max="900"
                value={formData.Porcentagem || ''}
                onChange={(e) => handleInputChange('Porcentagem', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.Porcentagem ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 50"
              />
              {errors.Porcentagem && (
                <p className="mt-1 text-sm text-red-600">{errors.Porcentagem}</p>
              )}
            </div>
          )}

          {/* Motivo da alteração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da alteração
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva o motivo desta alteração (opcional)"
            />
          </div>

        {/* Informações de performance */}
        {(row.Impressões || row.Cliques || row.Gastos) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Performance atual</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Impressões:</span>
                <span className="font-medium ml-1">{row.Impressões?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Cliques:</span>
                <span className="font-medium ml-1">{row.Cliques?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Gastos:</span>
                <span className="font-medium ml-1">{formatCurrency(row.Gastos || 0)}</span>
              </div>
              <div>
                <span className="text-gray-600">ACoS:</span>
                <span className="font-medium ml-1">{row.ACOS?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Corrija os erros antes de salvar</span>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};