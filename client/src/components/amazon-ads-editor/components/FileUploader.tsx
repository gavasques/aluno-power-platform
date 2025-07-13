import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AmazonAdsRow, FileStats } from '../utils/types';
import { validateFileStructure } from '../utils/validation';
import { generateFileStats } from '../utils/export';

interface FileUploaderProps {
  onDataLoad: (data: AmazonAdsRow[], stats: FileStats, fileName: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onDataLoad, 
  onError, 
  isLoading = false 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const processFile = useCallback(async (file: File) => {
    setUploadStatus('processing');
    
    try {
      // Validar tipo de arquivo
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        throw new Error('Apenas arquivos .xlsx são aceitos');
      }

      // Validar tamanho (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo permitido: 50MB');
      }

      // Ler arquivo
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Validar estrutura
      const validation = validateFileStructure(workbook);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }

      // Processar dados
      const sheetName = 'Sponsored Products Campaigns';
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as AmazonAdsRow[];

      if (jsonData.length === 0) {
        throw new Error('A planilha não contém dados');
      }

      // Adicionar metadados internos
      const processedData = jsonData.map((row, index) => ({
        ...row,
        _id: `row_${index}_${Date.now()}`,
        _originalIndex: index,
        _hasChanges: false,
        _validationErrors: []
      }));

      // Gerar estatísticas
      const stats = generateFileStats(processedData, file.size);

      setUploadStatus('success');
      onDataLoad(processedData, stats, file.name);
      
    } catch (error) {
      setUploadStatus('error');
      onError(error instanceof Error ? error.message : 'Erro ao processar arquivo');
    }
  }, [onDataLoad, onError]);

  const handleFileSelect = useCallback((file: File) => {
    processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <Upload className="h-8 w-8 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileSpreadsheet className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Processando arquivo...';
      case 'success':
        return 'Arquivo carregado com sucesso!';
      case 'error':
        return 'Erro ao carregar arquivo';
      default:
        return 'Arraste um arquivo .xlsx aqui ou clique para selecionar';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'border-blue-300 bg-blue-50';
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${getStatusColor()} ${
          !isLoading && uploadStatus !== 'processing' ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!isLoading && uploadStatus !== 'processing') {
            const input = document.getElementById('file-input') as HTMLInputElement;
            input?.click();
          }
        }}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading || uploadStatus === 'processing'}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {getStatusText()}
            </p>
            
            {uploadStatus === 'idle' && (
              <p className="text-sm text-gray-500 mt-2">
                Formato aceito: Excel (.xlsx) • Tamanho máximo: 50MB
              </p>
            )}
            
            {uploadStatus === 'success' && (
              <p className="text-sm text-green-600 mt-2">
                Dados carregados e prontos para edição
              </p>
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Carregando...</span>
            </div>
          </div>
        )}
      </div>
      
      {uploadStatus === 'idle' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Requisitos do arquivo:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Arquivo Excel (.xlsx) exportado do Amazon Ads</li>
            <li>• Deve conter a aba "Sponsored Products Campaigns"</li>
            <li>• Colunas obrigatórias: Produto, Entidade, Nome da campanha, Estado</li>
            <li>• Tamanho máximo: 50MB</li>
          </ul>
        </div>
      )}
    </div>
  );
};