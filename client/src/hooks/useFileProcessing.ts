// Custom hook for File Processing - Single Responsibility
import { useState, useCallback } from 'react';
import { amazonListingService } from '@/services/amazonListingService';
import type { FileUpload } from '@/types/amazon-listing';

interface UseFileProcessingReturn {
  uploadedFiles: FileUpload[];
  isProcessing: boolean;
  error: string | null;
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  processFiles: (sessionId: string) => Promise<string>;
  clearFiles: () => void;
}

const MAX_FILES = 10;
const ALLOWED_TYPES = ['.csv', '.txt'];

export function useFileProcessing(): UseFileProcessingReturn {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return ALLOWED_TYPES.includes(extension);
  };

  const addFiles = useCallback((files: File[]) => {
    setError(null);

    if (uploadedFiles.length + files.length > MAX_FILES) {
      setError(`Máximo de ${MAX_FILES} arquivos permitidos`);
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length !== files.length) {
      setError('Apenas arquivos CSV e TXT são permitidos');
      return;
    }

    Promise.all(
      validFiles.map(async (file) => {
        const content = await readFileAsText(file);
        return {
          id: generateFileId(),
          name: file.name,
          content,
          size: file.size
        };
      })
    ).then(newFiles => {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }).catch(() => {
      setError('Erro ao processar arquivos');
    });
  }, [uploadedFiles.length]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const processFiles = useCallback(async (sessionId: string): Promise<string> => {
    if (uploadedFiles.length === 0) {
      throw new Error('Nenhum arquivo para processar');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const files = uploadedFiles.map(f => new File([f.content], f.name));
      const result = await amazonListingService.processFiles(sessionId, files);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles]);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
  }, []);

  return {
    uploadedFiles,
    isProcessing,
    error,
    addFiles,
    removeFile,
    processFiles,
    clearFiles
  };
}

// Utility functions
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsText(file);
  });
}

function generateFileId(): string {
  return Math.random().toString(36).substring(7);
}