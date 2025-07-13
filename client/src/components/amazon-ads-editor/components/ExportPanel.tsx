import React, { useState } from 'react';
import { Download, AlertTriangle, CheckCircle, FileText, Clock, Users } from 'lucide-react';
import { AmazonAdsRow, ValidationError, ChangeHistory, ValidationStats } from '../utils/types';
import { AmazonAdsValidator } from '../utils/validation';
import { AmazonAdsExporter } from '../utils/export';

interface ExportPanelProps {
  data: AmazonAdsRow[];
  changes: ChangeHistory[];
  validationErrors: ValidationError[];
  fileName: string;
  onExportComplete?: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  data,
  changes,
  validationErrors,
  fileName,
  onExportComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  const stats = AmazonAdsValidator.getValidationStats(validationErrors);
  const canExport = AmazonAdsValidator.canExport(validationErrors);
  const changedRowsCount = new Set(changes.map(c => c.rowIndex)).size;

  const handleExport = async () => {
    if (!canExport) {
      return;
    }

    setIsExporting(true);
    setExportStatus('exporting');

    try {
      await AmazonAdsExporter.exportToExcel(
        data,
        changes,
        validationErrors,
        fileName.replace('.xlsx', '')
      );
      
      setExportStatus('success');
      onExportComplete?.();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Erro no export:', error);
      setExportStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusContent = () => {
    switch (exportStatus) {
      case 'exporting':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500 animate-pulse" />,
          title: 'Gerando arquivo...',
          subtitle: 'Processando dados e aplicando formatação',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Export concluído!',
          subtitle: 'Arquivo baixado com sucesso',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          title: 'Erro no export',
          subtitle: 'Tente novamente em alguns instantes',
          bgColor: 'bg-red-50 border-red-200'
        };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Download className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export de Dados</h3>
            <p className="text-sm text-gray-600">
              Gerar arquivo Excel com dados editados
            </p>
          </div>
        </div>

        {/* Status do Export */}
        {statusContent && (
          <div className={`p-4 rounded-lg border mb-6 ${statusContent.bgColor}`}>
            <div className="flex items-center space-x-3">
              {statusContent.icon}
              <div>
                <p className="font-medium text-gray-900">{statusContent.title}</p>
                <p className="text-sm text-gray-600">{statusContent.subtitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Validação Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            {canExport ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span className={`font-medium ${canExport ? 'text-green-700' : 'text-red-700'}`}>
              {canExport ? 'Pronto para export' : 'Export bloqueado'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center p-2 bg-red-50 rounded border">
              <div className="font-semibold text-red-600">{stats.critical}</div>
              <div className="text-red-600">Críticos</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded border">
              <div className="font-semibold text-orange-600">{stats.errors}</div>
              <div className="text-orange-600">Erros</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded border">
              <div className="font-semibold text-yellow-600">{stats.warnings}</div>
              <div className="text-yellow-600">Avisos</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded border">
              <div className="font-semibold text-blue-600">{stats.suggestions}</div>
              <div className="text-blue-600">Sugestões</div>
            </div>
          </div>
        </div>

        {/* Resumo das Alterações */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Resumo das Alterações</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Total de linhas:</span>
              <span className="font-medium">{data.length.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Linhas alteradas:</span>
              <span className="font-medium">{changedRowsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Total de alterações:</span>
              <span className="font-medium">{changes.length.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Arquivo */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Conteúdo do arquivo gerado:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span>📊 Dados principais (formato Amazon)</span>
              <span className="text-xs text-gray-600">{data.length} linhas</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span>📈 Resumo executivo</span>
              <span className="text-xs text-gray-600">Estatísticas e métricas</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span>📝 Histórico de alterações</span>
              <span className="text-xs text-gray-600">{changes.length} alterações</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
              <span>🔍 Relatório de validação</span>
              <span className="text-xs text-gray-600">{validationErrors.length} itens</span>
            </div>
          </div>
        </div>

        {/* Botão de Export */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {!canExport && (
              <span className="text-red-600">
                ⚠ Corrija os erros críticos para liberar o export
              </span>
            )}
          </div>
          
          <button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              canExport && !isExporting
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Exportar Arquivo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};