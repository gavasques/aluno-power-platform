
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { PromptFile } from '@/types/prompt';

interface PromptFilesProps {
  files: PromptFile[];
}

export const PromptFiles = ({ files }: PromptFilesProps) => {
  if (!files || files.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    const { formatFileSize: unifiedFormatFileSize } = require('@/lib/utils/unifiedFormatters');
    return unifiedFormatFileSize(bytes);
  };

  const downloadFile = (file: PromptFile) => {
    // Em produção, isso seria um link real para download
    window.open(file.url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Arquivos de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Arquivos que podem ser úteis para usar junto com este prompt:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(file)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
