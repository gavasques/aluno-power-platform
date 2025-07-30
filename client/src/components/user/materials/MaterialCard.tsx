import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, FileText, Video, Code, ExternalLink } from 'lucide-react';
import type { MaterialCardProps } from './MaterialTypes';

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  materialType,
  onView,
  onDownload,
}) => {
  const getTypeIcon = () => {
    const icons = {
      pdf: FileText,
      video: Video,
      embed: Code,
      download: Download,
    };
    const IconComponent = icons[materialType.contentType as keyof typeof icons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    const { formatFileSize: unifiedFormatFileSize } = require('@/lib/utils/unifiedFormatters');
    return unifiedFormatFileSize(bytes);
  };

  const getThumbnail = () => {
    if (material.videoThumbnail) {
      return (
        <img 
          src={material.videoThumbnail} 
          alt={material.title}
          className="w-full h-32 object-cover rounded-t-lg"
        />
      );
    }
    return (
      <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
        {getTypeIcon()}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {getThumbnail()}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {materialType.name}
              </Badge>
              <Badge 
                variant={material.accessLevel === 'public' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {material.accessLevel === 'public' ? 'Público' : 'Restrito'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-3 mb-4">
          {material.description}
        </CardDescription>
        
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {material.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{material.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{material.downloadCount} downloads</span>
          {material.fileSize && (
            <span>{formatFileSize(material.fileSize)}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onView(material)} 
            className="flex-1"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          
          {(material.fileUrl || material.externalUrl) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (material.fileUrl) {
                  window.open(material.fileUrl, '_blank');
                } else if (material.externalUrl) {
                  window.open(material.externalUrl, '_blank');
                }
                if (onDownload) onDownload(material);
              }}
            >
              {material.fileUrl ? (
                <Download className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};