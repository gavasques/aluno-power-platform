
import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${fallbackClassName || className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Imagem não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="animate-pulse">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => {
          console.error('Erro ao carregar imagem:', src);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          console.log('Imagem carregada com sucesso:', src);
          setIsLoading(false);
        }}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};
