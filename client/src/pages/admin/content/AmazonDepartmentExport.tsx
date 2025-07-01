import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileSpreadsheet, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  department: string;
  category: string;
  categoryId: string;
}

interface ExportSummary {
  totalDepartments: number;
  totalRecords: number;
  exportedAt: string;
}

export default function AmazonDepartmentExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<ExportData[]>([]);
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('🔍 [FRONTEND] Iniciando exportação...');
      
      // Simular progresso durante a requisição
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 1000);

      const response = await fetch('/api/admin/export-amazon-departments');
      
      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido');
      }

      console.log(`✅ [FRONTEND] Dados recebidos: ${result.data.length} registros`);
      
      setExportData(result.data);
      setSummary(result.summary);
      
      toast({
        title: "Exportação concluída",
        description: `${result.data.length} registros coletados com sucesso`,
      });

    } catch (err) {
      console.error('❌ [FRONTEND] Erro na exportação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      toast({
        title: "Erro na exportação",
        description: "Não foi possível coletar os dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExcel = () => {
    if (exportData.length === 0) return;

    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Preparar dados para Excel com cabeçalhos em português
      const wsData = [
        ['Departamento', 'Categoria', 'Código da Categoria'], // Cabeçalhos
        ...exportData.map(item => [
          item.department,
          item.category,
          item.categoryId
        ])
      ];

      // Criar worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Configurar largura das colunas
      ws['!cols'] = [
        { width: 30 }, // Departamento
        { width: 40 }, // Categoria
        { width: 20 }  // Código da Categoria
      ];

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Departamentos Amazon');

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:\-T]/g, '');
      const filename = `amazon_departamentos_categorias_${timestamp}.xlsx`;

      // Download do arquivo
      XLSX.writeFile(wb, filename);

      console.log(`📊 [EXCEL] Arquivo ${filename} baixado com sucesso`);
      
      toast({
        title: "Download concluído",
        description: `Arquivo ${filename} foi baixado`,
      });

    } catch (err) {
      console.error('❌ [EXCEL] Erro ao gerar Excel:', err);
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o arquivo Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exportação Amazon</h1>
        <p className="text-muted-foreground">
          Exportar departamentos e categorias da Amazon para Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departamentos e Categorias Amazon
          </CardTitle>
          <CardDescription>
            Busca todos os departamentos da Amazon Brasil e suas respectivas categorias,
            gerando um arquivo Excel completo para análise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Botão de Exportação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting ? 'Coletando dados...' : 'Coletar dados da API'}
            </Button>
            
            {exportData.length > 0 && (
              <Button 
                onClick={downloadExcel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Excel
              </Button>
            )}
          </div>

          {/* Barra de Progresso */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Coletando dados...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Resumo dos Dados */}
          {summary && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Coleta concluída:</strong> {summary.totalDepartments} departamentos processados, 
                {summary.totalRecords} registros coletados em {new Date(summary.exportedAt).toLocaleString('pt-BR')}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview dos Dados */}
          {exportData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Preview dos Dados</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-3 border-b font-medium grid grid-cols-3 gap-4">
                  <div>Departamento</div>
                  <div>Categoria</div>
                  <div>Código</div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {exportData.slice(0, 10).map((item, index) => (
                    <div key={index} className="p-3 border-b grid grid-cols-3 gap-4 text-sm">
                      <div className="font-medium">{item.department}</div>
                      <div>{item.category}</div>
                      <div className="font-mono text-muted-foreground">{item.categoryId}</div>
                    </div>
                  ))}
                  {exportData.length > 10 && (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      ... e mais {exportData.length - 10} registros
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações sobre o Processo */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> O sistema faz uma busca automática em todos os departamentos 
              da Amazon Brasil, coletando suas categorias via API. O processo pode levar alguns minutos 
              dependendo da quantidade de departamentos encontrados.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}