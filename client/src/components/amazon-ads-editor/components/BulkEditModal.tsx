import React, { useState, useCallback, useMemo } from 'react';
import { X, Save, Users, AlertTriangle, Check } from 'lucide-react';
import { BulkEditData, AmazonAdsRow, STATES, MATCH_TYPES, BIDDING_STRATEGIES } from '../utils/types';

interface BulkEditModalProps {
  selectedRows: AmazonAdsRow[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BulkEditData) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  selectedRows,
  isOpen,
  onClose,
  onSave
}) => {
  const [updates, setUpdates] = useState<BulkEditData>({});
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Análise dos dados selecionados
  const selectionAnalysis = useMemo(() => {
    const entities = new Set(selectedRows.map(row => row.Entidade));
    const campaigns = new Set(selectedRows.map(row => row['Nome da campanha']));
    const states = new Set(selectedRows.map(row => row.Estado));
    
    return {
      totalRows: selectedRows.length,
      entities: Array.from(entities),
      campaigns: Array.from(campaigns),
      states: Array.from(states),
      hasKeywords: entities.has('Palavra-chave'),
      hasNegativeKeywords: entities.has('Palavra-chave negativa'),
      hasCampaigns: entities.has('Campanha'),
      hasAdGroups: entities.has('Grupo de anúncios')
    };
  }, [selectedRows]);

  const handleInputChange = useCallback((field: keyof BulkEditData, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    // Validar lance
    if (updates.Lance !== undefined && updates.Lance !== null) {
      if (updates.Lance < 0.02) {
        newErrors.Lance = 'Lance deve ser no mínimo R$ 0,02';
      }
      if (updates.Lance > 100) {
        newErrors.Lance = 'Lance não pode exceder R$ 100,00';
      }
    }

    // Validar orçamento diário
    if (updates['Orçamento diário'] !== undefined && updates['Orçamento diário'] !== null) {
      if (updates['Orçamento diário'] < 1) {
        newErrors['Orçamento diário'] = 'Orçamento deve ser no mínimo R$ 1,00';
      }
      if (updates['Orçamento diário'] > 10000) {
        newErrors['Orçamento diário'] = 'Orçamento não pode exceder R$ 10.000,00';
      }
    }

    // Validar porcentagem
    if (updates.Porcentagem !== undefined && updates.Porcentagem !== null) {
      if (updates.Porcentagem < -90) {
        newErrors.Porcentagem = 'Porcentagem não pode ser menor que -90%';
      }
      if (updates.Porcentagem > 900) {
        newErrors.Porcentagem = 'Porcentagem não pode exceder 900%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [updates]);

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const hasUpdates = Object.keys(updates).some(key => 
      key !== 'reason' && updates[key as keyof BulkEditData] !== undefined
    );

    if (!hasUpdates) {
      onClose();
      return;
    }

    onSave({
      ...updates,
      reason: reason || 'Edição em lote'
    });
    
    // Reset form
    setUpdates({});
    setReason('');
    onClose();
  }, [updates, reason, validateForm, onSave, onClose]);

  const getFieldApplicability = (field: string) => {
    switch (field) {
      case 'Lance':
        return selectionAnalysis.hasKeywords ? 'applicable' : 'not_applicable';
      case 'Orçamento diário':
        return selectionAnalysis.hasCampaigns ? 'applicable' : 'not_applicable';
      case 'Tipo de correspondência':
        return selectionAnalysis.hasKeywords || selectionAnalysis.hasNegativeKeywords ? 'applicable' : 'not_applicable';
      case 'Estratégia de lances':
        return selectionAnalysis.hasCampaigns ? 'applicable' : 'not_applicable';
      case 'Porcentagem':
        return selectionAnalysis.hasAdGroups ? 'applicable' : 'not_applicable';
      default:
        return 'applicable';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edição em Lote
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectionAnalysis.totalRows} linha(s) selecionada(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Analysis */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Análise da Seleção</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Entidades:</span>
              <div className="font-medium">
                {selectionAnalysis.entities.join(', ')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Campanhas:</span>
              <div className="font-medium">
                {selectionAnalysis.campaigns.length} única(s)
              </div>
            </div>
            <div>
              <span className="text-gray-600">Estados atuais:</span>
              <div className="font-medium">
                {selectionAnalysis.states.join(', ')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <div className="font-medium">
                {selectionAnalysis.totalRows} linha(s)
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
              <span className="text-green-600 ml-1">
                ✓ Aplicável a todas as linhas
              </span>
            </label>
            <select
              value={updates.Estado || ''}
              onChange={(e) => handleInputChange('Estado', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Manter valores atuais</option>
              {Object.values(STATES).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Lance */}
          {getFieldApplicability('Lance') === 'applicable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lance
                <span className="text-green-600 ml-1">
                  ✓ Aplicável a keywords
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  (R$ 0,02 - R$ 100,00)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.02"
                max="100"
                value={updates.Lance || ''}
                onChange={(e) => handleInputChange('Lance', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.Lance ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 2.50 (deixe vazio para manter valores atuais)"
              />
              {errors.Lance && (
                <p className="mt-1 text-sm text-red-600">{errors.Lance}</p>
              )}
            </div>
          )}

          {/* Tipo de correspondência */}
          {getFieldApplicability('Tipo de correspondência') === 'applicable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de correspondência
                <span className="text-green-600 ml-1">
                  ✓ Aplicável a keywords
                </span>
              </label>
              <select
                value={updates['Tipo de correspondência'] || ''}
                onChange={(e) => handleInputChange('Tipo de correspondência', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Manter valores atuais</option>
                {Object.values(MATCH_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {/* Orçamento diário */}
          {getFieldApplicability('Orçamento diário') === 'applicable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento diário
                <span className="text-green-600 ml-1">
                  ✓ Aplicável a campanhas
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  (R$ 1,00 - R$ 10.000,00)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="10000"
                value={updates['Orçamento diário'] || ''}
                onChange={(e) => handleInputChange('Orçamento diário', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors['Orçamento diário'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 100.00 (deixe vazio para manter valores atuais)"
              />
              {errors['Orçamento diário'] && (
                <p className="mt-1 text-sm text-red-600">{errors['Orçamento diário']}</p>
              )}
            </div>
          )}

          {/* Estratégia de lances */}
          {getFieldApplicability('Estratégia de lances') === 'applicable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estratégia de lances
                <span className="text-green-600 ml-1">
                  ✓ Aplicável a campanhas
                </span>
              </label>
              <select
                value={updates['Estratégia de lances'] || ''}
                onChange={(e) => handleInputChange('Estratégia de lances', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Manter valores atuais</option>
                {Object.values(BIDDING_STRATEGIES).map(strategy => (
                  <option key={strategy} value={strategy}>{strategy}</option>
                ))}
              </select>
            </div>
          )}

          {/* Porcentagem */}
          {getFieldApplicability('Porcentagem') === 'applicable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentagem
                <span className="text-green-600 ml-1">
                  ✓ Aplicável a grupos de anúncios
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  (-90% a 900%)
                </span>
              </label>
              <input
                type="number"
                step="1"
                min="-90"
                max="900"
                value={updates.Porcentagem || ''}
                onChange={(e) => handleInputChange('Porcentagem', parseFloat(e.target.value) || undefined)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.Porcentagem ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 50 (deixe vazio para manter valores atuais)"
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
              placeholder="Descreva o motivo desta alteração em lote (opcional)"
            />
          </div>

          {/* Preview das alterações */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Preview das Alterações</h4>
            <div className="text-sm text-blue-700 space-y-1">
              {Object.entries(updates).map(([key, value]) => 
                key !== 'reason' && value !== undefined && value !== '' && (
                  <div key={key} className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    <span>{key}: {String(value)}</span>
                  </div>
                )
              )}
              {Object.keys(updates).filter(key => key !== 'reason' && updates[key as keyof BulkEditData] !== undefined).length === 0 && (
                <p className="text-gray-600">Nenhuma alteração selecionada</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {Object.keys(errors).length > 0 && (
              <span className="text-red-600">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Corrija os erros antes de aplicar
              </span>
            )}
          </div>
          <div className="flex space-x-3">
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
              <span>Aplicar a {selectionAnalysis.totalRows} linha(s)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};