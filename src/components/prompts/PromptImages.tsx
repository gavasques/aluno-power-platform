
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePreview } from '@/components/ui/image-preview';
import { Images as ImageIcon } from 'lucide-react';
import { PromptImage } from '@/types/prompt';

interface PromptImagesProps {
  images: PromptImage[];
}

export const PromptImages = ({ images }: PromptImagesProps) => {
  if (!images || images.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" />
          Exemplos Visuais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="space-y-2">
              <ImagePreview
                src={image.url}
                alt={image.alt}
                className="rounded-lg border overflow-hidden h-48"
              />
              {image.alt && (
                <p className="text-sm text-muted-foreground text-center px-2">
                  {image.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
