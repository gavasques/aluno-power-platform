import React, { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, X, File } from 'lucide-react';
import { ReviewsData } from '@/pages/agents/amazon-listings-optimizer';

interface ReviewsInputProps {
  data: ReviewsData;
  onChange: (data: ReviewsData) => void;
}

interface FileInfo {
  file: File;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const ReviewsInput: React.FC<ReviewsInputProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);

  const handleTabChange = (value: string) => {
    const newData = { ...data, type: value as 'csv' | 'text' };
    
    // Reset review count when switching tabs
    if (value === 'csv') {
      newData.reviewCount = fileInfos.reduce((sum, info) => sum + (info.status === 'success' ? 1 : 0), 0);
    } else {
      newData.reviewCount = countReviewsInText(data.textContent);
    }
    
    onChange(newData);
  };

  const countReviewsInText = (text: string) => {
    return text.split('\n').filter(line => line.trim().length > 0).length;
  };

  const handleTextChange = (text: string) => {
    const reviewCount = countReviewsInText(text);
    onChange({
      ...data,
      textContent: text,
      reviewCount
    });
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Apenas arquivos CSV são aceitos';
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return 'Arquivo muito grande (máx. 5MB)';
    }
    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newFileInfos: FileInfo[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newFileInfos.push({ file, status: 'error', error });
      } else {
        validFiles.push(file);
        newFileInfos.push({ file, status: 'uploading' });
      }
    });

    // Check total file count
    const totalFiles = data.csvFiles.length + validFiles.length;
    if (totalFiles > 10) {
      alert('Máximo de 10 arquivos permitidos');
      return;
    }

    setFileInfos(prev => [...prev, ...newFileInfos]);

    // Simulate file processing
    validFiles.forEach((file, index) => {
      setTimeout(() => {
        setFileInfos(prev => 
          prev.map(info => 
            info.file === file ? { ...info, status: 'success' } : info
          )
        );
        
        // Update data with successful files
        const successfulFiles = [...data.csvFiles, file];
        onChange({
          ...data,
          csvFiles: successfulFiles,
          reviewCount: successfulFiles.length * 10 // Simulate reviews per file
        });
      }, (index + 1) * 1000);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = data.csvFiles.filter(file => file !== fileToRemove);
    setFileInfos(prev => prev.filter(info => info.file !== fileToRemove));
    
    onChange({
      ...data,
      csvFiles: updatedFiles,
      reviewCount: updatedFiles.length * 10
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Tabs value={data.type} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="csv" className="flex items-center gap-2">
          <File className="h-4 w-4" />
          📁 Arquivos CSV
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          📝 Texto Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="csv" className="space-y-4">
        {/* Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arraste e solte até 10 arquivos CSV do Helium10
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou clique para selecionar arquivos
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar Arquivos CSV
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Máximo 5MB por arquivo | Apenas .csv
            </p>
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File List */}
        {fileInfos.length > 0 && (
          <div className="space-y-2">
            {fileInfos.map((fileInfo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{fileInfo.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileInfo.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {fileInfo.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {fileInfo.status === 'success' && (
                    <div className="text-green-600 text-sm">✓ Sucesso</div>
                  )}
                  {fileInfo.status === 'error' && (
                    <div className="text-red-600 text-sm">{fileInfo.error}</div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileInfo.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File Counter */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Formatos aceitos: CSV do Helium10</span>
          <span className={data.csvFiles.length > 10 ? 'text-red-600' : ''}>
            {data.csvFiles.length}/10 arquivos
          </span>
        </div>
      </TabsContent>

      <TabsContent value="text" className="space-y-4">
        <Textarea
          value={data.textContent}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Cole as avaliações aqui, uma por linha...

Exemplo:
Produto excelente, muito bem feito
Gostei bastante, mas poderia ser maior
Qualidade boa, recomendo
..."
          rows={12}
          maxLength={10000}
          className="resize-none"
        />
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{countReviewsInText(data.textContent)} avaliações detectadas</span>
          <span>{data.textContent.length}/10000</span>
        </div>
        
        {data.textContent.length > 0 && countReviewsInText(data.textContent) < 5 && (
          <p className="text-sm text-red-600">
            Insira pelo menos 5 avaliações (uma por linha)
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
};