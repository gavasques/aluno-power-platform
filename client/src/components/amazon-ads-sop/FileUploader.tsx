import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import { AmazonKeyword } from './types';

interface FileUploaderProps {
  onFileUpload: (data: AmazonKeyword[]) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onError,
  isProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const normalizeData = (rawData: any[]): AmazonKeyword[] => {
    return rawData.map(row => {
      // Mapeamento de campos possíveis da Amazon
      const normalized: AmazonKeyword = {
        // Campos em português (Amazon Brasil)
        produto: row['Produto'] || row['produto'],
        entidade: row['Entidade'] || row['entidade'],
        operacao: row['Operação'] || row['Operacao'] || row['operacao'],
        identificadorCampanha: row['ID da campanha'] || row['Identificador da Campanha'],
        identificadorGrupoAnuncios: row['ID do grupo de anúncios'] || row['Identificador do Grupo de Anúncios'],
        nomeCampanha: row['Nome da campanha'] || row['Campaign Name'] || row['Nome da Campanha'],
        nomeGrupoAnuncios: row['Nome do grupo de anúncios'] || row['Ad Group Name'] || row['Nome do Grupo de Anúncios'],
        estado: row['Estado'] || row['State'] || row['Status'],
        textopalavraChave: row['Texto da palavra-chave direcionada'] || row['Targeting'] || row['Keyword'],
        tipoCorrespondencia: row['Tipo de correspondência'] || row['Match Type'],
        lance: parseFloat(row['Lance'] || row['Bid'] || 0),
        impressoes: parseInt(row['Impressões'] || row['Impressions'] || 0),
        cliques: parseInt(row['Cliques'] || row['Clicks'] || 0),
        taxaCliques: parseFloat(row['CTR'] || row['Click-Through Rate'] || 0),
        gastos: parseFloat(row['Gastos'] || row['Spend'] || 0),
        vendas: parseFloat(row['Vendas'] || row['Sales'] || 0),
        pedidos: parseInt(row['Pedidos'] || row['Orders'] || 0),
        unidades: parseInt(row['Unidades vendidas'] || row['Units Sold'] || 0),
        taxaConversao: parseFloat(row['Taxa de conversão'] || row['Conversion Rate'] || 0),
        acos: parseFloat(row['ACoS'] || 0),
        cpc: parseFloat(row['CPC'] || 0),
        roas: parseFloat(row['RoAS'] || 0),
        
        // Campos alternativos em inglês
        campaign: row['Campaign Name'] || row['Nome da Campanha'],
        adGroup: row['Ad Group Name'] || row['Nome do Grupo de Anúncios'],
        keyword: row['Keyword'] || row['Targeting'] || row['Texto da palavra-chave direcionada'],
        bid: parseFloat(row['Bid'] || row['Lance'] || 0),
        clicks: parseInt(row['Clicks'] || row['Cliques'] || 0),
        impressions: parseInt(row['Impressions'] || row['Impressões'] || 0),
        orders: parseInt(row['Orders'] || row['Pedidos'] || 0),
        spend: parseFloat(row['Spend'] || row['Gastos'] || 0),
        sales: parseFloat(row['Sales'] || row['Vendas'] || 0),
        ctr: parseFloat(row['CTR'] || row['taxaCliques'] || 0),
        conversionRate: parseFloat(row['Conversion Rate'] || row['Taxa de conversão'] || 0),
      };

      return normalized;
    });
  };

  const validateData = (data: AmazonKeyword[]): { valid: boolean; message?: string } => {
    if (data.length === 0) {
      return { valid: false, message: 'Planilha vazia ou formato inválido' };
    }

    // Verificar se tem pelo menos alguns dados essenciais
    const validRows = data.filter(row => 
      (row.cliques || row.clicks || 0) > 0 || 
      (row.impressoes || row.impressions || 0) > 0
    );

    if (validRows.length === 0) {
      return { valid: false, message: 'Nenhuma keyword com dados de performance encontrada' };
    }

    // Verificar se tem campos obrigatórios
    const hasRequiredFields = validRows.some(row => 
      (row.lance || row.bid || 0) > 0 && 
      (row.textopalavraChave || row.keyword)
    );

    if (!hasRequiredFields) {
      return { valid: false, message: 'Campos obrigatórios não encontrados: Lance/Bid e Keyword' };
    }

    return { valid: true };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Validar tipo de arquivo
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Por favor, envie apenas arquivos Excel (.xlsx ou .xls)');
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo permitido: 10MB');
      }

      setUploadedFile(file);

      // Processar arquivo Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Procurar aba com dados de campaigns/keywords
      const relevantSheets = workbook.SheetNames.filter(name => 
        name.toLowerCase().includes('sponsored') || 
        name.toLowerCase().includes('campaign') ||
        name.toLowerCase().includes('keyword') ||
        name.toLowerCase().includes('search')
      );
      
      const sheetName = relevantSheets[0] || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        throw new Error('Planilha vazia ou formato inválido');
      }

      // Normalizar e validar dados
      const normalizedData = normalizeData(rawData);
      const validation = validateData(normalizedData);
      
      if (!validation.valid) {
        throw new Error(validation.message || 'Dados inválidos');
      }

      onFileUpload(normalizedData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar arquivo Excel';
      onError(message);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isProcessing || isUploading
  });

  const resetUpload = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer ${
              isProcessing || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {uploadedFile ? (
                <>
                  <div className="relative">
                    <FileSpreadsheet className="w-16 h-16 text-green-500" />
                    <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-green-700">
                      Arquivo carregado com sucesso!
                    </p>
                    <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className={`w-16 h-16 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isUploading ? 'Processando arquivo...' :
                       isDragActive ? 'Solte o arquivo aqui...' : 
                       'Arraste sua planilha Amazon Ads aqui'}
                    </p>
                    <p className="text-sm text-gray-500">
                      ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Formatos aceitos: .xlsx, .xls (máximo 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFile && !isProcessing && !isUploading && (
        <div className="flex justify-center">
          <Button
            onClick={resetUpload}
            variant="outline"
            size="sm"
          >
            Carregar outro arquivo
          </Button>
        </div>
      )}

      {/* Instruções de uso */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Use a planilha de relatório de Search Terms ou Campaigns exportada diretamente da Amazon Ads. 
          A ferramenta detecta automaticamente keywords, campanhas, lances, cliques, gastos e outras métricas essenciais.
        </AlertDescription>
      </Alert>
    </div>
  );
};