/**
 * Componente de dialog para export/import de dados
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { ExportFormat, ImportOptions, ImportResult } from '@/hooks/useExportImport';

interface ExportImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: {
    format: ExportFormat;
    filename?: string;
    fields?: string[];
    includeHeaders?: boolean;
  }) => void;
  onImport: (file: File, options: ImportOptions) => void;
  onDownloadTemplate: (format: 'csv' | 'xlsx') => void;
  onPreviewImport?: (file: File) => Promise<any[]>;
  isExporting?: boolean;
  isImporting?: boolean;
  importResult?: ImportResult | null;
  exportFields?: Array<{
    key: string;
    label: string;
    type?: 'string' | 'number' | 'date' | 'boolean';
  }>;
  importFields?: Array<{
    key: string;
    label: string;
    required?: boolean;
    type?: 'string' | 'number' | 'date' | 'boolean';
  }>;
  selectedCount?: number;
  totalCount?: number;
}

export function ExportImportDialog({
  isOpen,
  onOpenChange,
  onExport,
  onImport,
  onDownloadTemplate,
  onPreviewImport,
  isExporting = false,
  isImporting = false,
  importResult,
  exportFields = [],
  importFields = [],
  selectedCount = 0,
  totalCount = 0
}: ExportImportDialogProps) {
  // Estados do export
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');
  const [exportFilename, setExportFilename] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportFields.map(f => f.key)
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);

  // Estados do import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'csv' | 'xlsx' | 'json'>('xlsx');
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [validateData, setValidateData] = useState(true);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle field selection
  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(k => k !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  // Handle export
  const handleExport = () => {
    onExport({
      format: exportFormat,
      filename: exportFilename || undefined,
      fields: selectedFields,
      includeHeaders
    });
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      
      // Auto-detect format
      if (file.name.endsWith('.csv')) {
        setImportFormat('csv');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setImportFormat('xlsx');
      } else if (file.name.endsWith('.json')) {
        setImportFormat('json');
      }

      // Preview se disponível
      if (onPreviewImport) {
        try {
          const preview = await onPreviewImport(file);
          setPreviewData(preview);
        } catch (error) {
          console.error('Erro no preview:', error);
        }
      }
    }
  };

  // Handle import
  const handleImport = () => {
    if (!importFile) return;

    const options: ImportOptions = {
      format: importFormat,
      skipFirstRow,
      validateData
    };

    onImport(importFile, options);
  };

  // Reset import
  const resetImport = () => {
    setImportFile(null);
    setPreviewData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Exportar / Importar Dados</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
          </TabsList>

          {/* Tab de Export */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações de Export */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Formato</Label>
                  <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="export-filename">Nome do Arquivo (opcional)</Label>
                  <Input
                    id="export-filename"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder="dados-exportados"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-headers"
                    checked={includeHeaders}
                    onCheckedChange={setIncludeHeaders}
                  />
                  <Label htmlFor="include-headers">Incluir cabeçalhos</Label>
                </div>

                {/* Info sobre dados */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dados a exportar:</h4>
                  <div className="text-sm text-gray-600">
                    {selectedCount > 0 ? (
                      <p>{selectedCount} registros selecionados</p>
                    ) : (
                      <p>Todos os {totalCount} registros</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seleção de Campos */}
              <div className="space-y-4">
                <div>
                  <Label>Campos a exportar</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {exportFields.map(field => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`export-field-${field.key}`}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => toggleField(field.key)}
                        />
                        <Label 
                          htmlFor={`export-field-${field.key}`}
                          className="flex-1 cursor-pointer"
                        >
                          {field.label}
                          {field.type && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {field.type}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields(exportFields.map(f => f.key))}
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields([])}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting || selectedFields.length === 0}
              >
                {isExporting ? 'Exportando...' : 'Exportar Dados'}
              </Button>
            </div>
          </TabsContent>

          {/* Tab de Import */}
          <TabsContent value="import" className="space-y-6">
            {!importResult ? (
              <>
                {/* Upload de Arquivo */}
                <div className="space-y-4">
                  <div>
                    <Label>Arquivo para importar</Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Selecionar Arquivo
                        </Button>
                        {importFile && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{importFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={resetImport}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Templates */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Precisa de um template?</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Baixe um template com a estrutura correta para importação:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadTemplate('xlsx')}
                      >
                        Template Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadTemplate('csv')}
                      >
                        Template CSV
                      </Button>
                    </div>
                  </div>

                  {/* Opções de Import */}
                  {importFile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Formato detectado</Label>
                          <Select 
                            value={importFormat} 
                            onValueChange={(value: 'csv' | 'xlsx' | 'json') => setImportFormat(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xlsx">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="skip-first-row"
                            checked={skipFirstRow}
                            onCheckedChange={setSkipFirstRow}
                          />
                          <Label htmlFor="skip-first-row">Pular primeira linha (cabeçalhos)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="validate-data"
                            checked={validateData}
                            onCheckedChange={setValidateData}
                          />
                          <Label htmlFor="validate-data">Validar dados antes de importar</Label>
                        </div>
                      </div>

                      {/* Preview */}
                      {previewData.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Preview dos dados</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPreview(!showPreview)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {showPreview ? 'Ocultar' : 'Ver Preview'}
                            </Button>
                          </div>

                          {showPreview && (
                            <div className="border rounded-lg p-3 max-h-48 overflow-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    {Object.keys(previewData[0] || {}).map(key => (
                                      <th key={key} className="text-left p-1 border-b">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewData.map((row, index) => (
                                    <tr key={index}>
                                      {Object.values(row).map((value, cellIndex) => (
                                        <td key={cellIndex} className="p-1 border-b">
                                          {String(value)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? 'Importando...' : 'Importar Dados'}
                  </Button>
                </div>
              </>
            ) : (
              /* Resultado da Importação */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {importResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {importResult.success ? 'Importação Concluída' : 'Importação com Erros'}
                    </h3>
                    <p className="text-gray-600">
                      {importResult.imported} registros importados com sucesso
                    </p>
                  </div>
                </div>

                {/* Erros */}
                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">
                      Erros ({importResult.errors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          Linha {error.row}, Campo {error.field}: {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Avisos ({importResult.warnings.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-700">
                          Linha {warning.row}, Campo {warning.field}: {warning.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetImport();
                      // clearImportResult se disponível
                    }}
                  >
                    Nova Importação
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}