/**
 * Image upload card component
 */

import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import ImageUploadComponent from '@/components/background-removal/ImageUploadComponent';
import { UPSCALE_CONFIG } from '../constants';

interface ImageUploadCardProps {
  onImageSelect: (imageData: string, fileName: string) => void;
  onImageRemove: () => void;
  selectedImage: string;
  fileName: string;
  disabled: boolean;
}

export const ImageUploadCard = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  fileName,
  disabled
}: ImageUploadCardProps) => {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload da Imagem
        </CardTitle>
        <CardDescription>
          Faça upload da imagem que deseja melhorar (PNG, JPG, WEBP até 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ImageUploadComponent
          onImageSelect={onImageSelect}
          onImageRemove={onImageRemove}
          selectedImage={selectedImage}
          fileName={fileName}
          maxFileSize={UPSCALE_CONFIG.maxFileSize}
          supportedFormats={UPSCALE_CONFIG.supportedFormats}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};