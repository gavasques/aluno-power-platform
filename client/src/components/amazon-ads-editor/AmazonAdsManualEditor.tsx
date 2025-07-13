import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, Edit3, Filter, AlertTriangle, CheckCircle, FileText, Users } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { DataTable } from './components/DataTable';
import { ValidationPanel } from './components/ValidationPanel';
import { ExportPanel } from './components/ExportPanel';
import { EditModal } from './components/EditModal';
import { BulkEditModal } from './components/BulkEditModal';
import { useAmazonData } from './hooks/useAmazonData';
import { useValidation } from './hooks/useValidation';
import { AmazonAdsRow, FileStats, BulkEditData } from './utils/types';

export const AmazonAdsManualEditor: React.FC = () => {
  // State management
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingRow, setEditingRow] = useState<AmazonAdsRow | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [error, setError] = useState<string>('');

  // Hooks
  const {
    data,
    filteredData,
    changes,
    filters,
    statistics,
    filterOptions,
    updateRow,
    bulkUpdate,
    undoChange,
    setFilters,
    resetData,
    loadData
  } = useAmazonData();

  const {
    validationErrors,
    validationStats,
    isValidating,
    canExport,
    validateAllData
  } = useValidation(data);

  // Handlers
  const handleDataLoad = useCallback((newData: AmazonAdsRow[], stats: FileStats, fileName: string) => {
    loadData(newData);
    setFileStats(stats);
    setCurrentFile(fileName);
    setError('');
    setSelectedRows(new Set());
  }, [loadData]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const handleRowSelect = useCallback((rowId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(filteredData.map(row => row._id!)));
    } else {
      setSelectedRows(new Set());
    }
  }, [filteredData]);

  const handleEditRow = useCallback((row: AmazonAdsRow) => {
    setEditingRow(row);
  }, []);

  const handleSaveRow = useCallback((updates: Partial<AmazonAdsRow>, reason?: string) => {
    if (editingRow) {
      updateRow(editingRow._id!, updates, reason);
      setEditingRow(null);
    }
  }, [editingRow, updateRow]);

  const handleBulkEdit = useCallback(() => {
    if (selectedRows.size === 0) {
      setError('Selecione pelo menos uma linha para editar em lote');
      return;
    }
    
    const selectedRowsData = data.filter(row => selectedRows.has(row._id!));
    setShowBulkEdit(true);
  }, [selectedRows, data]);

  const handleBulkSave = useCallback((updates: BulkEditData) => {
    const rowIds = Array.from(selectedRows);
    bulkUpdate(rowIds, updates);
    setSelectedRows(new Set());
    setShowBulkEdit(false);
  }, [selectedRows, bulkUpdate]);

  const handleNewUpload = useCallback(() => {
    resetData();
    setCurrentFile('');
    setFileStats(null);
    setError('');
    setSelectedRows(new Set());
    setShowValidation(false);
    setShowExport(false);
  }, [resetData]);

  // Effect to re-validate data when it changes
  useEffect(() => {
    if (data.length > 0) {
      validateAllData();
    }
  }, [data, validateAllData]);

  const selectedRowsData = data.filter(row => selectedRows.has(row._id!));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editor Manual Amazon Ads
            </h1>
            <p className="text-gray-600 mt-1">
              Carregue, edite e valide seus dados de campanhas Amazon Ads
            </p>
          </div>
          
          {data.length > 0 && (
            <button
              onClick={handleNewUpload}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Novo Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* File Upload */}
      {data.length === 0 && (
        <FileUploader
          onDataLoad={handleDataLoad}
          onError={handleError}
        />
      )}

      {/* Main Content */}
      {data.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Linhas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalRows.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Campanhas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalCampaigns.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Alterações</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalChanges.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                {validationStats.critical > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Validação</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {validationStats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBulkEdit}
                  disabled={selectedRows.size === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedRows.size > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar Selecionados ({selectedRows.size})</span>
                </button>
                
                <button
                  onClick={() => setShowValidation(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Validação ({validationStats.total})</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowExport(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  canExport
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canExport}
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={filteredData}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            onEditRow={handleEditRow}
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
          />
        </>
      )}

      {/* Modals */}
      <ValidationPanel
        errors={validationErrors}
        isVisible={showValidation}
        onClose={() => setShowValidation(false)}
      />

      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Exportar Dados
                </h2>
                <button
                  onClick={() => setShowExport(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="sr-only">Fechar</span>
                  ×
                </button>
              </div>
              
              <ExportPanel
                data={data}
                changes={changes}
                validationErrors={validationErrors}
                fileName={currentFile}
                onExportComplete={() => setShowExport(false)}
              />
            </div>
          </div>
        </div>
      )}

      {editingRow && (
        <EditModal
          row={editingRow}
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          onSave={handleSaveRow}
        />
      )}

      {showBulkEdit && (
        <BulkEditModal
          selectedRows={selectedRowsData}
          isOpen={showBulkEdit}
          onClose={() => setShowBulkEdit(false)}
          onSave={handleBulkSave}
        />
      )}

      {/* Loading Overlay */}
      {isValidating && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Validando dados...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};