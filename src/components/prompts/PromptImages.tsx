
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImagePreview } from '@/components/ui/image-preview';
import { Images as ImageIcon } from 'lucide-react';
import { PromptImage } from '@/types/prompt';

interface PromptImagesProps {
  images: PromptImage[];
}

export const PromptImages = ({ images }: PromptImagesProps) => {
  if (!images || images.length === 0) return null;

  const beforeImages = images.filter(img => img.type === 'before');
  const afterImages = images.filter(img => img.type === 'after');
  const generalImages = images.filter(img => img.type === 'general');

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'before': return 'Antes';
      case 'after': return 'Depois';
      case 'general': return 'Geral';
      default: return 'Geral';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-red-100 text-red-800 border-red-200';
      case 'after': return 'bg-green-100 text-green-800 border-green-200';
      case 'general': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderImageSection = (sectionImages: PromptImage[], title: string) => {
    if (sectionImages.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionImages.map((image) => (
            <div key={image.id} className="space-y-2">
              <div className="relative">
                <ImagePreview
                  src={image.url}
                  alt={image.alt}
                  className="rounded-lg border overflow-hidden h-48"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={getTypeBadgeColor(image.type)}>
                    {getTypeLabel(image.type)}
                  </Badge>
                </div>
              </div>
              {image.alt && (
                <p className="text-sm text-muted-foreground text-center px-2">
                  {image.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" />
          Exemplos Visuais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {beforeImages.length > 0 && afterImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Comparação Antes e Depois</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderImageSection(beforeImages, "Antes")}
              </div>
              <div>
                {renderImageSection(afterImages, "Depois")}
              </div>
            </div>
          </div>
        )}
        
        {beforeImages.length > 0 && afterImages.length === 0 && renderImageSection(beforeImages, "Imagens Antes")}
        {afterImages.length > 0 && beforeImages.length === 0 && renderImageSection(afterImages, "Imagens Depois")}
        {generalImages.length > 0 && renderImageSection(generalImages, "Imagens Gerais")}
      </CardContent>
    </Card>
  );
};
