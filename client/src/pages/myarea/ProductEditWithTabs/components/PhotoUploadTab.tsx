import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface PhotoUploadTabProps {
  photoPreview: string | null;
  onPhotoChange: (file: File | null) => void;
}

export const PhotoUploadTab = memo<PhotoUploadTabProps>(({ photoPreview, onPhotoChange }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onPhotoChange(file);
  }, [onPhotoChange]);

  const handleRemovePhoto = useCallback(() => {
    onPhotoChange(null);
  }, [onPhotoChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Selecionar Foto</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {photoPreview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!photoPreview && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Nenhuma foto selecionada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});