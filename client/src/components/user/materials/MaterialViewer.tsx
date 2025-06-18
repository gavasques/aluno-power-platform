import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Eye } from 'lucide-react';
import type { MaterialViewerProps } from './MaterialTypes';

export const MaterialViewer: React.FC<MaterialViewerProps & { isOpen: boolean; onClose: () => void }> = ({
  material,
  materialType,
  isOpen,
  onClose,
}) => {
  const handleDownload = () => {
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    }
  };

  const handleExternalLink = () => {
    if (material.externalUrl) {
      window.open(material.externalUrl, '_blank');
    }
  };

  const renderContent = () => {
    switch (materialType.contentType) {
      case 'pdf':
        if (material.fileUrl) {
          return (
            <div className="w-full h-96">
              <iframe
                src={`${material.fileUrl}#toolbar=0`}
                className="w-full h-full border rounded"
                title={material.title}
              />
            </div>
          );
        }
        break;

      case 'video':
        if (material.videoUrl) {
          return (
            <div className="w-full">
              <video 
                controls 
                className="w-full max-h-96 rounded"
                poster={material.videoThumbnail || undefined}
              >
                <source src={material.videoUrl} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
              {material.videoDuration && (
                <p className="text-sm text-gray-600 mt-2">
                  Duração: {Math.floor(material.videoDuration / 60)}:{(material.videoDuration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          );
        }
        break;

      case 'embed':
        if (material.embedCode) {
          return (
            <div 
              className="w-full"
              dangerouslySetInnerHTML={{ __html: material.embedCode }}
            />
          );
        } else if (material.embedUrl) {
          return (
            <div className="w-full h-96">
              <iframe
                src={material.embedUrl}
                className="w-full h-full border rounded"
                title={material.title}
                allowFullScreen
              />
            </div>
          );
        }
        break;

      case 'download':
        return (
          <div className="text-center py-8">
            <div className="mb-4">
              <Download className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              Este material está disponível para download
            </p>
            <Button onClick={handleDownload} className="mb-2">
              <Download className="h-4 w-4 mr-2" />
              Baixar Arquivo
            </Button>
            {material.fileSize && (
              <p className="text-sm text-gray-500">
                Tamanho: {(material.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Formato de conteúdo não suportado
          </div>
        );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        Conteúdo não disponível
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{materialType.name}</Badge>
            <Badge variant={material.accessLevel === 'public' ? 'default' : 'destructive'}>
              {material.accessLevel === 'public' ? 'Público' : 'Restrito'}
            </Badge>
          </div>

          {material.description && (
            <p className="text-gray-600">{material.description}</p>
          )}

          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {material.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="border rounded-lg p-4">
            {renderContent()}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {material.downloadCount} downloads • {material.viewCount} visualizações
            </div>
            <div className="flex gap-2">
              {material.fileUrl && (
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {material.externalUrl && (
                <Button variant="outline" onClick={handleExternalLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Link Externo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};