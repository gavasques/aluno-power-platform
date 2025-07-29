/**
 * HOOK: useProductImages
 * Gerencia imagens do produto no formulário
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UseProductImagesReturn, IMAGE_CONSTRAINTS } from '../types';

export const useProductImages = (): UseProductImagesReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();

  // ===== STATE =====
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // ===== HELPER FUNCTIONS =====
  const validateImageFile = useCallback((file: File): string | null => {
    // Check file type
    if (!IMAGE_CONSTRAINTS.ACCEPTED_FORMATS.includes(file.type)) {
      return `Formato não suportado. Use: ${IMAGE_CONSTRAINTS.ACCEPTED_FORMATS.join(', ')}`;
    }

    // Check file size
    if (file.size > IMAGE_CONSTRAINTS.MAX_SIZE) {
      const maxSizeMB = IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024);
      return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  const createImagePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Erro ao ler arquivo'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }, []);

  const validateImageDimensions = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const { width, height } = img;
        const minDims = IMAGE_CONSTRAINTS.MIN_DIMENSIONS;
        const maxDims = IMAGE_CONSTRAINTS.MAX_DIMENSIONS;
        
        const isValid = width >= minDims.width && 
                       height >= minDims.height && 
                       width <= maxDims.width && 
                       height <= maxDims.height;
        
        URL.revokeObjectURL(url);
        resolve(isValid);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    });
  }, []);

  // ===== IMAGE ACTIONS =====
  const addImages = useCallback(async (files: File[]) => {
    const validationErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Check total count
    if (images.length + files.length > IMAGE_CONSTRAINTS.MAX_FILES) {
      toast({
        title: "Muitas imagens",
        description: `Máximo de ${IMAGE_CONSTRAINTS.MAX_FILES} imagens permitidas`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        // Validate file
        const fileError = validateImageFile(file);
        if (fileError) {
          validationErrors.push(`${file.name}: ${fileError}`);
          continue;
        }

        // Validate dimensions
        const dimensionsValid = await validateImageDimensions(file);
        if (!dimensionsValid) {
          const minDims = IMAGE_CONSTRAINTS.MIN_DIMENSIONS;
          const maxDims = IMAGE_CONSTRAINTS.MAX_DIMENSIONS;
          validationErrors.push(
            `${file.name}: Dimensões inválidas (${minDims.width}x${minDims.height} - ${maxDims.width}x${maxDims.height})`
          );
          continue;
        }

        // Create preview
        try {
          const preview = await createImagePreview(file);
          validFiles.push(file);
          newPreviews.push(preview);
        } catch (error) {
          validationErrors.push(`${file.name}: Erro ao processar imagem`);
        }
      }

      // Update state
      if (validFiles.length > 0) {
        setImages(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
        
        toast({
          title: "Imagens adicionadas",
          description: `${validFiles.length} imagem(ns) adicionada(s) com sucesso`
        });
      }

      // Show validation errors
      if (validationErrors.length > 0) {
        toast({
          title: "Algumas imagens não foram adicionadas",
          description: validationErrors.slice(0, 3).join('\n'),
          variant: "destructive"
        });
      }

    } finally {
      setIsUploading(false);
    }
  }, [images.length, validateImageFile, validateImageDimensions, createImagePreview, toast]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke URL to prevent memory leaks
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });

    toast({
      title: "Imagem removida",
      description: "Imagem removida com sucesso"
    });
  }, [toast]);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    setImages(prev => reorder(prev, startIndex, endIndex));
    setPreviews(prev => reorder(prev, startIndex, endIndex));
  }, []);

  const setMainImage = useCallback((index: number) => {
    if (index === 0) return; // Already main image

    // Move selected image to first position
    setImages(prev => {
      const newImages = [...prev];
      const [selectedImage] = newImages.splice(index, 1);
      return [selectedImage, ...newImages];
    });

    setPreviews(prev => {
      const newPreviews = [...prev];
      const [selectedPreview] = newPreviews.splice(index, 1);
      return [selectedPreview, ...newPreviews];
    });

    toast({
      title: "Imagem principal alterada",
      description: "Imagem definida como principal"
    });
  }, [toast]);

  const compressImages = useCallback(async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    
    try {
      const compressedImages: File[] = [];
      const compressedPreviews: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        
        // Simple compression simulation (in real app, use a compression library)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve) => {
          img.onload = () => {
            const maxWidth = 1920;
            const maxHeight = 1080;
            
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: file.type });
                compressedImages.push(compressedFile);
                compressedPreviews.push(canvas.toDataURL());
              }
              resolve(void 0);
            }, file.type, 0.8);
          };
          
          img.src = previews[i];
        });
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      setImages(compressedImages);
      setPreviews(compressedPreviews);
      
      toast({
        title: "Imagens comprimidas",
        description: "Todas as imagens foram otimizadas"
      });

    } catch (error) {
      toast({
        title: "Erro na compressão",
        description: "Não foi possível comprimir as imagens",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [images, previews, toast]);

  const generateThumbnails = useCallback(async () => {
    // Thumbnails are generated automatically with previews
    // This is a placeholder for future thumbnail generation logic
    return Promise.resolve();
  }, []);

  const validateImages = useCallback((): string[] => {
    const errors: string[] = [];

    if (images.length === 0) {
      errors.push('Pelo menos uma imagem é obrigatória');
    }

    if (images.length > IMAGE_CONSTRAINTS.MAX_FILES) {
      errors.push(`Máximo de ${IMAGE_CONSTRAINTS.MAX_FILES} imagens permitidas`);
    }

    images.forEach((image, index) => {
      const error = validateImageFile(image);
      if (error) {
        errors.push(`Imagem ${index + 1}: ${error}`);
      }
    });

    return errors;
  }, [images, validateImageFile]);

  return {
    images,
    previews,
    isUploading,
    uploadProgress,
    addImages,
    removeImage,
    reorderImages,
    setMainImage,
    compressImages,
    generateThumbnails,
    validateImages
  };
};