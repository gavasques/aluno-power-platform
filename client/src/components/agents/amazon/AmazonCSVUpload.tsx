import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CSVUploadResult, AmazonReview } from '@/types/amazon';

interface AmazonCSVUploadProps {
  onUploadComplete: (result: CSVUploadResult) => void;
  onClear?: () => void;
  uploadResult?: CSVUploadResult | null;
}

export const AmazonCSVUpload = ({ onUploadComplete, onClear, uploadResult }: AmazonCSVUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateCSVHeaders = (headers: string[]): boolean => {
    const requiredHeaders = ['asin', 'product_title', 'review_text', 'rating'];
    return requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );
  };

  const parseCSVRow = (row: string[], headers: string[]): AmazonReview | null => {
    try {
      const getValueByHeader = (headerName: string) => {
        const index = headers.findIndex(h => h.toLowerCase().includes(headerName.toLowerCase()));
        return index >= 0 ? row[index]?.trim() : '';
      };

      const asin = getValueByHeader('asin');
      const productTitle = getValueByHeader('product_title') || getValueByHeader('title');
      const reviewText = getValueByHeader('review_text') || getValueByHeader('review') || getValueByHeader('text');
      const rating = parseFloat(getValueByHeader('rating')) || 0;

      if (!asin || !reviewText || rating === 0) {
        return null;
      }

      return {
        id: `${asin}_${Date.now()}_${Math.random()}`,
        asin,
        productTitle,
        reviewText,
        rating,
        reviewDate: getValueByHeader('review_date') || getValueByHeader('date') || new Date().toISOString(),
        verified: getValueByHeader('verified')?.toLowerCase() === 'true',
        helpful: parseInt(getValueByHeader('helpful')) || 0,
        vine: getValueByHeader('vine')?.toLowerCase() === 'true'
      };
    } catch (error) {
      return null;
    }
  };

  const processCSVFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      if (!validateCSVHeaders(headers)) {
        throw new Error('CSV deve conter as colunas: ASIN, Product Title, Review Text, Rating');
      }

      const reviews: AmazonReview[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        const review = parseCSVRow(row, headers);
        
        if (review) {
          reviews.push(review);
        } else {
          errors.push(`Linha ${i + 1}: Dados inválidos ou incompletos`);
        }
      }

      const result: CSVUploadResult = {
        fileName: file.name,
        totalRows: lines.length - 1,
        validRows: reviews.length,
        errors: errors.slice(0, 10),
        reviews
      };

      onUploadComplete(result);

      toast({
        title: "Upload concluído!",
        description: `${reviews.length} avaliações processadas com sucesso.`,
      });

    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      processCSVFile(csvFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
    }
  }, [processCSVFile, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  }, [processCSVFile]);

  if (uploadResult) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Arquivo Processado
            </CardTitle>
            {onClear && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{uploadResult.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadResult.validRows} de {uploadResult.totalRows} linhas processadas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{uploadResult.validRows}</p>
                <p className="text-sm text-muted-foreground">Avaliações válidas</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{uploadResult.errors.length}</p>
                <p className="text-sm text-muted-foreground">Linhas com erro</p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Primeiros erros encontrados:
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  {uploadResult.errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-xs text-orange-800">
                      {error}
                    </p>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <p className="text-xs text-orange-600 mt-1">
                      +{uploadResult.errors.length - 5} erros adicionais
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Upload de Avaliações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Faça upload de um arquivo CSV com avaliações da Amazon para análise e geração de conteúdo otimizado.
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-lg font-medium mb-2">
              {isDragOver ? 'Solte o arquivo aqui' : 'Arraste um arquivo CSV ou clique para selecionar'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Formato suportado: CSV (máximo 50MB)
            </p>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
              id="csv-upload"
            />
            
            <Button 
              asChild 
              disabled={isProcessing}
              variant={isDragOver ? "default" : "outline"}
            >
              <label htmlFor="csv-upload" className="cursor-pointer">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </label>
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Formato esperado do CSV:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <strong>ASIN:</strong> Código do produto na Amazon</p>
              <p>• <strong>Product Title:</strong> Título do produto</p>
              <p>• <strong>Review Text:</strong> Texto da avaliação</p>
              <p>• <strong>Rating:</strong> Nota da avaliação (1-5)</p>
              <p className="text-blue-600 mt-2">Colunas opcionais: Review Date, Verified, Helpful, Vine</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};