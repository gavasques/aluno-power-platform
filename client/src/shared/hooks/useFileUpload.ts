/**
 * Hook personalizado para upload de arquivos
 * Elimina duplicação de lógica de upload em vários componentes
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  maxSize?: number; // em bytes
  acceptedTypes?: string[];
  maxFiles?: number;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxSize = 25 * 1024 * 1024, // 25MB default
    acceptedTypes = ['image/*'],
    maxFiles = 1
  } = options;

  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Check file type
    const isTypeValid = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isTypeValid) {
      return `Tipo de arquivo não suportado. Aceitos: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxSize, acceptedTypes]);

  const addFile = useCallback((file: File) => {
    // Check max files limit
    if (files.length >= maxFiles) {
      toast({
        title: "Limite de arquivos",
        description: `Máximo ${maxFiles} arquivo(s) permitido(s)`,
        variant: "destructive"
      });
      return false;
    }

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Arquivo inválido",
        description: error,
        variant: "destructive"
      });
      return false;
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFile: UploadedFile = {
      file,
      id: fileId,
      status: 'uploading',
      progress: 0
    };

    // Add preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, preview: e.target?.result as string } : f
        ));
      };
      reader.readAsDataURL(file);
    }

    setFiles(prev => [...prev, newFile]);
    
    // Simulate upload progress (replace with actual upload logic)
    simulateUpload(fileId);
    
    return true;
  }, [files.length, maxFiles, validateFile, toast]);

  const simulateUpload = useCallback((fileId: string) => {
    setIsUploading(true);
    
    const updateProgress = (progress: number) => {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ));
    };

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
        setIsUploading(false);
      } else {
        updateProgress(progress);
      }
    }, 200);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      addFile(file);
    });

    // Clear input value to allow selecting the same file again
    event.target.value = '';
  }, [addFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    
    droppedFiles.forEach(file => {
      addFile(file);
    });
  }, [addFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return {
    files,
    isUploading,
    addFile,
    removeFile,
    clearAll,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    
    // Computed properties
    hasFiles: files.length > 0,
    canAddMore: files.length < maxFiles,
    completedFiles: files.filter(f => f.status === 'completed'),
    failedFiles: files.filter(f => f.status === 'error'),
  };
};