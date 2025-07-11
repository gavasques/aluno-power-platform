/**
 * Reusable Image Upload Component for Picsart Integration
 * 
 * Features:
 * - Drag & drop upload
 * - Base64 conversion
 * - File validation
 * - Image preview
 * - Support for multiple formats (PNG, JPG, JPEG, WEBP)
 */

import React, { useCallback, useState } from 'react';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploadComponentProps {
  onImageSelect: (imageData: string, fileName: string) => void;
  onImageRemove: () => void;
  selectedImage?: string;
  fileName?: string;
  maxFileSize?: number; // in bytes
  supportedFormats?: string[];
  disabled?: boolean;
  className?: string;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  fileName,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  supportedFormats = ['PNG', 'JPG', 'JPEG', 'WEBP'],
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      return `Formato não suportado. Use: ${supportedFormats.join(', ')}`;
    }

    // Check MIME type
    const validMimeTypes = [
      'image/png',
      'image/jpeg', 
      'image/jpg',
      'image/webp'
    ];
    if (!validMimeTypes.includes(file.type)) {
      return 'Tipo de arquivo inválido. Selecione uma imagem válida.';
    }

    return null;
  }, [maxFileSize, supportedFormats]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Convert to base64
      const base64Data = await fileToBase64(file);
      onImageSelect(base64Data, file.name);
      
      console.log(`📤 [IMAGE_UPLOAD] File selected: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error('❌ [IMAGE_UPLOAD] Error processing file:', error);
      setUploadError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [disabled, validateFile, fileToBase64, onImageSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setUploadError('Nenhuma imagem encontrada nos arquivos soltos.');
    }
  }, [disabled, handleFileSelect]);

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    onImageRemove();
    setUploadError(null);
  }, [onImageRemove]);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      {!selectedImage && (
        <Card 
          className={`
            border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
            ${isProcessing ? 'pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isProcessing ? 'Processando imagem...' : 'Envie sua imagem'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Arraste e solte ou clique para selecionar
            </p>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>Formatos: {supportedFormats.join(', ')}</p>
              <p>Tamanho máximo: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB</p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={disabled || isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {!isProcessing && (
              <Button 
                variant="outline" 
                className="mt-4"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                  input?.click();
                }}
              >
                Selecionar Arquivo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute -top-2 -right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveImage}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Imagem selecionada
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {fileName || 'imagem.png'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Pronta para processamento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUploadComponent;