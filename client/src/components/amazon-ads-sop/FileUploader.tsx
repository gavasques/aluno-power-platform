import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Sheets, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { AmazonKeyword } from './types';

interface SheetInfo {
  name: string;
  rows: number;
  columns: string[];
  hasKeywords: boolean;
  hasPerformanceData: boolean;
  score: number;
}

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
  const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbookData, setWorkbookData] = useState<XLSX.WorkBook | null>(null);

  // Mapeamento expandido de campos do Amazon Ads (em português e inglês)
  const fieldMappings = {
    keyword: [
      'Texto da palavra-chave direcionada', 'Keyword', 'Targeting', 'Search term', 
      'Termo de pesquisa', 'Palavra-chave', 'palavra-chave', 'Keywords', 
      'Target', 'Query', 'Term', 'Texto da Palavra-chave Direcionada'
    ],
    campaign: [
      'Nome da campanha', 'Campaign Name', 'Campaign', 'Nome da Campanha',
      'Campanha', 'Campaign name', 'Nome campanha'
    ],
    adGroup: [
      'Nome do grupo de anúncios', 'Ad Group Name', 'Ad Group', 'Nome do Grupo de Anúncios',
      'Grupo de anúncios', 'AdGroup', 'Ad group name', 'Nome grupo'
    ],
    bid: [
      'Lance', 'Bid', 'Max Bid', 'Max. Bid', 'Lance máx.', 'Lance maximo',
      'Bid Amount', 'Lance (R$)', 'Lance R$', 'Valor do lance'
    ],
    clicks: [
      'Cliques', 'Clicks', 'Click', 'Total Clicks', 'Número de cliques'
    ],
    impressions: [
      'Impressões', 'Impressions', 'Impr.', 'Total Impressions', 'Número de impressões',
      'Impressoes'
    ],
    spend: [
      'Gastos', 'Spend', 'Cost', 'Total Spend', 'Gastos (R$)', 'Custo',
      'Spent', 'Total Cost', 'Gasto total'
    ],
    sales: [
      'Vendas', 'Sales', 'Revenue', 'Total Sales', 'Vendas (R$)', 'Receita',
      'Total Revenue', 'Faturamento'
    ],
    orders: [
      'Pedidos', 'Orders', 'Total Orders', 'Número de pedidos', 'Conversions',
      'Conversões', 'Units Ordered', 'Unidades pedidas'
    ],
    acos: [
      'ACoS', 'ACOS', 'ACoS (%)', 'ACOS %', 'Advertising Cost of Sales'
    ],
    cpc: [
      'CPC', 'Cost Per Click', 'Custo por clique', 'CPC (R$)', 'Average CPC'
    ],
    ctr: [
      'CTR', 'Click-Through Rate', 'Taxa de cliques', 'CTR (%)', 'Click through rate'
    ],
    conversionRate: [
      'Taxa de conversão', 'Conversion Rate', 'CVR', 'Conversion Rate (%)', 'CR'
    ]
  };

  const detectFieldType = (columnName: string): string | null => {
    const normalizedColumn = columnName.toLowerCase().trim();
    
    for (const [fieldType, variations] of Object.entries(fieldMappings)) {
      for (const variation of variations) {
        if (normalizedColumn.includes(variation.toLowerCase()) || 
            variation.toLowerCase().includes(normalizedColumn)) {
          return fieldType;
        }
      }
    }
    return null;
  };

  const analyzeSheet = (workbook: XLSX.WorkBook, sheetName: string): SheetInfo => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const columns = data.length > 0 ? Object.keys(data[0] as any) : [];
    
    // Detectar se tem keywords
    const hasKeywords = columns.some(col => detectFieldType(col) === 'keyword');
    
    // Detectar se tem dados de performance
    const hasPerformanceData = columns.some(col => 
      ['clicks', 'impressions', 'spend'].includes(detectFieldType(col) || '')
    );
    
    // Calcular score baseado na relevância
    let score = 0;
    if (hasKeywords) score += 40;
    if (hasPerformanceData) score += 30;
    if (columns.some(col => detectFieldType(col) === 'bid')) score += 20;
    if (columns.some(col => detectFieldType(col) === 'campaign')) score += 10;
    
    // Bonus por nomes de aba relevantes
    const relevantSheetNames = ['sponsored', 'campaign', 'keyword', 'search', 'ads', 'ppc'];
    if (relevantSheetNames.some(name => sheetName.toLowerCase().includes(name))) {
      score += 20;
    }

    return {
      name: sheetName,
      rows: data.length,
      columns,
      hasKeywords,
      hasPerformanceData,
      score
    };
  };

  const normalizeData = (rawData: any[], columns: string[]): AmazonKeyword[] => {
    // Criar mapeamento de colunas para campos
    const columnMapping: { [key: string]: string } = {};
    
    columns.forEach(col => {
      const fieldType = detectFieldType(col);
      if (fieldType) {
        columnMapping[fieldType] = col;
      }
    });

    return rawData.map(row => {
      const getFieldValue = (fieldType: string, isNumeric = false) => {
        const column = columnMapping[fieldType];
        if (!column) return isNumeric ? 0 : '';
        
        const value = row[column];
        if (value === null || value === undefined || value === '') {
          return isNumeric ? 0 : '';
        }
        
        if (isNumeric) {
          // Limpar formatação de moeda e converter para número
          const cleaned = String(value).replace(/[R$\s%,]/g, '').replace(',', '.');
          return parseFloat(cleaned) || 0;
        }
        
        return String(value);
      };

      const normalized: AmazonKeyword = {
        // Campos principais detectados automaticamente
        textopalavraChave: getFieldValue('keyword'),
        nomeCampanha: getFieldValue('campaign'),
        nomeGrupoAnuncios: getFieldValue('adGroup'),
        lance: getFieldValue('bid', true),
        cliques: getFieldValue('clicks', true),
        impressoes: getFieldValue('impressions', true),
        gastos: getFieldValue('spend', true),
        vendas: getFieldValue('sales', true),
        pedidos: getFieldValue('orders', true),
        acos: getFieldValue('acos', true) / 100, // Converter % para decimal
        cpc: getFieldValue('cpc', true),
        taxaCliques: getFieldValue('ctr', true) / 100, // Converter % para decimal
        taxaConversao: getFieldValue('conversionRate', true) / 100,
        
        // Campos alternativos (compatibilidade)
        keyword: getFieldValue('keyword'),
        campaign: getFieldValue('campaign'),
        adGroup: getFieldValue('adGroup'),
        bid: getFieldValue('bid', true),
        clicks: getFieldValue('clicks', true),
        impressions: getFieldValue('impressions', true),
        spend: getFieldValue('spend', true),
        sales: getFieldValue('sales', true),
        orders: getFieldValue('orders', true),
        ctr: getFieldValue('ctr', true) / 100,
        conversionRate: getFieldValue('conversionRate', true) / 100,
        
        // Campos adicionais
        estado: row[columnMapping['state']] || 'enabled',
        tipoCorrespondencia: row[columnMapping['matchType']] || 'broad'
      };

      return normalized;
    });
  };

  const validateData = (data: AmazonKeyword[]): { valid: boolean; message?: string } => {
    if (data.length === 0) {
      return { valid: false, message: 'Planilha vazia ou formato inválido' };
    }

    // Verificar se tem dados básicos
    const rowsWithData = data.filter(row => 
      (row.cliques || row.clicks || 0) > 0 || 
      (row.impressoes || row.impressions || 0) > 0 ||
      (row.gastos || row.spend || 0) > 0
    );

    if (rowsWithData.length === 0) {
      return { valid: false, message: 'Nenhuma keyword com dados de performance encontrada. Verifique se selecionou a aba correta.' };
    }

    // Verificar se tem keywords
    const rowsWithKeywords = data.filter(row => 
      (row.textopalavraChave || row.keyword || '').trim() !== ''
    );

    if (rowsWithKeywords.length === 0) {
      return { valid: false, message: 'Nenhuma keyword encontrada. Verifique se a planilha contém dados de Search Terms ou Keywords.' };
    }

    console.log(`✅ Validação passou: ${rowsWithKeywords.length} keywords com dados válidos encontradas`);
    return { valid: true };
  };

  const processSelectedSheet = async () => {
    if (!workbookData || !selectedSheet) return;

    try {
      setIsUploading(true);
      
      const worksheet = workbookData.Sheets[selectedSheet];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        throw new Error('Aba selecionada está vazia');
      }

      const columns = Object.keys(rawData[0] as any);
      const normalizedData = normalizeData(rawData, columns);
      const validation = validateData(normalizedData);
      
      if (!validation.valid) {
        throw new Error(validation.message || 'Dados inválidos');
      }

      console.log(`✅ Processando ${normalizedData.length} linhas da aba "${selectedSheet}"`);
      onFileUpload(normalizedData);
      
    } catch (error) {
      console.error('Erro ao processar aba:', error);
      onError(error instanceof Error ? error.message : 'Erro ao processar dados');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setAvailableSheets([]);
    setSelectedSheet('');

    try {
      // Validar tipo de arquivo
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Por favor, envie apenas arquivos Excel (.xlsx ou .xls)');
      }

      // Validar tamanho (máximo 20MB para planilhas maiores do Amazon)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo permitido: 20MB');
      }

      setUploadedFile(file);

      // Processar arquivo Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      setWorkbookData(workbook);
      
      // Analisar todas as abas
      const sheetsInfo = workbook.SheetNames.map(name => analyzeSheet(workbook, name));
      
      // Ordenar por score (relevância)
      sheetsInfo.sort((a, b) => b.score - a.score);
      setAvailableSheets(sheetsInfo);
      
      // Se só tem uma aba ou a melhor tem score alto, selecionar automaticamente
      if (sheetsInfo.length === 1 || sheetsInfo[0].score >= 60) {
        setSelectedSheet(sheetsInfo[0].name);
      }
      
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      onError(error instanceof Error ? error.message : 'Erro ao carregar arquivo');
    } finally {
      setIsUploading(false);
    }
  }, [onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Upload da Planilha Amazon Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste sua planilha Amazon Ads aqui'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  Formatos aceitos: .xlsx, .xls (máximo 20MB)
                </p>
              </div>
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Arquivo carregado: {uploadedFile.name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Selection */}
      {availableSheets.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sheets className="w-5 h-5" />
              Selecionar Aba da Planilha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedSheet} onValueChange={setSelectedSheet}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a aba com dados de campanhas/keywords" />
              </SelectTrigger>
              <SelectContent>
                {availableSheets.map((sheet) => (
                  <SelectItem key={sheet.name} value={sheet.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{sheet.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={sheet.hasKeywords ? "default" : "secondary"} className="text-xs">
                          {sheet.rows} linhas
                        </Badge>
                        {sheet.hasKeywords && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            ✓ Keywords
                          </Badge>
                        )}
                        {sheet.hasPerformanceData && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Performance
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-1 gap-3">
              {availableSheets.map((sheet) => (
                <div key={sheet.name} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{sheet.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Score: {sheet.score}
                      </Badge>
                    </div>
                    <Badge variant="secondary">{sheet.rows} linhas</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {sheet.hasKeywords && (
                      <Badge variant="default" className="text-xs">Keywords ✓</Badge>
                    )}
                    {sheet.hasPerformanceData && (
                      <Badge variant="outline" className="text-xs">Performance ✓</Badge>
                    )}
                    {!sheet.hasKeywords && !sheet.hasPerformanceData && (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">Dados não detectados</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Button */}
      {selectedSheet && (
        <div className="flex justify-center">
          <Button 
            onClick={processSelectedSheet}
            disabled={isUploading}
            size="lg"
            className="px-8"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Processar Aba Selecionada
              </>
            )}
          </Button>
        </div>
      )}

      {/* Tips */}
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