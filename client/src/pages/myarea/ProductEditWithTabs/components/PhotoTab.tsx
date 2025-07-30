import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import type { Product } from '../types';

interface PhotoTabProps {
  product?: Product;
  photoPreview: string | null;
  uploadingPhoto: boolean;
  onPhotoUpload: (file: File) => void;
  onRemovePhoto: () => void;
}

export const PhotoTab = memo<PhotoTabProps>(({
  product,
  photoPreview,
  uploadingPhoto,
  onPhotoUpload,
  onRemovePhoto
}) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }
      
      onPhotoUpload(file);
    }
  }, [onPhotoUpload]);

  const currentPhoto = photoPreview || product?.photo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Foto do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Photo Display */}
        {currentPhoto ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-md mx-auto">
              <img
                src={currentPhoto}
                alt="Foto do produto"
                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
              />
              {photoPreview && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={onRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {!photoPreview && (
              <p className="text-center text-sm text-muted-foreground">
                Foto atual do produto
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma foto</h3>
            <p className="text-muted-foreground mb-4">
              Adicione uma foto para melhor identificação do produto
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <h4 className="font-medium mb-2">
              {currentPhoto ? 'Atualizar Foto' : 'Fazer Upload da Foto'}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
            </p>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingPhoto}
              />
              <Button disabled={uploadingPhoto} className="relative">
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fazendo Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Dicas para uma boa foto:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use boa iluminação natural</li>
            <li>• Fundo neutro ou branco</li>
            <li>• Produto centralizado na imagem</li>
            <li>• Resolução mínima de 800x600 pixels</li>
            <li>• Evite sombras e reflexos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});