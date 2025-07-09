/**
 * Excel Import/Export Manager Component
 * Complete interface for XLSX import/export operations
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ExcelImportExportManagerProps {
  type: 'products' | 'channels';
}

export default function ExcelImportExportManager({ type }: ExcelImportExportManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const { toast } = useToast();

  const handleExportTemplate = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/excel/export-template/${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao baixar template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `template-${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template baixado com sucesso",
        description: `Template para ${type === 'products' ? 'produtos' : 'canais'} foi baixado.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível baixar o template. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [type, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/excel/import/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao importar arquivo');
      }

      const results = await response.json();
      setUploadResults(results);

      toast({
        title: "Importação concluída",
        description: `${results.processed} registros processados com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar o arquivo. Verifique o formato e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [type, toast]);

  const typeLabel = type === 'products' ? 'Produtos' : 'Canais de Venda';

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Template de {typeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Baixe o template Excel para {type === 'products' ? 'seus produtos' : 'configurações de canais de venda'}.
            Preencha os dados e importe de volta para atualizar o sistema.
          </p>
          <Button 
            onClick={handleExportTemplate}
            disabled={isDownloading}
            className="w-full"
          >
            {isDownloading ? (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin" />
                Gerando template...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template de {typeLabel}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar {typeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione o arquivo Excel preenchido para importar {type === 'products' ? 'os dados dos produtos' : 'as configurações dos canais'}.
            O sistema detectará automaticamente atualizações e novos registros.
          </p>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <label
              htmlFor={`file-upload-${type}`}
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <span className="text-sm font-medium">
                {isUploading ? 'Importando...' : 'Clique para selecionar arquivo Excel'}
              </span>
              <span className="text-xs text-muted-foreground">
                Apenas arquivos .xlsx ou .xls
              </span>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processando arquivo...
              </p>
            </div>
          )}

          {uploadResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importação concluída:</strong>
                <br />
                • {uploadResults.processed} registros processados
                {uploadResults.updated && <><br />• {uploadResults.updated} registros atualizados</>}
                {uploadResults.created && <><br />• {uploadResults.created} novos registros criados</>}
                {uploadResults.errors && uploadResults.errors > 0 && (
                  <><br />• {uploadResults.errors} erros encontrados</>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Baixe o template Excel clicando no botão "Baixar Template"</li>
            <li>Abra o arquivo no Excel ou Google Sheets</li>
            <li>Preencha os dados conforme as colunas do template</li>
            <li>Salve o arquivo no formato Excel (.xlsx)</li>
            <li>Use a área de upload para importar o arquivo preenchido</li>
            <li>Verifique os resultados da importação na mensagem de confirmação</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}