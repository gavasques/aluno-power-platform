import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, ExternalLink } from 'lucide-react';
import type { PartnerFile } from '@shared/schema';

interface PartnerFilesProps {
  partnerId: number;
}

const fileTypeLabels = {
  presentation: 'Apresentação',
  catalog: 'Catálogo',
  pricing: 'Tabela de Preços',
  services: 'Serviços Ofertados',
  other: 'Outros'
};

export const PartnerFiles: React.FC<PartnerFilesProps> = ({ partnerId }) => {
  const { data: files = [], isLoading } = useQuery<PartnerFile[]>({
    queryKey: ['/api/partners', partnerId, 'files'],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${partnerId}/files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      return response.json();
    },
    enabled: !!partnerId
  });

  const handleDownload = (file: PartnerFile) => {
    window.open(file.fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando arquivos...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum arquivo disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{file.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {fileTypeLabels[file.fileType as keyof typeof fileTypeLabels] || file.fileType}
                    </span>
                    {file.fileSize && (
                      <span>{file.fileSize}</span>
                    )}
                  </div>
                  {file.description && (
                    <p className="text-gray-600 text-sm mt-1">{file.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};