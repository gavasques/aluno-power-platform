import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_VALIDATION } from "@/config/upscale";
import type { UploadedImage } from "@/types/upscale";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  uploadedImage: UploadedImage | null;
  onRemoveImage: () => void;
  isUploading: boolean;
}

const UploadedImageDisplay = ({ 
  image, 
  onRemove, 
  onChange, 
  isUploading 
}: {
  image: UploadedImage;
  onRemove: () => void;
  onChange: () => void;
  isUploading: boolean;
}) => (
  <div className="space-y-4">
    <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Upload className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-green-800">Imagem carregada</div>
            <div className="text-sm text-green-600">{image.name}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onChange}
            disabled={isUploading}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Trocar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={isUploading}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const FileUploadZone = ({
  isDragging,
  isUploading,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick
}: {
  isDragging: boolean;
  isUploading: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary",
      isUploading && "pointer-events-none opacity-50"
    )}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-4">
      {isUploading ? (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div>
            <p className="text-lg font-medium">Fazendo upload...</p>
            <p className="text-sm text-muted-foreground">Processando sua imagem</p>
          </div>
        </>
      ) : (
        <>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, JPEG, WEBP até 25MB
            </p>
          </div>
        </>
      )}
    </div>
  </div>
);

const ValidationInfo = () => (
  <div className="text-xs text-muted-foreground space-y-1">
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 bg-green-500 rounded-full" />
      <span>Formatos: PNG, JPG, JPEG, WEBP</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 bg-green-500 rounded-full" />
      <span>Tamanho máximo: 25MB</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 bg-green-500 rounded-full" />
      <span>Resolução mínima: 64x64 pixels</span>
    </div>
  </div>
);

export function ImageUploader({ 
  onFileSelect, 
  uploadedImage, 
  onRemoveImage, 
  isUploading 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleRemoveWithCleanup = () => {
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedImage?.url) {
    return (
      <UploadedImageDisplay
        image={uploadedImage}
        onRemove={handleRemoveWithCleanup}
        onChange={handleClick}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_VALIDATION.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <FileUploadZone
        isDragging={isDragging}
        isUploading={isUploading}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      />

      <ValidationInfo />
    </div>
  );
}